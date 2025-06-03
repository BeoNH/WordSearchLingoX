import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, UITransform } from 'cc';
import { WordSearch } from './WordSearch';
import { NumberScrolling } from './NumberScrolling';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PopupGameOver')
export class PopupGameOver extends Component {

    @property({ type: NumberScrolling, tooltip: "Component số chạy cho điểm trong popup game over" })
    private scoreScrolling: NumberScrolling = null;

    @property({ type: Label, tooltip: "Label hiển thị thời gian trong popup game over" })
    private timeLabelOver: Label = null;

    @property({ type: Label, tooltip: "Label hiển thị số câu trả lời đúng" })
    private answerLabel: Label = null;

    @property({ type: Node, tooltip: "Hiện thị báo cáo theo số câu trả lời đúng" })
    private viewReport: Node = null;

    @property({ type: Prefab, tooltip: "Page sinh ra" })
    private pagePrefab: Prefab = null;

    @property({ type: SpriteFrame, tooltip: "Ảnh đúng" })
    private spriteCorrect: SpriteFrame = null;
    @property({ type: SpriteFrame, tooltip: "Ảnh sai" })
    private spriteWrong: SpriteFrame = null;

    protected onDisable(): void {
        this.scoreScrolling.setValue(0);
        this.timeLabelOver.string = '0s';
    }

    /**
     * Hiển thị hiệu ứng game over và tính điểm
     */
    public showGameOver(): void {
        const { score, totalTime, maps } = WordSearch.Instance.getDataGameOver();

        // Cập nhật điểm
        if (score > 0) {
            this.scheduleOnce(() => {
                this.scoreScrolling.to(score);
            }, 1.5);
        }

        // Cập nhật thời gian
        this.timeLabelOver.node.parent.active = totalTime !== 0;
        if (GameManager.isCountdownMode) {
            const minutes = Math.floor((totalTime % 3600) / 60);
            const seconds = totalTime % 60;
            this.timeLabelOver.string = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }

        // Cập nhật kỹ năng (chưa có code)

        // Cập nhật đáp án
        console.log(maps);

        let totalCorrect = 0;
        let totalQuestions = 0;
        maps.forEach((mapData) => {
            totalQuestions += mapData.wordAnswers.length;
            totalCorrect += mapData.discoveredWords.filter(Boolean).length;
        });

        this.answerLabel.string = `${totalCorrect}/${totalQuestions}`;

        this.renderReport(maps);
    }

    public renderReport(maps: any[]) {
        this.viewReport.removeAllChildren();

        maps.forEach((mapData, mapIndex) => {
            const pageNode = instantiate(this.pagePrefab);
            pageNode.parent = this.viewReport;
            pageNode.getChildByPath(`num`).getComponent(Label).string = `Page ${mapIndex + 1}`;

            const itemRoot = pageNode.children[1];

            mapData.wordAnswers.forEach((word: string, i: number) => {
                const isDiscovered = mapData.discoveredWords[i];

                const itemNode = instantiate(itemRoot);
                itemNode.parent = pageNode;
                itemNode.active = true;

                const label = itemNode.getChildByName("Label")?.getComponent(Label);
                if (label) label.string = word;

                const bg = itemNode.getChildByName("BG")?.getComponent(Sprite);
                if (bg) bg.spriteFrame = isDiscovered ? this.spriteCorrect : this.spriteWrong;
            });

        })
    }

    public showReport() {
        const UITr = this.viewReport.parent.getComponent(UITransform);
        const heghtNew = UITr.height == 0 ? this.viewReport.getComponent(UITransform).height : 0;

        if (heghtNew !== 0) {
            tween(UITr)
                .stop()
                .to(0.8, { height: heghtNew }, { easing: 'sineOut' })
                .start();
        } else {
            UITr.height = 0;
        }
    }
    

    check() {
        // const maxValue = Number(Play.instance.point.toFixed(2));
        // let point = maxValue;
        // [
        //     { key: "listening", persent: Play.data.config.listening_skill_percent },
        //     { key: "reading", persent: Play.data.config.reading_skill_percent },
        //     { key: "writing", persent: Play.data.config.writing_skill_percent },
        //     { key: "speaking", persent: Play.data.config.speaking_skill_percent },
        //     { key: "grammar", persent: Play.data.config.grammar_skill_percent },
        //     { key: "vocabulary", persent: Play.data.config.vocabulary_skill_percent },
        // ].forEach(e => {
        //     let progress = this.node.getChildByName(e.key).getComponent(ItemReportProgress);
        //     let scoreValue = Number((e.persent * maxValue / 100).toFixed(2));
        //     if (e.key == "vocabulary") {
        //         scoreValue = Number(point.toFixed(2));
        //     } else {
        //         point -= scoreValue;
        //     }

        //     progress.setValue(scoreValue, maxValue);
        //     progress.node.active = e.persent > 0;
        // });
    }
}


