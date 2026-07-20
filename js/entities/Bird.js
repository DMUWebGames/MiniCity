import * as THREE from 'three';
import {box} from '../core/MeshFactory.js';

export class Bird{
    constructor(){
        this.group = new THREE.Group();
        this.phase = Math.random() * 6;

        const body = box(1.2, 0.6, 0.6, 0x333333);

        this.wingL = this.makeWing(-1);
        this.wingL.position.set(-0.4, 0.2, 0);
        this.wingR = this.makeWing(1);
        this.wingR.position.set(0.4, 0.2, 0);

        this.group.add(body, this.wingL, this.wingR);

        this.group.position.set((Math.random() - 0.5) * 300, 40 + Math.random()*40, (Math.random() - 0.5) * 300);
        this.xspeed = (Math.random()-0.5) * 50;
        this.zspeed = (Math.random()-0.5) * 50;

    }
    makeWing(side){
        const pivot = new THREE.Group();
        const wing = box(2, 0.1, 0.8, 0x555555);
        wing.position.x = side * 1;
        pivot.add(wing);
        return pivot;
    }

    update(dt) {
        this.group.position.x += this.xspeed * dt;
        this.group.position.z += this.zspeed * dt;
        if(this.group.position.x > 150) this.group.position.x = -150;
        if(this.group.position.z > 150) this.group.position.z = -150;
        if(this.group.position.x < -150) this.group.position.x = 150;
        if(this.group.position.z < -150) this.group.position.z = 150;

        /**flaps its wings */
        this.phase += dt * 8;
        const flat = Math.sin(this.phase) * 0.6;
        this.wingL.rotation.z = flat;
        this.wingR.rotation.z = -flat;
    }
}