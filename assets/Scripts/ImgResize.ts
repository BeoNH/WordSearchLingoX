import { _decorator, Component, Node, Sprite, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ImgResize')
export class ImgResize extends Component {
    @property({ tooltip: "Kích thước (width, height)" })
    public targetSize: Vec2 = new Vec2(100, 100);

    private _sprite: Sprite | null = null;
    private _ui: UITransform | null = null;

    onLoad() {
        this._sprite = this.node.getComponent(Sprite);
        this._ui = this.node.getComponent(UITransform);
    }

    resize() {
        if (!this._ui) return;
        if (this._sprite) {
            this._sprite.sizeMode = Sprite.SizeMode.RAW;
        }

        // Tính scale để vừa trong targetSize
        const w = this._ui.width || 1;
        const h = this._ui.height || 1;
        const ratio = w / h;

        if (this._ui.width > this._ui.height) {
            this._ui.width = this.targetSize.x;
            this._ui.height = this.targetSize.x / ratio;
        } else {
            this._ui.width = this.targetSize.y * ratio;
            this._ui.height = this.targetSize.y;
        }
    }
}
