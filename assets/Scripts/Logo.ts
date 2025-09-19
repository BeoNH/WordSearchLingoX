import { _decorator, Component, instantiate, Label, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Logo')
export class Logo extends Component {

    convertTextLogo(text: string) {
        const spl = this.wrapTextByWords(text, 10);
        console.log("spl", spl);
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
