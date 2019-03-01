import Mesh from "./geometry/Mesh";
import { vec4 } from "gl-matrix";
import {readTextFile} from './globals';

export default class Background {
    heartGeom: Mesh;
    heartObj: string;
    heartCol: vec4 = vec4.create();

    constructor(heartObj: string) {
        this.heartObj = heartObj;
    }

    render() {
        this.heartGeom = new Mesh(readTextFile(this.heartObj));
        this.heartGeom.destory();
        this.heartGeom.create();
        
        let pos = [];
        let col = [];
        let interval = 200;
        let m = window.innerWidth / interval + 2;
        let n = window.innerHeight / interval + 2;
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                pos.push(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0);
                pos.push(i * interval - interval * 0.75);
                pos.push(j * interval - interval * 0.75);
                pos.push(i, j);

                col.push(this.heartCol[0],
                         this.heartCol[1],
                         this.heartCol[2],
                         this.heartCol[3]);
            }
        }
        let offsets: Float32Array = new Float32Array(pos);
        let colors: Float32Array = new Float32Array(col);
        this.heartGeom.setInstanceVBOs(offsets, colors);
        this.heartGeom.setNumInstances(m * n);
    }
};