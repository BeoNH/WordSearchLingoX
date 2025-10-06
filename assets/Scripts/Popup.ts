import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Popup')
export class Popup extends Component {

    @property({type: Node, tooltip: 'Nội dung'})
    private content:Node= null;

    protected convertText() {
        this.content.scale = v3(0,0,0)
        tween(this.content)
        .to(0.3, {scale: v3(1,1,1)}, { easing: 'backOut' })
        .call(() => {
            tween(this.content)
                .to(0.08, { scale: v3(0.83,0.83,1) })
                .to(0.08, { scale: v3(1,1,1) })
                .to(0.08, { scale: v3(0.93,0.93,1) })
                .to(0.08, { scale: v3(1,1,1)})
                .start();
        })
        .start()
    }

    public onShow(){
        this.node.active = true;
        this.content.scale = Vec3.ONE.clone().multiplyScalar(0.01);
        tween(this.content)
        .to(0.3, {scale: v3(1,1,1)}, { easing: 'backOut' })
        .start()
    }

    public onClose(){
        tween(this.content)
        .to(0.3, {scale: v3(0,0,0)}, { easing: 'backOut' })
        .call(()=>{
            this.node.active = false
        })
        .start()
    }
}


