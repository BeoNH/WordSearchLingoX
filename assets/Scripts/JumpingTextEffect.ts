import { _decorator, Component, Node, Label, Vec3, tween, Tween, easing } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JumpingTextEffect')
export class JumpingTextEffect extends Component {

    @property({ tooltip: 'Thời gian trễ giữa 2 ký tự (giây)' })
    public charDelay = 1.0; // giây

    @property({ tooltip: 'Độ cao nhảy (pixel)' })
    public jumpHeight = 18;

    @property({ tooltip: 'Thời gian 1 nhát nhảy (lên + xuống) (giây)' })
    public jumpDuration = 0.28; // giây (lên + xuống)

    @property({ tooltip: 'Khoảng thời gian giữa 2 chu kỳ bắt đầu (giây)' })
    public cycleInterval = 3; // giây

    @property({ tooltip: 'Có lặp vô hạn (true) hay chỉ chạy 1 lần (false)' })
    public loop = true;

    // Internal
    private labels: Label[] = [];
    private isPlaying = false;
    private scheduledNextCycleId: number | null = null; // để hủy nếu stop

    onEnable() {
        this.play();
    }

    // Lấy tất cả component Label từ các node con
    private collectLabels() {
        this.labels = [];
        if (!this.node) return;
        for (const child of this.node.children) {
            const lbl = child.getComponent(Label);
            if (lbl) this.labels.push(lbl);
        }
    }

    /**
     * Chạy 1 chu kỳ nhảy lần lượt từng ký tự
     */
    private async playCycle() {
        if (!this.node) return;
        if (this.labels.length === 0) {
            this.collectLabels();
            if (this.labels.length === 0) return;
        }

        this.isPlaying = true;

        const perCharDelay = Math.max(0, this.charDelay);
        const singleJumpDuration = Math.max(0.01, this.jumpDuration);

        // Tính thời gian tổng của cycle (khi bắt đầu chu kỳ tiếp theo)
        const totalTime = (this.labels.length - 1) * perCharDelay + singleJumpDuration;

        console.log("total", totalTime, this.labels.length)
        // Duyệt qua từng label và chạy tween với delay tăng dần
        this.labels.forEach((label, idx) => {
            const node = label.node;
            const original = node.getPosition();
            const upPos = new Vec3(original.x, original.y + this.jumpHeight, original.z);
            const downPos = original.clone();

            // hủy tween cũ nếu có
            tween(node).stop();

            console.log("this.labels", this.labels);
            const delay = idx * perCharDelay;
            tween(node)
                .delay(delay)
                .to(singleJumpDuration * 0.5, { position: upPos }, { easing: easing.quadOut })
                .to(singleJumpDuration * 0.5, { position: downPos }, { easing: easing.quadIn })
                .start();
        });

        // Lên lịch cho chu kỳ kế tiếp
        if (this.loop) {
            const wait = Math.max(0, this.cycleInterval);
            // đảm bảo chu kỳ bắt đầu không trước khi tất cả chữ nhảy xong
            const nextStart = Math.max(wait, totalTime);

            // sử dụng scheduler của Cocos để dễ hủy
            this.scheduledNextCycleId = this.scheduleOnce(() => {
                this.playCycle();
            }, nextStart) as unknown as number;
        } else {
            const endDelay = Math.max(0, totalTime);
            this.scheduleOnce(() => {
                this.isPlaying = false;
            }, endDelay);
        }
    }

    /**
     * Bắt đầu hiệu ứng (nếu đang chạy sẽ không bắt lại)
     */
    public play() {
        if (this.isPlaying) return;
        this.collectLabels();
        this.playCycle();
    }

    // Public helper: thay đổi tham số runtime
    public setParams(opts: { charDelay?: number; jumpHeight?: number; jumpDuration?: number; cycleInterval?: number; loop?: boolean }) {
        if (typeof opts.charDelay === 'number') this.charDelay = opts.charDelay;
        if (typeof opts.jumpHeight === 'number') this.jumpHeight = opts.jumpHeight;
        if (typeof opts.jumpDuration === 'number') this.jumpDuration = opts.jumpDuration;
        if (typeof opts.cycleInterval === 'number') this.cycleInterval = opts.cycleInterval;
        if (typeof opts.loop === 'boolean') this.loop = opts.loop;
    }
}




