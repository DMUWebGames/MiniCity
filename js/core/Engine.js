import * as THREE from 'three';

export class Engine {
  constructor(canvas){
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87bdf0);

    this.camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);

    this.resize();
    addEventListener('resize', () => this.resize());
    this.last = 0;
  }

  resize(){
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth/innerHeight;
    this.camera.updateProjectionMatrix();
  }

  start(game){
    const loop = (now) => {
      const dt = this.last ? Math.min((now - this.last)/1000, 0.05) : 0;
      this.last = now;
      game.update(dt);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}