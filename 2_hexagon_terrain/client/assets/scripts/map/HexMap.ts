

import { _decorator, Component, resources, Node, Prefab, instantiate, find, systemEvent, sys, SystemEventType, Touch, UITransform, Canvas, Camera, EventTouch, geometry, MeshRenderer, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import {GetHexagon, HEX_MAP, HEXAGON, GetMapItem, GetNodeScript} from './MapUtil';

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
                const nd:Node = GetMapItem(new Vec3(p.x,0,p.z),this._list);
                const script:any = nd.getComponent('HexGrid');
                script.updateGridType(1);
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
    createMap(asset: any) {
        let i = 0;
        for (let x = 0; x < HEX_MAP.width; x++) {
            for (let z = 0; z < HEX_MAP.height; z++) {
                // const ran = Math.random() <= 0.5 ? 0 : 1;
                const ran = 1;
                const grid: any = instantiate(asset);
                grid.parent = this.node;
                const script: any = GetNodeScript(grid);
                const hex = new HEXAGON(x,z);
                script.updateHexagon(hex,0);
                this._list.push(grid);
            }
        }
    }
}
