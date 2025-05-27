import { _decorator, Color, Component, EventTouch, Input, input, instantiate, Label, Node, Prefab, Sprite, UITransform, Vec3, Graphics, tween, v3, assetManager, ImageAsset, SpriteFrame, Texture2D } from 'cc';
import { GameManager } from './GameManager';
import { UIControler } from './UIControler';
import { APIManager } from './APIManager';
import { MapControler } from './MapControler';
const { ccclass, property } = _decorator;

/**
 * Class WordSearch - Core xử lý game Word Search
 * 
 * Tính năng chính:
 * - Hiển thị lưới với các ký tự từ data mẫu
 * - Xử lý tương tác kéo thả của người chơi
 * - Bôi màu các ô được chọn theo hướng kéo
 * - Hỗ trợ kéo theo 8 hướng: ngang, dọc, chéo
 */

@ccclass('WordSearch')
export class WordSearch extends Component {
    public static Instance: WordSearch;
    @property({ readonly: true, editorOnly: true, serializable: false })
    private HEADER_UI: string = "========== UI ELEMENTS ==========";
    @property({ type: Label, tooltip: "Label hiển thị thời gian" })
    public timeLabel: Label = null;
    @property({ type: Label, tooltip: "Label hiển thị tổng thời gian" })
    public timeTotalLabel: Label = null;
    @property({ type: Label, tooltip: "Label hiển thị điểm số" })
    public scoreLabel: Label = null;
    @property({ type: Prefab, tooltip: "Map mẫu để sinh ra các map con" })
    public wordSearchMapPrefab: Prefab = null;
    @property({ type: Node, tooltip: "Màn chờ lúc chạy hiệu ứng" })
    public waitMask: Node = null;

    public isCountdownMode: boolean = true;

    private mapNodes: Node[] = [];
    private currentMapIndex: number = 0;
    private totalTime: number = 0;
    private totalTimer: any = null;

    public remainingTime: number = 0;
    public currentScore: number = 0;


    onLoad() {
        WordSearch.Instance = this;
        speechSynthesis.getVoices();

        if (this.timeLabel) this.timeLabel.string = '0s';
        if (this.scoreLabel) this.scoreLabel.string = '0';
    }

    protected onDisable(): void {
        if (this.timeLabel) this.timeLabel.string = '0s';
        if (this.scoreLabel) this.scoreLabel.string = '0';
    }

    initGame() {
        // Xoá các map cũ nếu có
        this.mapNodes.forEach(node => node.destroy());
        this.mapNodes = [];

        // Tạo map mới
        for (let i = 0; i < GameManager.numMap; i++) {
            const mapNode = instantiate(this.wordSearchMapPrefab);
            mapNode.parent = this.node;
            mapNode.setSiblingIndex(1);
            const mapComp = mapNode.getComponent(MapControler);
            mapComp.initMap();

            mapNode.active = (i === 0);
            this.mapNodes.push(mapNode);
        }
        this.currentMapIndex = 0;

        // Khởi tạo số liệu ban đầu
        this.remainingTime = GameManager.timeLimit;
        this.currentScore = GameManager.initScore;
        WordSearch.Instance.updateScoreDisplay(this.currentScore);
        WordSearch.Instance.updateTimeDisplay();

        this.startTotalTimer();
    }

    //=============== XỬ LÝ LOGIC GAME ===============//

    public startTotalTimer() {
        if (this.isCountdownMode) {
            this.totalTime = 0;
            this.timeTotalLabel.string = '00:00:00';
            this.totalTimer = setInterval(() => {
                this.totalTime++;
                const hours = Math.floor(this.totalTime / 3600);
                const minutes = Math.floor((this.totalTime % 3600) / 60);
                const seconds = this.totalTime % 60;
                this.timeTotalLabel.string = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            }, 1000);
        }
    }

    public stopTotalTimer() {
        if (this.totalTimer) {
            clearInterval(this.totalTimer);
            this.totalTimer = null;
        }
    }


    /**
     * Cập nhật hiển thị thời gian
     */
    public updateTimeDisplay() {
        this.timeLabel.string = `${this.remainingTime}s`;
    }

    /**
     * Cập nhật hiển thị điểm số
     */
    public updateScoreDisplay(number) {
        const newScore = this.currentScore + number;
        this.currentScore = newScore >= 0 ? newScore : 0;
        this.scoreLabel.string = `${this.currentScore}`;
        this.showBonusEffect(number);

        if (this.currentScore <= 0) {
            this.endGame();
        }
    }



    //=============== XỬ LÝ HIỆU ỨNG HOẠT ẢNH ===============//
    /**
     * Hiệu ứng cộng điểm
     */
    private showBonusEffect(bonus: number, target?: Node) {
        const OFFSET_Y1 = 80;
        const OFFSET_Y2 = 40;
        const startPos = target ? target.getWorldPosition().clone() : this.scoreLabel.node.getWorldPosition().clone();

        const initPos = bonus >= 0 ? startPos.clone().add(v3(0, -OFFSET_Y1, 0)) : startPos.clone().add(v3(0, -OFFSET_Y2, 0));
        const targetPos = startPos.clone().add(v3(0, bonus >= 0 ? -OFFSET_Y2 : -OFFSET_Y1, 0));

        const bonusNode = new Node("BonusEffect");
        bonusNode.parent = this.node;
        bonusNode.setWorldPosition(initPos);

        const bonusLabel = bonusNode.addComponent(Label);
        bonusLabel.string = bonus >= 0 ? `+${bonus}` : `${bonus}`;
        bonusLabel.color = bonus >= 0 ? new Color(0, 255, 0) : new Color(255, 0, 0);
        bonusLabel.fontSize = 40;
        bonusLabel.lineHeight = 50;
        bonusLabel.isBold = true;
        bonusLabel.enableOutline = true;
        bonusLabel.outlineColor = new Color(255, 255, 255);
        bonusLabel.enableShadow = true;
        bonusLabel.shadowColor = new Color(56, 56, 56);

        tween(bonusNode)
            .to(0.8, { worldPosition: targetPos })
            .call(() => {
                bonusNode.destroy();
            })
            .start();
    }



    //=============== XỬ LÝ BUTTON ===============//
    /**
    * Thoát game và hiển thị popup xác nhận
    */
    public onOutGame(): void {
        UIControler.instance.onOpen(null, 'out', this.currentScore);
    }


    // Chuyển trang
    public showMap(index: number) {
        this.mapNodes.forEach((node, i) => node.active = (i === index));
        this.currentMapIndex = index;
    }

    public nextMap() {
        if (this.currentMapIndex < this.mapNodes.length - 1) {
            this.showMap(this.currentMapIndex + 1);
        }
    }
    public prevMap() {
        if (this.currentMapIndex > 0) {
            this.showMap(this.currentMapIndex - 1);
        }
    }



    //=============== XỬ LÝ KẾT THÚC GAME ===============//
    /**
     * Kết thúc game
     */
    private endGame(): void {
        this.stopTotalTimer();
        UIControler.instance.onOpen(null, 'over', this.currentScore);
    }
}
