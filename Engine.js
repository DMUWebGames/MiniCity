import * as THREE from 'three';

export class Engine {
  constructor(canvas){
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87bdf0);

    this.camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x445544, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(8, 14, 6);
    this.scene.add(sun);
    

    this.resize();
    addEventListener('resize', () => this.resize());
    this.last = 0;
  }

  resize(){
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth/innerHeight;
    this.camera.updateProjectionMatrix();
  }

  static box(w, h, d, color){
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
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