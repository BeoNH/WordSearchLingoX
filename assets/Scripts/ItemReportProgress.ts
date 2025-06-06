import { _decorator, Component, Node, Label, Sprite, UITransform, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemReportProgress')
export class ItemReportProgress extends Component {

    @property({ type: Label, tooltip: "Nhãn hiển thị giá trị điểm" })
    private valueLabel: Label = null;

    @property({ type: Node, tooltip: "Node fill của thanh tiến trình" })
    private progressBarFill: Node = null;

    private initialFillWidth: number = 0;

    protected onLoad(): void {
        if (this.progressBarFill && this.progressBarFill.getComponent(UITransform)) {
            this.initialFillWidth = this.progressBarFill.getComponent(UITransform).width;
            this.progressBarFill.getComponent(UITransform).width = 0;
        } else {
            console.warn("ProgressBarFill node or UITransform component is missing!");
        }

        if (this.valueLabel) {
            this.valueLabel.string = '0.00';
        }
    }

    /**
     * Cập nhật giá trị và hiển thị thanh tiến trình.
     * @param currentValue Giá trị hiện tại.
     * @param maxValue Giá trị tối đa.
     */
    public setValue(currentValue: number, maxValue: number): void {
        if (this.valueLabel) {
            this.valueLabel.string = currentValue.toFixed(2);
        }

        if (this.progressBarFill && this.initialFillWidth > 0 && maxValue > 0) {
            const progressRatio = Math.max(0, Math.min(1, currentValue / maxValue));
            const targetWidth = this.initialFillWidth * progressRatio;

            this.progressBarFill.getComponent(UITransform).width = targetWidth;

            tween(this.progressBarFill.getComponent(UITransform))
                .to(0.3, { width: targetWidth }, { easing: 'sineOut' })
                .start();

        } else if (this.progressBarFill && this.initialFillWidth > 0) {
             this.progressBarFill.getComponent(UITransform).width = 0;
        }
    }
}


