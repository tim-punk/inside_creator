import {  Vec3, Node } from "cc";
import { HexGrid } from "./HexGrid";

/**
 * @description 地图类公共方法
 */
const _radius = 0.5;
export const HEX_MAP = {
    outerRadius : _radius,
    innerRadius : _radius * 0.866025404,
    width: 13,
    height: 13,
}
//六角形对应中心坐标
export class HEXAGON {
    public x: number = 0;
    public z: number = 0;
    private t: number = 0; //当前格子值 0可走，1被占用

    constructor(x: number,z: number,t?:number) {
        this.x = x;
        this.z = z;
        if (t) {
            this.t = t;
        }
    };
    public updateType(t:number) {
        this.t = t;
    }
    public getType() {
        return this.t;
    }
    // 是否可行走
    public canThrough() {
        return this.t == 0;
    }
    public getPx() {
        return (this.x + (this.z % 2 == 0 ? 0 : 0.5) ) * HEX_MAP.innerRadius * 2;
    }
    public getPz() {
        return (this.z * HEX_MAP.outerRadius * 1.5);
    }
}
// 根据传入的坐标获取对应的六角形
export function GetHexagon(px: number,  pz: number): Vec3 {
    const z = (pz) / (HEX_MAP.outerRadius * 1.5);

    const z1 = Math.floor(z);
    const z2 = Math.ceil(z);

    // px = (x + (z % 2 == 0 ? 0: 0.5) ) * Utils.HEX_MAP.innerRadius * 2;
    //偶数
    const x1 =  Math.round((px) / (HEX_MAP.innerRadius * 2));
    //奇数
    const x2 = Math.round((px) / (HEX_MAP.innerRadius * 2) - 0.5);
    let list = new Array<Vec3>();
    list.push(new Vec3(x1,0,z1));
    list.push(new Vec3(x1,0,z2));
    list.push(new Vec3(x2,0,z1));
    list.push(new Vec3(x2,0,z2));
    
    //清理不存在的
    const _list = list.filter(i => i.x >= 0 && i.z >= 0 && i.x <= HEX_MAP.width && i.z <= HEX_MAP.height);

    //直接结算,如果到到圆心的距离，小于H，就是它
    //大于 R 的直接扔掉
    for(const item of _list){
        const distance =  Distance(px,pz,item);
        if(distance <= HEX_MAP.innerRadius){
            return item;
        }
    }
     //如果在 H-R 之间的 
    for(const item of _list){
        const distance =  Distance(px,pz,item);
        if(distance <= HEX_MAP.outerRadius){
            return item;
        }
    }
    return new Vec3(-1,0,-1);
}

function Distance(px: number, pz: number, index: Vec3): number {
    let hexagon = new HEXAGON(0,0);
    hexagon.x = index.x;
    hexagon.z = index.z;
    const distance = Math.sqrt((px - hexagon.getPx()) * (px - hexagon.getPx()) + (pz - hexagon.getPz()) * (pz - hexagon.getPz()));
    return distance;
}
// 获取格子周围一圈，共六个格子的格子坐标
export function GetRoundTilePos(h:HEXAGON): Vec3[] {
    let arr:Vec3[] = [];
    if (h.z % 2 == 0) {
        if( h.z - 1 >= 0 )
            arr.push(new Vec3(h.x, 0, h.z - 1));// 右下
        if( h.z + 1 <= HEX_MAP.height )
            arr.push(new Vec3(h.x, 0, h.z + 1));// 右上
        if( h.x - 1 >= 0 )
            arr.push(new Vec3(h.x - 1, 0, h.z));// 左
        if( h.x + 1 <= HEX_MAP.width )
            arr.push(new Vec3(h.x + 1, 0, h.z));// 右
        if( h.x - 1 >= 0 && h.z - 1 >= 0 )
            arr.push(new Vec3(h.x - 1, 0, h.z - 1));//左下
        if( h.x - 1 >= 0 && h.z + 1 <= HEX_MAP.height )
            arr.push(new Vec3(h.x - 1, 0, h.z + 1));//左上
    }else {
        if( h.z - 1 >= 0 )
            arr.push(new Vec3(h.x, 0, h.z - 1));// 右下
        if( h.z + 1 <= HEX_MAP.height )
            arr.push(new Vec3(h.x, 0, h.z + 1));// 右上
        if( h.x - 1 >= 0 )
            arr.push(new Vec3(h.x - 1, 0, h.z));// 左
        if( h.x + 1 <= HEX_MAP.width )
            arr.push(new Vec3(h.x + 1, 0, h.z));// 右
        if( h.x + 1 <= HEX_MAP.width && h.z - 1 >= 0 ) 
            arr.push(new Vec3(h.x + 1, 0, h.z - 1));//左下
        if( h.x + 1 <= HEX_MAP.width && h.z + 1 <= HEX_MAP.height )
            arr.push(new Vec3(h.x + 1, 0, h.z + 1));//左上
    }
    return arr;
}
//A*算法节点数据
export class AstarNd {
    public g: number = 0;
    public h: number = 0;
    public hexagon:HEXAGON;
    public lastNode: AstarNd| null = null;
    constructor(i: HEXAGON){
        this.hexagon = i;
    }
    GetF = ()=>{
        return this.g + this.h
    }
}
// 获取脚本
export function GetNodeScript(nd:Node):HexGrid {
    return (nd.getComponent('HexGrid') as HexGrid);
}
// 获取地形的地图node
export function GetMapItem(vec: Vec3,list: HexGrid[]):HexGrid|null {
    for (const itr of list) {
        if ( itr && itr.hexagon.x == vec.x && itr.hexagon.z == vec.z){
            return itr;
        }
    }
    return null;
}
/**
 * 
 * @param start 初始点
 * @param end 目的点
 * @param allPath 地图数据
 * @returns list 输出路径，为[]则不可走或不需要走
 */
export function ComputePath(start: HEXAGON, end: HEXAGON, allPath: HexGrid[]):HEXAGON[] {
    const _GetOpenedBest = (openList: AstarNd[])=> {
        //在打开列表中找到最优节点，并从列表中移除
        let idx = 0;
        let target = openList[idx];
        openList.forEach((e,i) => {
            if (e.GetF() < target.GetF()) {
                target = e;
                idx = i;
            }
        });
        openList.splice(idx,1);
        return target;
    }
    const _checkSame = (a:HEXAGON,b:HEXAGON)=> {
        return (a.x == b.x && a.z == b.z);
    }
    const _Contains = (item: HEXAGON, list: AstarNd[]) =>{
        for (const itr of list) {
            if (_checkSame(itr.hexagon,item)) {
                return itr;
            }
        }
        return null;
    }
    let finded: boolean = false;
    let openList: AstarNd[] = [];
    let closeList: AstarNd[] = [];
    let curr = new AstarNd(start);
    openList.push(curr);
    while (openList.length > 0 && !finded) {
       curr = _GetOpenedBest(openList);
       closeList.push(curr);
       //加入周围可加入的6个坐标值
       const tileList = GetRoundTilePos(curr.hexagon);
       for (let idx = 0; idx < tileList.length; idx++) {
           const ele = tileList[idx];
           const item: HexGrid|null = GetMapItem(ele,allPath);
           if (!item) continue;
           //可以行走，但是不在关闭列表里面
           if(item.canThrough() && !_Contains(item.hexagon,closeList)) {
                const _g = curr.g + 1;
                const _h = Math.abs(item.hexagon.x - end.x) + Math.abs(item.hexagon.z - end.z);
                const oitem = _Contains(item.hexagon,openList);
                if(oitem){// 在则寻求最优解,并更新节点
                    if (oitem.GetF() > _g + _h) {
                        oitem.lastNode = curr;
                        oitem.g = _g;
                        oitem.h = _h;
                    }
                }else {
                    //不在打开节点里面，则加入
                    let a = new AstarNd(item.hexagon);
                    a.g = _g;
                    a.h = _h;
                    a.lastNode = curr;
                    openList.push(a);
                    if (item.hexagon.x == end.x && item.hexagon.z == end.z) {
                        finded = true;
                        break;
                    }
                }
            }
       }
    }
    let list: any[] = [];
    if (finded) {
        curr = openList[openList.length - 1];
        do {
            list.push(curr.hexagon);
            curr = curr.lastNode!;
        } while (curr.lastNode != null);
    }
    return list.reverse();//反向
}