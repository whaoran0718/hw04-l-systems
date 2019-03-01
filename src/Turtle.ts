import {vec3, quat} from 'gl-matrix';

export default class Turtle {

    position: vec3;
    orientation: vec3;
    right: vec3;
    step: number;
    depth: number;

    constructor(pos: vec3, orient: vec3, right: vec3, step: number, depth: number) {
        this.position = vec3.clone(pos);
        this.orientation = vec3.clone(orient);
        this.right = vec3.clone(right);
        this.step = step;
        this.depth = depth;
    }

    static clone(tur: Turtle) {
        let copyTur = new Turtle(tur.position,
                                 tur.orientation,
                                 tur.right,
                                 tur.step,
                                 tur.depth);
        return copyTur;
    }

    moveForward(len: number) {
        let disp = vec3.fromValues( this.orientation[0] * len,
                                    this.orientation[1] * len,
                                    this.orientation[2] * len );
        vec3.add(this.position, this.position, disp);
        this.step += 1;
    }

    rotateRight(ang: number) {
        ang = ang * Math.PI / 180;
        let rotX: quat = quat.create();
        quat.setAxisAngle(rotX, this.right, ang);
        vec3.transformQuat(this.orientation, this.orientation, rotX);
    }

    rotateUp(ang: number) {
        ang = ang * Math.PI / 180;
        let rotY: quat = quat.create();
        quat.setAxisAngle(rotY, this.orientation, ang);
        vec3.transformQuat(this.right, this.right, rotY);
    }
}