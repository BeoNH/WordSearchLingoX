import { _decorator, Color, Component, instantiate, Label, Layout, macro, Node, tween, Tween, UITransform, Vec3 } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Logo')
export class Logo extends Component {

    private textNodes: Node[] = [];
    private readonly lineColors: Color[] = [new Color().fromHEX("#ffb42e"), new Color().fromHEX("#50baff"), new Color().fromHEX("#FF6B6B"), new Color().fromHEX("#4EFF92")];



    protected start(): void {

    }

    protected onDisable(): void {

        console.log("onDisableonDisableonDisable");
    }

    private _callback;

    private animate() {
        console.log("logo animate");
        Tween.stopAllByTarget(this.node);

        let maxWidth = 0;
        this.node.getComponentsInChildren(Layout).forEach(e => {
            e.node.children.forEach(e2 => {
                Tween.stopAllByTarget(e2);
                e2.position = new Vec3(e2.position.x, 0, 0);
            });
            e.updateLayout();
            maxWidth = e.getComponent(UITransform).width;
        });
        this.node.getComponent(UITransform).width = maxWidth;
        // this.node.getComponent(UIAspectRatioFitter).updateSize();

        if (this._callback)
            this.unschedule(this._callback);
        
        this._callback = () => {
            this.textNodes.forEach((e, i) => {
                e.position = new Vec3(e.position.x, 0, 0);

                this.scheduleOnce(() => {
                    tween(e)
                        .by(0.1, { position: new Vec3(0, 30, 0) })
                        .by(0.1, { position: new Vec3(0, -30, 0) })
                        .start();
                }, 0.1 * i);
            });
        };
        this.schedule(this._callback, this.textNodes.length * 0.11, macro.REPEAT_FOREVER, 0.3);


    }




    onEnable() {
        this.createTextLogo();
    }

    async createTextLogo() {
        await new Promise(r => this.scheduleOnce(r));

        const gameName = GameManager.data?.config?.Name ?? "";
        console.log("gameName", gameName);
        const spl = this.wrapTextByWords(gameName, 10);

        this.textNodes.length = 0;
        const c = Math.max(spl.length, this.node.children.length);
        let maxWidth = 0;
        for (let i = 0; i < c; i++) {
            let horizontal = this.node.children[i];
            const line = spl[i];
            if (line) {
                if (!horizontal) {
                    horizontal = instantiate(this.node.children[0]);
                    horizontal.parent = this.node;
                }

                const chars = line.split("");
                const c2 = Math.max(chars.length, horizontal.children.length);
                for (let j = 0; j < c2; j++) {
                    let nodeChar = horizontal.children[j];
                    const char = chars[j];
                    if (typeof char == 'string') {
                        if (!nodeChar) {
                            nodeChar = instantiate(horizontal.children[0]);
                            nodeChar.parent = horizontal;
                        }

                        nodeChar.getComponent(Label).string = char;
                        nodeChar.getComponentInChildren(Label).string = char;
                        nodeChar.getComponentInChildren(Label).color = this.lineColors[i % this.lineColors.length];
                        nodeChar.active = true;

                        this.textNodes.push(nodeChar);
                    } else if (nodeChar) nodeChar.active = false;
                }

                horizontal.active = true;
                horizontal.getComponent(Layout).updateLayout();

                const _maxWidth = horizontal.getComponent(UITransform).width;

                if (_maxWidth > maxWidth) maxWidth = _maxWidth;
            } else if (horizontal) horizontal.active = false;
        }
        this.node.getComponent(Layout).updateLayout();

        this.animate();

        console.log("maxWidth", maxWidth);
        // this.node.getComponent(UITransform).width = maxWidth;

        const parentWidth = this.node.parent.getComponent(UITransform).width;
        if (parentWidth < maxWidth) {
            this.node.scale = Vec3.ONE.clone().multiplyScalar(this.node.parent.getComponent(UITransform).width / maxWidth);
        } else {
            this.node.scale = Vec3.ONE.clone();
        }
    }

    convertTextLogo(text: string) {
        const spl = this.wrapTextByWords(text, 10);
        this.node.children.forEach(node => {
            node.getComponent(Label).string = spl.join("\n");
            node.getComponent(Label).updateRenderData(true);
        });
    }

    private wrapTextByWords(text: string, maxCharsPerLine: number) {
        if (!text || maxCharsPerLine <= 0) return [];

        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            // Nếu thêm từ tiếp theo vẫn còn trong giới hạn ký tự
            if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                // Đưa dòng hiện tại vào danh sách, bắt đầu dòng mới
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }

        // Thêm dòng cuối cùng nếu còn nội dung
        if (currentLine) lines.push(currentLine);

        return lines;
    }



}
