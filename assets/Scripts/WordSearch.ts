import { _decorator, Color, Component, EventTouch, Input, input, instantiate, Label, Node, Prefab, Sprite, UITransform, Vec3, Graphics, tween, v3, assetManager, ImageAsset, SpriteFrame, Texture2D } from 'cc';
import { GameManager } from './GameManager';
import { UIControler } from './UIControler';
import { APIManager } from './APIManager';
import { MapControler } from './MapControler';
import { AudioController } from './AudioController';
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
    @property({ type: Node, tooltip: "Node chứa mode Time" })
    public modeTimeUI: Node = null;
    @property({ type: Node, tooltip: "Node chứa mode Page" })
    public modePageUI: Node = null;
    @property({ type: Label, tooltip: "Trang đang hiện thị" })
    public numPage: Label = null;
    @property({ type: Prefab, tooltip: "Map mẫu để sinh ra các map con" })
    public wordSearchMapPrefab: Prefab = null;
    @property({ type: Node, tooltip: "Màn chờ lúc chạy hiệu ứng" })
    public waitMask: Node = null;
    @property({ type: Node, tooltip: "Màn chờ lúc chạy ảnh và vid" })
    public blockMask: Node = null;

    private mapNodes: Node[] = [];
    private currentMapIndex: number = 0;
    private totalTimer: number = null;
    private timeInterval: number = null;
    private isTransitioning: boolean = false;
    public totalTime: number = 0;
    public remainingTime: number = 0;
    public currentScore: number = 0;


    onLoad() {
        WordSearch.Instance = this;
        speechSynthesis.getVoices();

        if (this.timeLabel) this.timeLabel.string = '0';
        if (this.scoreLabel) this.scoreLabel.string = '0';
    }

    protected onDisable(): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        if (this.totalTimer) {
            clearInterval(this.totalTimer);
            this.totalTimer = null;
        }
        if (this.timeLabel) this.timeLabel.string = '0';
        if (this.scoreLabel) this.scoreLabel.string = '0';
    }

    initGame() {
        // Xoá các map cũ nếu có
        this.mapNodes.forEach(node => node.destroy());
        this.mapNodes = [];

        // Tạo map mới
        for (let i = 0; i < GameManager.data.questions.length; i++) {
            const mapNode = instantiate(this.wordSearchMapPrefab);
            mapNode.parent = this.node;
            mapNode.setSiblingIndex(0);
            const mapComp = mapNode.getComponent(MapControler);
            mapComp.initMap(i);

            mapNode.active = (i === 0);
            this.mapNodes.push(mapNode);
        }
        this.currentMapIndex = 0;
        this.showMap(0);

        // Khởi tạo số liệu ban đầu
        this.currentScore = 0;
        this.totalTime = 0;
        this.remainingTime = GameManager.data.options.timeLimit;
        this.updateScoreDisplay(this.currentScore);
        this.updateTimeDisplay();

        // Chế độ chơi
        if (GameManager.data.options.isCountdownMode) {
            this.startTotalTimer();
            this.startTimer();
        }
        this.modeTimeUI.active = GameManager.data.options.isCountdownMode;
        this.modePageUI.active = !GameManager.data.options.isCountdownMode;
    }



    //=============== XỬ LÝ LOGIC GAME ===============//

    /**
     * Bắt đầu đếm thời gian Map
     */
    private startTimer() {
        this.remainingTime = GameManager.data.options.timeLimit;
        this.timeInterval = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                this.updateTimeDisplay();
            } else {
                this.endGame();
            }
        }, 1000);
    }


    /**
     * Bắt đầu đếm thời gian Tổng
     */
    public startTotalTimer() {
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


    /**
     * Cập nhật hiển thị thời gian
     */
    public updateTimeDisplay() {
        this.timeLabel.string = `${this.remainingTime}`;
    }

    /**
     * Cập nhật hiển thị điểm số
     */
    public updateScoreDisplay(number) {
        const newScore = this.currentScore + number;
        this.currentScore = newScore >= 0 ? newScore : 0;
        this.scoreLabel.string = `${this.currentScore}`;
        if (this.currentScore > 0) this.showBonusEffect(number);
    }

    public getDataGameOver() {
        return {
            // score: this.currentScore,
            totalTime: this.totalTime,
            maps: this.mapNodes.map(map => {
                const mapComp = map.getComponent(MapControler);
                if (mapComp) {
                    return {
                        wordAnswers: mapComp.wordAnswers,
                        discoveredWords: mapComp.discoveredWords
                    };
                } else {
                    return null;
                }
            }).filter(mapData => mapData !== null)
        };
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

    /**
     * Hiệu ứng chuyển trang map
     */
    private transitionMap(prevNode: Node, nextNode: Node, direction: 'left' | 'right', onComplete: () => void) {
        const centerPos = v3(0, 0, 0);
        const leftPos = v3(-1500, 0, 0);
        const rightPos = v3(1500, 0, 0);

        nextNode.active = true;
        nextNode.setPosition(direction === 'right' ? rightPos : leftPos);

        tween(prevNode)
            .to(0.5, { position: direction === 'right' ? leftPos : rightPos })
            .call(() => {
                prevNode.active = false;
            })
            .start();

        tween(nextNode)
            .to(0.5, { position: centerPos })
            .call(() => {
                onComplete && onComplete();
            })
            .start();
    }



    //=============== XỬ LÝ BUTTON ===============//
    // Chuyển trang
    public showMap(index: number) {
        if (this.isTransitioning) return;
        const prevIndex = this.currentMapIndex;
        const nextIndex = index;
        this.numPage.string = `Page: ${nextIndex + 1}/${this.mapNodes.length}`;
        this.numPage.node.parent.active = this.mapNodes.length > 1;

        if (!GameManager.data.options.isCountdownMode) {
            const btnDonePage = this.modePageUI.getChildByPath('btnDonePage');
            const btnNextPage = this.modePageUI.getChildByPath('btnNextPage');
            const btnPrevPage = this.modePageUI.getChildByPath('btnPrevPage');
            btnNextPage.active = (this.mapNodes.length > 1);
            btnPrevPage.active = (this.mapNodes.length > 1);

            if (this.mapNodes.length > 1) {
                btnDonePage.active = (index === this.mapNodes.length - 1);

                btnNextPage.getComponent(Sprite).grayscale = (index === this.mapNodes.length - 1);
                btnPrevPage.getComponent(Sprite).grayscale = (index === 0);

                if (index > 0 && index < this.mapNodes.length - 1) {
                    btnNextPage.getComponent(Sprite).grayscale = false;
                    btnPrevPage.getComponent(Sprite).grayscale = false;
                }
            }
        }

        if (prevIndex === nextIndex) return;

        this.isTransitioning = true;
        const prevNode = this.mapNodes[prevIndex];
        const nextNode = this.mapNodes[nextIndex];
        const direction = nextIndex > prevIndex ? 'right' : 'left';

        this.transitionMap(prevNode, nextNode, direction, () => {
            this.currentMapIndex = nextIndex;
            this.isTransitioning = false;
        });
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
    public onOutGame(): void {
        AudioController.Instance.A_Click();
        UIControler.instance.onOpen(null, 'out', this.currentScore);
    }


    //=============== XỬ LÝ KẾT THÚC GAME ===============//
    /**
     * Kết thúc game
     */
    private onClick = false;
    public endGame(): void {
        if (this.onClick) return;
        this.onClick = true
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
            AudioController.Instance.timeOver_False();
        }


        if (this.currentMapIndex < this.mapNodes.length - 1) {
            this.showMap(this.currentMapIndex + 1);
            if (GameManager.data.options.isCountdownMode) {
                this.startTimer();
            }
            return;
        }


        if (this.totalTimer) {
            clearInterval(this.totalTimer);
            this.totalTimer = null;
        }

        this.scheduleOnce(() => {
            this.onClick = false;
            AudioController.Instance.gameWin();
            UIControler.instance.onOpen(null, 'over');
        }, 0.5)
    }
}
