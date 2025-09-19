import { _decorator, AudioClip, AudioSource, Component, game, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

resources.load<AudioClip>("Sounds/silent", (err, data) => {
    if (data) {
        console.warn(`[AudioManager] ⚠️ silent loaded`);
        const cb = (event) => {
            //Audio chạy ngầm
            console.log("👆 Đã chạm vào màn hình!", event);
            game.canvas.removeEventListener('touchend', cb);
            game.canvas.removeEventListener('mouseup', cb);

            const audio = new Audio(data.nativeUrl);
            audio.loop = true;
            audio.volume = 1;
            audio.play().then(() => {
                console.warn(`[AudioManager] ⚠️ play silent`);
            }).catch(err => {
                console.warn(`[AudioManager] ⚠️ play silent failed: ${err}`);
            });

            // Bắt test read của GG
            const text = "";
            const voices = window.speechSynthesis.getVoices();
            const speech = new SpeechSynthesisUtterance(text);
            speech.voice = voices.find(voice => voice.lang.includes("en-US")) || voices.find(voice => voice.lang.includes("en")) || voices[0];
            speech.lang = "en-US";
            // speech.volume = 1;
            speech.rate = 0.8; // Tốc độ đọc (1 là bình thường)
            // speech.pitch = 1; // Cao độ giọng đọc (1 là mặc 
        
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(speech);
        };
        game.canvas.addEventListener('touchend', cb, { once: true, passive: true });
        game.canvas.addEventListener('mouseup', cb, { once: true, passive: true });
    }
});


@ccclass('AudioController')
export class AudioController extends Component {
    public static Instance: AudioController;

    @property({ type: Node, tooltip: "iconInMenu" })
    private iconMenu: Node = null;
    @property({ type: Node, tooltip: "iconInGame" })
    private iconGame: Node = null;

    volume = 0;

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


