import { _decorator, assetManager, Component, ImageAsset, Node, SpriteFrame, Texture2D } from 'cc';
import { DEBUG } from 'cc/env';
import { UIControler } from './UIControler';
import { GameManager } from './GameManager';
import { MenuControler } from './MenuControler';
import { WordSearch } from './WordSearch';
import { APIManager } from './APIManager';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;


// if (!DEBUG) {
//     console.log = function () { };
// }


@ccclass('GameControler')
export class GameControler extends Component {
    public static Instance: GameControler;

    @property({ type: Node, tooltip: "scene Load tài nguyên" })
    private sceneLoadAsset: Node = null;
    @property({ type: Node, tooltip: "scene gamePlay" })
    private scenePlay: Node = null;
    @property({ type: Node, tooltip: "scene menu" })
    private sceneMenu: Node = null;

    onLoad() {
        GameControler.Instance = this;
        window.addEventListener("beforeunload", this.onBeforeUnload);

        this.sceneMenu.active = true;
        this.scenePlay.active = false;
        this.sceneLoadAsset.active = true;

        let data = {
            "game_id": APIManager.GID,
            "publish": APIManager.urlParam(`publish`)
        }

        // APIManager.requestData('GET', `/home-game-studio/client-game-studio-puzzle/${APIManager.urlParam(`gid`)}/?publish=${APIManager.urlParam(`publish`)}`, null, res => {
        APIManager.requestData('POST', `/webhook/game/lingox-getConfig/`, data, res => {
            if (!res) {
                UIControler.instance.onMess(`Loading game data failed \n. . .\n ${res?.message}`);
                return;
            }

            // GameManager.data = { ...GameManager.data, ...res.data };
            GameManager.data = { ...GameManager.data, ...res };

            MenuControler.Instance.loadTopics(() => {
                this.sceneLoadAsset.active = false;
            })
        });
    }
    // protected start(): void {
    //     MenuControler.Instance.loadTopics(() => {
    //         this.sceneLoadAsset.active = false;
    //     })
    // }

    onDestroy() {
        window.removeEventListener("beforeunload", this.onBeforeUnload);
    }

    // Kiểm tra đóng cửa sổ game
    private onBeforeUnload = (event: Event) => {
        console.log("Người chơi đang đóng cửa sổ hoặc làm mới trang.");
    }

    openMenu() {
        AudioController.Instance.A_Click();
        this.sceneMenu.active = true;
        this.scenePlay.active = false;
        // this.remainTurn();
    }

    async openGame() {
        AudioController.Instance.A_Click();
        let data = {
            "game_id": APIManager.GID,
            "publish": APIManager.urlParam(`publish`)
        }

        // APIManager.requestData('GET', `/home-game-studio/client-game-studio-puzzle/${APIManager.urlParam(`gid`)}/?publish=${APIManager.urlParam(`publish`)}`, null, res => {
        APIManager.requestData('POST', `/webhook/game/lingox-getQuestions`, data, res => {
            if (!res) {
                UIControler.instance.onMess(`Loading game data failed \n. . .\n ${res?.message}`);
                return;
            }

            GameManager.data.questions = res.data.data;

            this.sceneMenu.active = false;
            this.scenePlay.active = true;
            WordSearch.Instance.initGame();

            console.log(GameManager.data)
        });

        // this.sceneMenu.active = false;
        // this.scenePlay.active = true;
        // WordSearch.Instance.initGame();
    }


    /**
     * Tải SpriteFrame từ URL
     * @param url Đường dẫn URL của ảnh
     * @param cb Callback trả về SpriteFrame sau khi tải xong
     */
    public loadSpriteFrameFromUrl(url: string, cb: (sf: SpriteFrame) => void) {
        assetManager.loadRemote<ImageAsset>(url, { ext: ".png" }, (err, data) => {
            if (err || !data) {
                cb(null);
                return;
            }

            const texture = new Texture2D();
            texture.image = data;

            const sf = new SpriteFrame();
            sf.texture = texture;

            cb(sf);
        });
    }
}


