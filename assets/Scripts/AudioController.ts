import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    public static Instance: AudioController;

    @property({ type: Node, tooltip: "iconInMenu" })
    private iconMenu: Node = null;
    @property({ type: Node, tooltip: "iconInGame" })
    private iconGame: Node = null;

    volume = 1;

    protected onLoad(): void {
        AudioController.Instance = this;
    }

    Click() {
        this.volume == 1 ? this.volume = 0 : this.volume = 1;
        this.node.children.forEach(e => e.getComponent(AudioSource).volume = this.volume)
    }

    protected update(dt: number): void {
        this.iconMenu.children[0].active = this.volume == 0;
        this.iconGame.children[0].active = this.volume == 0;
    }

    A_Click() {
        this.node.getChildByName("click").getComponent(AudioSource).play();
    }

    Clear() {
        this.node.getChildByName("clear").getComponent(AudioSource).play();
    }

    Correct() {
        this.node.getChildByName("correct").getComponent(AudioSource).play();
    }

    timeOver_False() {
        this.node.getChildByName("timeOver").getComponent(AudioSource).play();
    }

    gameWin() {
        this.node.getChildByName("game-win").getComponent(AudioSource).play();
    }

    gameOver() {
        this.node.getChildByName("game_over").getComponent(AudioSource).play();
    }

}


