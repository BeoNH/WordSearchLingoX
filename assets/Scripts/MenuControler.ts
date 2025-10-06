import { _decorator, Component, Label, Node, Sprite, resources, SpriteFrame, Toggle } from 'cc';
import { GameManager } from './GameManager';
import { GameControler } from './GameControler';
import { Logo } from './Logo';
const { ccclass, property } = _decorator;

@ccclass('MenuControler')
export class MenuControler extends Component {
    public static Instance: MenuControler;

    @property({ type: SpriteFrame, tooltip: "Ảnh mặc định khi không tìm thấy ảnh trong Resources" })
    public defaultImage: SpriteFrame = null;

    @property({ type: Label, tooltip: "Label hiển thị level" })
    public labelLevel: Label = null;

    @property({ type: Label, tooltip: "Tên Chủ đề" })
    public labelToppic: Label = null;

    @property({ type: Sprite, tooltip: "Ảnh theo chủ đề" })
    public imageToppic: Sprite = null;

    @property({ type: Node, tooltip: "Tên chủ đề cho game" })
    public titleNode: Node = null;


    private numToppic: number = 0;
    private numLevel: number = 0;

    /** Mảng lưu trữ thông tin về các chủ đề (tên và ảnh) */
    private topics: { name: string, image: SpriteFrame }[] = [];

    protected onLoad(): void {
        MenuControler.Instance = this;
    }

    /**
     * Load tất cả ảnh chủ đề từ thư mục Resources
     * Tự động cập nhật hiển thị sau khi load xong
     */
    public loadTopics(cb: Function): void {
        this.updateLevelDisplay();
        this.updateTopicDisplay().then(()=>cb());
    }

    /**
     * Xử lý sự kiện khi người dùng chuyển đổi chủ đề
     * @param e - Event object
     * @param txt - Hướng chuyển đổi ("Right" hoặc "Left")
     */
    onNextToppic(e, txt: string) {
        // switch (txt) {
        //     case "Right":
        //         this.numToppic += 1;
        //         break;
        //     case "Left":
        //         this.numToppic -= 1;
        //         break;
        // }

        // this.numToppic = (this.numToppic + this.topics.length) % this.topics.length;
        // this.updateTopicDisplay();
    }

    /**
     * Cập nhật hiển thị chủ đề hiện tại
     * Hiển thị tên và ảnh của chủ đề được chọn
     */
    private async updateTopicDisplay(): Promise<void> {
        // if (this.topics.length === 0) return;

        // const currentTopic = this.topics[this.numToppic];
        // this.labelToppic.string = currentTopic.name;
        // this.imageToppic.spriteFrame = currentTopic.image || this.defaultImage;

        let linkLogo = GameManager.data.themeConfig.logo_main.trim();
        let linkTitle = GameManager.data.themeConfig.title_game.trim();

        // Load logo_main
        const loadLogo = new Promise<void>((resolve) => {
            if ((linkLogo?.length ?? 0) > 0) {
                GameControler.Instance.loadSpriteFrameFromUrl(linkLogo, sprt => {
                    this.imageToppic.spriteFrame = sprt || this.defaultImage;
                    resolve();
                });
            } else {
                this.imageToppic.spriteFrame = this.defaultImage;
                resolve();
            }
        });


        // Load title_game
        const loadTitle = new Promise<void>((resolve) => {
            this.titleNode.children.forEach(child => child.active = false);

            if ((linkTitle?.length ?? 0) > 0) {
                GameControler.Instance.loadSpriteFrameFromUrl(linkTitle, sprt => {
                    this.titleNode.getChildByPath(`Image`).getComponent(Sprite).spriteFrame = sprt;
                    this.titleNode.getChildByPath(`Image`).active = true;
                    resolve();
                });
            } else {
                this.titleNode.getChildByPath(`logoText`).active = true;
                // this.titleNode.getChildByPath(`Label`).getComponent(Logo).convertTextLogo(GameManager.data.config.Name);
                resolve();
            }
        });

        // Chờ cả hai ảnh load xong
        await Promise.all([loadLogo, loadTitle]);
    }

    /**
     * Cập nhật hiển thị level từ GameManager
     */
    private updateLevelDisplay(): void {
        // if (this.labelLevel && GameManager.Level[this.numLevel]) {
        //     this.labelLevel.string = GameManager.Level[this.numLevel];
        // }
        this.labelLevel.string = GameManager.data.level;
    }

    /**
     * Lấy dữ liệu cài đặt level hiện tại
     * @returns Đối tượng chứa thông tin về topics, topic và level hiện tại
     */
    public getSettingLevelData(): { topics: { name: string, image: any }[], currentTopic: number, currentLevel: number } {
        return {
            topics: this.topics,
            currentTopic: this.numToppic,
            currentLevel: this.numLevel,
        };
    }

    /**
     * Callback khi người dùng chọn topic và level mới
     * @param newTopic - Chỉ số topic mới
     * @param newLevel - Chỉ số level mới
     */
    public onTopicLevelSelected(newTopic: number, newLevel: number): void {
        if (newTopic !== this.numToppic) {
            this.numToppic = newTopic;
            this.updateTopicDisplay();
        }

        if (newLevel !== this.numLevel) {
            this.numLevel = newLevel;
            this.updateLevelDisplay();
        }
    }

    isTest(toggle: Toggle) {
        GameManager.data.options.isCountdownMode = toggle.isChecked;
    }
}


