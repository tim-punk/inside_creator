import { _decorator, Component, Node, Prefab, instantiate, resources, Material, MeshRenderer,v3, Texture2D } from 'cc';
import { HEXAGON } from './MapUtil';
const { ccclass, property } = _decorator;

@ccclass('HexGrid')
export class HexGrid extends Component {
    hexagon: HEXAGON = new HEXAGON(0,0);

    preType: number = 0; //将要改成的格子值
    isChange: boolean = false; //是否在改变格子值的时间

    start () {
        // Your initialization goes here.
    }
    canThrough(){
        return (this.preType == 0);
    }
    updateHexagon(h: HEXAGON,type?:number) {
        this.hexagon = h;
        // console.log("fffxxx:",this.hexagon.getPx(),this.hexagon.getPz())
        this.node.position = v3(this.hexagon.getPx(),0,this.hexagon.getPz());
        type = type || this.hexagon.getType();
        this.updateGridType(type);
    }
    updateGridType(type: number) {
        if (this.isChange || this.preType == type) {
            // console.log('无需改变...',this.preType,type);
            return;
        }
        this.preType = type;
        this.isChange = true;
        const self = this;
        const mRder = this.node.getComponent(MeshRenderer);
        let textureUrl = '';
        if (this.preType == 0) {
            textureUrl = 'map/textures/green32/texture';
        } else if(this.preType == 1) {
            textureUrl = 'map/textures/gray32/texture';
        }else if (this.preType == 2) {
            textureUrl = 'map/textures/red32/texture';
        }
        resources.load(textureUrl, Texture2D, (err: any, asset: any)=>{
            if (err) {
                console.log('加载资源报错:',err);
                return;
            }
            const mat = mRder?.material; // 拷贝实例化，mat2 是一个 MaterialInstance，接下来对 mat2 的修改只会影响 comp2 的模型
            mat?.setProperty('mainTexture',asset);
            self.isChange = false;
        });
    }
}
