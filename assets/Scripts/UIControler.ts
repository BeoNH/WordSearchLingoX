import { _decorator, Component, Label, Node } from 'cc';
import { PopupSettingLevel } from './PopupSettingLevel';
import { PopupGameOver } from './PopupGameOver';
import { Popup } from './Popup';
const { ccclass, property } = _decorator;

@ccclass('UIControler')
export class UIControler extends Component {
    public static instance: UIControler = null;

    @property({ type: Node, tooltip: "Tính điểm" })
    private popupInfo: Node = null;
    @property({ type: Node, tooltip: "Luật chơi" })
    private popupGuid: Node = null;
    // @property({ type: Node, tooltip: "Bảng xếp hạng" })
    // private popupRank: Node = null;
    // @property({ type: Node, tooltip: "Lịch sử" })
    // private popupHistory: Node = null;
    @property({ type: Node, tooltip: "Cài đặt cấp độ chơi" })
    private popupSettingLevel: Node = null;

    @property({ type: Node, tooltip: "Xong game" })
    private popupGameOver: Node = null;
    @property({ type: Node, tooltip: "Thoát game" })
    private popupOutGame: Node = null;;

    @property({ type: Node, tooltip: "UI Mẫ lỗi Login" })
    private alertError: Node = null;

    protected onLoad(): void {
        UIControler.instance = this;
        this.onClose();
    }

    onOpen(e: any, str: string, num?: number) {
        this.onClose();

        switch (str) {
            case `info`:
                this.popupInfo.getComponent(Popup).onShow();
                break;
            case `guid`:
                this.popupGuid.getComponent(Popup).onShow();
                break;
            // case `rank`:
            //     this.popupRank.getComponent(Popup).onShow();
            //     this.popupRank.getComponent(PopupRank).initRankingList();
            //     break;
            // case `history`:
            //     this.popupHistory.getComponent(Popup).onShow();
            //     this.popupHistory.getComponent(PopupHistory).initHistoryList();
            //     break;
            case `Level`:
                this.popupSettingLevel.getComponent(Popup).onShow();
                this.popupSettingLevel.getComponent(PopupSettingLevel).initSettingList();
                break;
            case `over`:
                this.popupGameOver.getComponent(Popup).onShow();
                this.popupGameOver.getComponent(PopupGameOver).showGameOver();
                break;
            case `out`:
                this.popupOutGame.getComponent(Popup).onShow();
                let scoreLabel = this.popupOutGame.getChildByPath('content/Score/numScore')?.getComponent(Label);
                if (scoreLabel) {
                    scoreLabel.string = num.toString();
                }
                break;
        }
    }

    onClose() {
        this.popupInfo.active = false;
        this.popupGuid.active = false;
        // this.popupRank.active = false;
        // this.popupHistory.active = false;
        this.popupSettingLevel.active = false;
        this.popupGameOver.active = false;
        this.popupOutGame.active = false;
    }


    onMess(txt: string) {
        this.alertError.active = true;
        this.alertError.getChildByPath(`txt`).getComponent(Label).string = txt;
        this.scheduleOnce(() => {
            this.alertError.active = false;
        }, 1.5)
    }
}


