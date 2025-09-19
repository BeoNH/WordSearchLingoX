import { _decorator, Component, Label, Layout, Node, RichText, UITransform } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('PopupRules')
export class PopupRules extends Component {

    @property(Label)
    lbTopic: Label = null;
    @property(Label)
    lbSubTopic1: Label = null;
    @property(Label)
    lbSubTopic2: Label = null;
    @property(RichText)
    txtDesc: RichText = null;

    @property(Label)
    lbCompleted: Label = null;
    @property(Label)
    lbLegendrary: Label = null;

    onLoad() {
        this.lbTopic.string = GameManager.data.topic ?? "";
        this.lbSubTopic1.string = GameManager.data.subTopics[0] ?? "";
        this.lbSubTopic2.string = GameManager.data.subTopics[1] ?? "";
        this.txtDesc.string = `<b>Description:<b> \n${GameManager.data.description ?? ""}`;

        this.lbCompleted.string = `${GameManager.data.config.passing_score}`;
        this.lbLegendrary.string = `${GameManager.data.config.mastery_threshold}`;
    }
}


