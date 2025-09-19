import { _decorator, Color, Component, instantiate, Label, Node, Prefab, SkeletalAnimation, Skeleton, sp, Sprite, SpriteFrame, tween, UITransform } from 'cc';
import { WordSearch } from './WordSearch';
import { NumberScrolling } from './NumberScrolling';
import { GameManager } from './GameManager';
import { ItemReportProgress } from './ItemReportProgress';
import { APIManager } from './APIManager';
import { UIControler } from './UIControler';
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
        const { totalTime, maps } = WordSearch.Instance.getDataGameOver();

        // Cập nhật thời gian
        this.timeLabelOver.node.parent.active = totalTime !== 0;
        if (GameManager.data.options.isCountdownMode) {
            const minutes = Math.floor((totalTime % 3600) / 60);
            const seconds = totalTime % 60;
            this.timeLabelOver.string = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }

        // Cập nhật kỹ năng (chưa có code)

        // Cập nhật đáp án
        let totalCorrect = 0;
        let totalQuestions = 0;
        maps.forEach((mapData) => {
            totalQuestions += mapData.wordAnswers.length;
            totalCorrect += mapData.discoveredWords.filter(Boolean).length;
        });
        this.answerLabel.string = `${totalCorrect}/${totalQuestions}`;

        // Cập nhật điểm
        const score = Number((totalCorrect * 100 / totalQuestions).toFixed(2));
        this.scheduleOnce(() => {
            this.scoreScrolling.to(score);
        }, 1.5);

        this.saveScore(totalCorrect,totalTime,score);
        this.calculateSkillScores(score);
        this.calculateAchievement(score, totalQuestions);
        this.renderReport(maps);
    }

    /**
     * Tính toán và trả về mốc điểm người chơi đạt được
     */
    private calculateAchievement(currentScore: number, totalQuestions: number) {
        // const maxValue = Number((totalQuestions * GameManager.data.options.bonusScore).toFixed(2));
        // const percentage = (currentScore / maxValue) * 100;
        const percentage = GameManager.data.config.passing_score ?? 0;
        const threshold = GameManager.data.config.mastery_threshold ?? 0;

        const emoji = this.resultNode.getChildByPath(`emoj`).getComponent(sp.Skeleton);
        const missingPoint = this.resultNode.getChildByPath(`missingPoint`);
        const confenti = this.resultNode.getChildByPath(`confenti`);
        const labelScore = this.resultNode.getChildByPath(`Score/LabelScore`).getComponent(Label);

        if (currentScore >= threshold) {
            emoji.setAnimation(0, `WOW`);
            missingPoint.active = false;
            confenti.active = true;
            labelScore.string = `LEGENDARY`;
            this.resultNode.getComponent(Sprite).color = new Color().fromHEX(`#CECE3C`);
        } else if (currentScore >= percentage) {
            emoji.setAnimation(0, `FUNNY`);
            missingPoint.active = true;
            missingPoint.getChildByPath(`LabelScoreMiss`).getComponent(Label).string = `+${(threshold - currentScore).toFixed(2)}`;
            missingPoint.getChildByPath(`LabelMiss`).getComponent(Label).string = `TO LEGENDARY`;
            confenti.active = true;
            labelScore.string = `COMPLETED`;
            this.resultNode.getComponent(Sprite).color = new Color().fromHEX(`#4BB7DA`);
        } else {
            emoji.setAnimation(0, `SAD`);
            missingPoint.active = true;
            missingPoint.getChildByPath(`LabelScoreMiss`).getComponent(Label).string = `+${(percentage - currentScore).toFixed(2)}`;
            missingPoint.getChildByPath(`LabelMiss`).getComponent(Label).string = `TO COMPLETED`;
            confenti.active = false;
            labelScore.string = `KEEP GOING`;
            this.resultNode.getComponent(Sprite).color = new Color().fromHEX(`#9B9B9B`);
        }
    }

    /**
     * Tính toán và cập nhật điểm số cho từng kỹ năng dựa trên kết quả chơi
     */
    private calculateSkillScores(score: number) {
        let point = score;
        [
            { key: "listening", persent: GameManager.data.config.listening_skill_percent },
            { key: "reading", persent: GameManager.data.config.reading_skill_percent },
            { key: "writing", persent: GameManager.data.config.writing_skill_percent },
            { key: "speaking", persent: GameManager.data.config.speaking_skill_percent },
            { key: "grammar", persent: GameManager.data.config.grammar_skill_percent },
            { key: "vocabulary", persent: GameManager.data.config.vocabulary_skill_percent },
        ].forEach(e => {
            let progress = this.skillNode.getChildByName(e.key).getComponent(ItemReportProgress);
            let scoreValue = Number((e.persent * point / 100).toFixed(2));
            if (e.key == "vocabulary") {
                scoreValue = Number(point.toFixed(2));
            } else {
                point -= scoreValue;
            }

            progress.node.active = e.persent > 0;
            progress.setValue(scoreValue, point);
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
        const btnV = e.currentTarget.getChildByPath(`V`);
        btnV.angle = heghtNew !== 0 ? 0 : -90;

        if (heghtNew !== 0) {
            tween(UITr)
                .stop()
                .to(0.8, { height: heghtNew }, { easing: 'sineOut' })
                .start();
        } else {
            UITr.height = 0;
        }
    }
    /**
     * Lưu điểm lên sever
     */
    private saveScore(correct, time, score) {
        let data = {
            "correct_answer": correct,
            "time_play": Math.round(time),
            "score": score,
            "game_id": APIManager.GID,
        }

        APIManager.requestData('POST', `/webhook/game/user-game/`, data, res => {
            if (!res) {
                UIControler.instance.onMess(`Loading game data failed \n. . .\n ${res?.message}`);
                return;
            }
        });
    }

    /**
     * Chuyển tiếp chế độ
     */
    public onContinue() {
        window.parent.postMessage('goToLearnPath', '*');
    }
}


