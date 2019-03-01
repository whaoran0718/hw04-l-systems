import {vec3} from 'gl-matrix';
import Turtle from './Turtle';

function randRange(a: number, b: number) {
    return a + Math.random() * (b - a);
}

export default class DrawingRule {
    drawRules: Map<string, any> = new Map();
    turStack: Array<Turtle> = new Array();

    iteration: number;
    heartThreshold: number;

    branchMat: Array<number> = [];
    heartMat: Array<number> = [];

    constructor(iter: number) {
        let tur = new Turtle(vec3.fromValues(0, 0, 0), 
                             vec3.fromValues(0, 1, 0), 
                             vec3.fromValues(1, 0, 0),
                             1, 
                             0);
        this.turStack.push(tur);
        this.drawRules.set('F', this.drawBranch.bind(this, 0.2, 0.5));
        this.drawRules.set('X', this.drawSprialOrHeart.bind(this));
        this.drawRules.set('$', this.rotateRight.bind(this, 3, 10));
        this.drawRules.set('*', this.rotateUp.bind(this, 100, 140));
        this.drawRules.set('[', this.push.bind(this));
        this.drawRules.set(']', this.pop.bind(this));

        this.iteration = iter;
    }

    eval(phrase: string) {
        let drawFunc = this.drawRules.get(phrase);
        if (drawFunc) drawFunc();
    }

    rotateRight(a: number, b: number) {
        let tur = this.turStack[this.turStack.length - 1];
        tur.rotateRight(randRange(a, b));
    }

    rotateUp(a: number, b: number) {
        let tur = this.turStack[this.turStack.length - 1];
        tur.rotateUp(randRange(a, b));
    }

    push() {
        let tur = this.turStack[this.turStack.length - 1];
        let branchTur = Turtle.clone(tur);
        branchTur.depth += 1;
        this.turStack.push(branchTur);
    }

    pop() {
        this.turStack.pop();
    }

    drawBranch(a: number, b: number) {
        let tur = this.turStack.pop();
        let forward = vec3.create();
        vec3.cross(forward, tur.right, tur.orientation);

        let branchTur = Turtle.clone(tur);
        branchTur.moveForward(randRange(a, b));
        let branch = vec3.create();
        vec3.subtract(branch, branchTur.position, tur.position);
        this.turStack.push(branchTur);

        
        let branchLen = vec3.len(branch);
        let t = 1 - branchTur.step / (Math.pow(1.72, this.iteration) * 6.65);
        t = Math.max(Math.min(t, 1.0), 0.0);
        let branchScale = (t * t * (3.0 - 2.0 * t)) * 0.18 * this.iteration * this.iteration + 0.2;
        
        let position = vec3.create();
        let s = this.scale();
        branchLen = branchLen * s;
        branchScale = branchScale * s;
        vec3.scale(position, tur.position, s);

        this.branchMat.push(tur.right[0] * branchScale, 
                            tur.right[1] * branchScale, 
                            tur.right[2] * branchScale, 0);
        this.branchMat.push(tur.orientation[0] * branchLen, 
                            tur.orientation[1] * branchLen, 
                            tur.orientation[2] * branchLen, 0);
        this.branchMat.push(forward[0] * branchScale,
                            forward[1] * branchScale, 
                            forward[2] * branchScale, 0);
        this.branchMat.push(position[0], position[1], position[2], 1);
    }

    drawSpiral() {
        let tur = this.turStack[this.turStack.length - 1];
        let offset = randRange(-2, 2);
        let lenMax = 0.5 / Math.exp(tur.depth / 5);
        let seg = 50;
        for (let i = 0; i < seg; i++) {
            let len = lenMax * (1 - i / seg);
            this.drawBranch(len, len);
            this.rotateUp(offset, offset);
            this.rotateRight(10, 15);
        }
    }

    drawHeart() {
        let tur = this.turStack[this.turStack.length - 1];
        tur.rotateUp(randRange(-180, 180));
        tur.moveForward(0);
        let forward = vec3.create();
        vec3.cross(forward, tur.right, tur.orientation);
        
        let s = this.scale();
        let right = vec3.create();
        let orientation = vec3.create();
        let position = vec3.create();
        vec3.scale(right, tur.right, s);
        vec3.scale(orientation, tur.orientation, s);
        vec3.scale(position, tur.position, s);
        vec3.scale(forward, forward, s);

        this.heartMat.push(right[0], right[1], right[2], 0);
        this.heartMat.push(orientation[0],
                           orientation[1], 
                           orientation[2], 0);
        this.heartMat.push(forward[0], forward[1], forward[2], 0);
        this.heartMat.push(position[0], position[1], position[2], 1);
    }

    drawSprialOrHeart() {
        let rand = Math.random();
        if (rand < this.heartThreshold) this.drawHeart();
        else this.drawSpiral();
    }

    drawCurve(a: number, b: number) {
        let angle = randRange(a, b);
        let seg = 10;
        for(let i = 0; i < seg; i++) {
            this.rotateRight(angle / seg, angle / seg);
            this.drawBranch(0.4, 0.6);
        }
    }

    scale() {
        return 1 / Math.pow(1.2, this.iteration);
    }

    setAngle(angle: number) {
        this.drawRules.set('+', this.drawCurve.bind(this, 0.6 * angle, angle));
    }
};