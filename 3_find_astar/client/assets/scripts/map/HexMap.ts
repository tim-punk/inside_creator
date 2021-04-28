

import { _decorator, Component, resources, Node, Prefab, instantiate, find, systemEvent, sys, SystemEventType, Touch, UITransform, Canvas, Camera, EventTouch, geometry, MeshRenderer, Vec3 } from 'cc';
import { HexGrid } from './HexGrid';
const { ccclass, property } = _decorator;
import {GetHexagon, HEX_MAP, HEXAGON, GetMapItem, GetNodeScript, ComputePath} from './MapUtil';

@ccclass('HexMap')
export class TestGrid extends Component {
    private _list:Array<any> = new Array<any>(); 
    private _ray = new geometry.Ray();
    start () {
        // Your initialization goes here.
        this.loadPrefab()
    }
    onEnable () {
        // @ts-ignore
        systemEvent.on(SystemEventType.TOUCH_END,this.onTouchEnd,this);
    }
    onDisable() {
        systemEvent.off(SystemEventType.TOUCH_END,this.onTouchEnd,this);
    }
    onTouchEnd(touch: Touch) {
        const camera = find('Main Camera')?.getComponent(Camera);
        camera?.camera.screenPointToRay(this._ray,touch.getLocationX(),touch.getLocationY());
        const model: any = find('Plane',this.node)?.getComponent(MeshRenderer)?.model;
        const t = geometry.intersect.rayModel(this._ray,model);
        if(t) {
            let pPoint = new Vec3();
            Vec3.scaleAndAdd(pPoint,this._ray.o,this._ray.d,t);
            const p = GetHexagon(pPoint.x,pPoint.z);
            if (p.x >= 0 && p.z >= 0 && p.x < HEX_MAP.width && p.z < HEX_MAP.height) {
                const script:HexGrid|null = GetMapItem(new Vec3(p.x,0,p.z),this._list);
                if (script) {
                    this.testAStart(script.hexagon);
                }
                // script.updateGridType(1);
                // console.log('dfffff',t,pPoint,p);
            }
        }
    }
    loadPrefab() {
        const self = this;
        resources.load('map/prefabs/HexQuad', Prefab, function (err, asset) {
            self.createMap(asset);
        });
    }
    //测试A*算法
    testAStart(endPoint:HEXAGON) {
        // console.log('ddddd',this._list);
        const roadList = ComputePath( new HEXAGON(0,0),endPoint,this._list);
        roadList.forEach(e => {
            const script:HexGrid|null = GetMapItem(new Vec3(e.x,0,e.z),this._list);
            if(script){
                script.updateGridType(1);
            }
        });
        console.log("roadList:",roadList);
    }
    createMap(asset: any) {
        let i = 0;
        for (let x = 0; x < HEX_MAP.width; x++) {
            for (let z = 0; z < HEX_MAP.height; z++) {
                // const ran = Math.random() <= 0.5 ? 0 : 1;
                let ran = 0;
                if (x > 2 && x < 12 && z == 5) {
                    ran = 2;
                }
                if (z > 2 && z < 10 && x == 2) {
                    ran = 2;
                }
                const grid: any = instantiate(asset);
                grid.parent = this.node;
                const script: HexGrid = GetNodeScript(grid);
                const hex = new HEXAGON(x,z);
                script.updateHexagon(hex,ran);
                this._list.push(script);
            }
        }
    }
}
