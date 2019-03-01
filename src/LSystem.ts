import DrawingRule from "./DrawingRule";
import Mesh from './geometry/Mesh';
import {readTextFile} from './globals';
import { vec4 } from "gl-matrix";

class ExpansionRule {
    expRules: Map<string, any> = new Map();

    constructor() {
        this.expRules.set('F', this.F);
        this.expRules.set('X', this.X);
    }

    F() {
        let rand = Math.random();
        if (rand < 0.2) return 'FF';
        else return 'F*$F';
    }

    X() { 
        let rand = Math.random();
        if (rand < 0.3) return '[FX][*+FX]'
        else return '[+FX][*+FX][**+FX]';
    }

    expand(phrase: string) {
        let expFunc = this.expRules.get(phrase);
        return expFunc ? expFunc() : phrase;
    }
};


export default class LSystem {
    branchGeom: Mesh;
    branchObj: string;
    heartGeom: Mesh;
    heartObj: string;
    grammar: Array<string> = new Array();
    expRules: ExpansionRule = new ExpansionRule();
    drawRules: DrawingRule = new DrawingRule(0);

    heartCol: vec4 = vec4.create();
    branchCol: vec4 = vec4.create();
    heartThreshold: number = 0;
    branchAngle: number = 0;

    constructor(branchObj: string, heartObj: string) {
        this.branchObj = branchObj;
        this.heartObj = heartObj;
        this.grammar.push('FX');
    }

    process(iter: number) {
        for (let i = this.grammar.length - 1; i < iter; i++) {
            let newGrammar: string = '';
            for (let idx = 0; idx < this.grammar[i].length; idx++) {
                newGrammar += this.expRules.expand(this.grammar[i].charAt(idx));
            }
            this.grammar.push(newGrammar);
        }

        let grammar: string = this.grammar[iter];
        this.drawRules = new DrawingRule(iter);
        this.drawRules.heartThreshold = this.heartThreshold;
        this.drawRules.setAngle(this.branchAngle);
        for (let i = 0; i < grammar.length; i++) {
            this.drawRules.eval(grammar.charAt(i));
        }

        this.render();
    }

    render() {
        this.branchGeom = new Mesh(readTextFile(this.branchObj));
        this.branchGeom.destory();
        this.branchGeom.create();
        let branchMat = new Float32Array(this.drawRules.branchMat);
        let branchCol = new Float32Array(branchMat.length / 4);
        for (let i = 0; i < branchMat.length / 16; i++) {
            branchCol.set(this.branchCol, i * 4);
        }
        this.branchGeom.setInstanceVBOs(branchMat, branchCol);
        this.branchGeom.setNumInstances(branchMat.length / 16);

        this.heartGeom = new Mesh(readTextFile(this.heartObj));
        this.heartGeom.destory();
        this.heartGeom.create();
        let heartMat = new Float32Array(this.drawRules.heartMat);
        let heartCol = new Float32Array(heartMat.length / 4);
        for (let i = 0; i < heartMat.length / 16; i++) {
            heartCol.set(this.heartCol, i * 4);
        }
        this.heartGeom.setInstanceVBOs(heartMat, heartCol);
        this.heartGeom.setNumInstances(heartMat.length / 16);
    }
};