import { _decorator, Color, Component, instantiate, Label, Node, Prefab, SkeletalAnimation, Skeleton, sp, Sprite, SpriteFrame, tween, UITransform } from 'cc';
import { WordSearch } from './WordSearch';
import { NumberScrolling } from './NumberScrolling';
import { GameManager } from './GameManager';
import { ItemReportProgress } from './ItemReportProgress';
const { ccclass, property } = _decorator;

@ccclass('PopupGameOver')
export class PopupGameOver extends Component {

    @property({ type: Node, tooltip: "Node chứa kết quả game" })
    private resultNode: Node = null;

    @property({ type: Node, tooltip: "Node chứa các điểm skill" })
    private skillNode: Node = null;

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

    // @property({ type: SpriteFrame, tooltip: "nền cho câu đúng" })
    // private spriteCorrect: SpriteFrame = null;
    // @property({ type: SpriteFrame, tooltip: "nền cho câu sai" })
    // private spriteWrong: SpriteFrame = null;

    @property({ type: SpriteFrame, tooltip: "ký hiệu câu đúng" })
    private iconCorrect: SpriteFrame = null;
    @property({ type: SpriteFrame, tooltip: "ký hiệu câu sai" })
    private iconWrong: SpriteFrame = null;


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
        this.calculateAchievement(score);

        // Cập nhật thời gian
        this.timeLabelOver.node.parent.active = totalTime !== 0;
        if (GameManager.isCountdownMode) {
            const minutes = Math.floor((totalTime % 3600) / 60);
            const seconds = totalTime % 60;
            this.timeLabelOver.string = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }

        // Cập nhật kỹ năng (chưa có code)
        this.calculateSkillScores();

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

    /**
     * Tính toán và trả về mốc điểm người chơi đạt được
     */
    private calculateAchievement(currentScore: number) {
        const maxValue = Number((GameManager.numMap * GameManager.bonusScore * 5).toFixed(2));
        const percentage = (currentScore / maxValue) * 100;

        const emoji = this.resultNode.getChildByPath(`emoj`).getComponent(sp.Skeleton);
        const missingPoint = this.resultNode.getChildByPath(`missingPoint`);
        const confenti = this.resultNode.getChildByPath(`confenti`);
        const labelScore = this.resultNode.getChildByPath(`Score/LabelScore`).getComponent(Label);

        if (percentage == 100) {
            emoji.setAnimation(0, `WOW`);
            missingPoint.active = false;
            confenti.active = true;
            labelScore.string = `LEGENDARY`;
            this.resultNode.getComponent(Sprite).color = new Color().fromHEX(`#CECE3C`);
        } else if (percentage >= 70) {
            emoji.setAnimation(0, `FUNNY`);
            missingPoint.active = true;
            missingPoint.getChildByPath(`LabelScoreMiss`).getComponent(Label).string = `+${(maxValue - currentScore).toFixed(2)}`;
            missingPoint.getChildByPath(`LabelMiss`).getComponent(Label).string = `TO LEGENDARY`;
            confenti.active = true;
            labelScore.string = `COMPLETED`;
            this.resultNode.getComponent(Sprite).color = new Color().fromHEX(`#4BB7DA`);
        } else {
            emoji.setAnimation(0, `SAD`);
            missingPoint.active = true;
            missingPoint.getChildByPath(`LabelScoreMiss`).getComponent(Label).string = `+${(maxValue * 0.7 - currentScore).toFixed(2)}`;
            missingPoint.getChildByPath(`LabelMiss`).getComponent(Label).string = `TO COMPLETED`;
            confenti.active = false;
            labelScore.string = `KEEP GOING`;
            this.resultNode.getComponent(Sprite).color = new Color().fromHEX(`#9B9B9B`);
        }
    }

    /**
     * Tính toán và cập nhật điểm số cho từng kỹ năng dựa trên kết quả chơi
     */
    private calculateSkillScores() {
        const maxValue = Number((GameManager.numMap * GameManager.bonusScore * 5).toFixed(2));
        let point = maxValue;
        [
            { key: "listening", persent: 10 },
            { key: "reading", persent: 30 },
            { key: "writing", persent: 0 },
            { key: "speaking", persent: 0 },
            { key: "grammar", persent: 0 },
            { key: "vocabulary", persent: 60 },
        ].forEach(e => {
            let progress = this.skillNode.getChildByName(e.key).getComponent(ItemReportProgress);
            let scoreValue = Number((e.persent * maxValue / 100).toFixed(2));
            if (e.key == "vocabulary") {
                scoreValue = Number(point.toFixed(2));
            } else {
                point -= scoreValue;
            }

            progress.node.active = e.persent > 0;
            progress.setValue(scoreValue, maxValue);
        });
    }


    /**
     * Hiển thị báo cáo kết quả của người chơi
     * @param maps Mảng chứa dữ liệu các trang game
     */
    public renderReport(maps: any[]) {
        this.viewReport.removeAllChildren();

        maps.forEach((mapData, mapIndex) => {
            const pageNode = instantiate(this.pagePrefab);
            pageNode.parent = this.viewReport;
            pageNode.getChildByPath(`num`).getComponent(Label).string = `Page ${mapIndex + 1}`;

            const itemRoot = pageNode.children[1];

            let isSwapColer = false;
            mapData.wordAnswers.forEach((word: string, i: number) => {
                const isDiscovered = mapData.discoveredWords[i];

                const itemNode = instantiate(itemRoot);
                itemNode.parent = pageNode;
                itemNode.active = true;

                const label = itemNode.getChildByName("Label")?.getComponent(Label);
                if (label) label.string = word;

                // const bg = itemNode.getChildByName("BG")?.getComponent(Sprite);
                // if (bg) bg.spriteFrame = isDiscovered ? this.spriteCorrect : this.spriteWrong;

                const bg = itemNode.getChildByName("BG")?.getComponent(Sprite);
                const icon = itemNode.getChildByName("icon")?.getComponent(Sprite);
                if (icon) icon.spriteFrame = isDiscovered ? this.iconCorrect : this.iconWrong;
                if (bg) bg.color = isDiscovered ? (isSwapColer ? new Color().fromHEX("#83c6ff") : new Color().fromHEX("#6185ed")) : (isSwapColer ? new Color().fromHEX("#ff8383") : new Color().fromHEX("#fc6161"));
                isSwapColer = !isSwapColer;
            });

        })
    }

    //==================== Xử lý các button ====================//
    /**
     * Hiển thị báo cáo kết quả của người chơi
     * @param e Sự kiện click
     * @param str Chuỗi tham số
     */
    public showReport(e, str) {
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
}


