import * as THREE from 'three';
import { MiniCity } from './Minicity.js';
import {Engine} from './Engine.js';

export class NightCity extends MiniCity {

    makeSky(){

        /**night lights */
        this.scene.children.filter( o =>o.isLight).forEach(l  => this.scene.remove(l));
        this.scene.add(new THREE.HemisphereLight(0x334466, 0x202030, 0.6));
        const moonLight =  new THREE.DirectionalLight(0x99aaff, 0.85);
        moonLight.position.set(-8, 18, -6);
        this.scene.add(moonLight);
        this.scene.add(new THREE.AmbientLight(0x667788, 0.25));
        this.scene.background = new THREE.Color(0x122040);

        /**Star */
        const N=800, pos =  new Float32Array(N*3);
        for (let i =0; i<N;i++){
            pos[i*3] = (Math.random()-0.5)*400;
            pos[i*3+1] = 40 + Math.random()*120;
            pos[i*3+2] = (Math.random() - 0.5)*400;

        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos,3));
        this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:0xffffff , size: 1.2 })));

        /**Moon */
        const moon = new THREE.Mesh(
        new THREE.SphereGeometry(12,24,24),
        new THREE.MeshBasicMaterial({color: 0xf5f3d0})
    );
    moon.position.set(-120,110, -160);
    this.scene.add(moon);
    }
    /** Cars */
    setupExtras(){
        this.cars = [];
        const lines = [-60,-40,-20,0,20,40,60];
        for(let i=0;i<6;i++){
            const car = Engine.box(3,2,5,0xcc2222);
            const lane = lines[Math.random()*lines.length|0];
            if(Math.random() < 0.5){ car.position.set(-100,1,lane); car.userData={axis:'x'}; }
            else                   { car.position.set(lane,1,-100); car.userData={axis:'z'}; }
            this.scene.add(car);
            this.cars.push(car);
        }
    }

    /**shift cars */
      updateExtras(dt){
    const speed = 30;
    const p = this.player.group.position;
    for(const car of this.cars){
      if(car.userData.axis === 'x'){
        car.position.x += speed*dt;
        if(car.position.x > 100) car.position.x = -100;
      } else {
        car.position.z += speed*dt;
        if(car.position.z > 100) car.position.z = -100;
      }
      /**collision */
      if(Math.abs(p.x - car.position.x) < 2.8 && Math.abs(p.z - car.position.z) < 3.5){
        this.gameOver = true;
        this.lostEl.style.display = 'grid';
      }
    }
  }
    
    







}
