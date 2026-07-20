import * as THREE from 'three';
import {Engine} from './Engine.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export class Camera {
    constructor(engine, canvas) {
        this.camera = engine.camera;
        this.camera.position.set(5, 2, 7);
        this.camera.lookAt(0, 0, 0);
        this.yaw = 0;
        this.pitch = 0;
        this.dragging = false;

        this.setupCamera(engine.renderer.domElement);}
    
        setupCamera(canvas) {
      this.target = new THREE.Vector3(0, 0, 0);
      this.cam = { yaw: Math.PI, pitch: 0.45, distance: 12 };
      this.dragging = false;
      let lastX = 0;
      let lastY = 0;
  
      canvas.addEventListener('pointerdown', (event) => {
        this.dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
      });
  
      canvas.addEventListener('pointermove', (event) => {
        if (!this.dragging) return;
        this.cam.yaw -= (event.clientX - lastX) * 0.005;
        this.cam.pitch = clamp(this.cam.pitch + (event.clientY - lastY) * 0.005, -1.4, 1.4);
        lastX = event.clientX;
        lastY = event.clientY;
        
      });
  
      canvas.addEventListener('pointerup', () => {
        this.dragging = false;
      });
  
      canvas.addEventListener(
        'wheel',
        (event) => {
          event.preventDefault();
          const step = this.cam.distance * 0.1; 
          this.cam.distance = clamp(this.cam.distance + Math.sign(event.deltaY) * step, 1.5, 160);
        },
        { passive: false }
      );
    }

    setTarget(x, y, z){ this.target.set(x, y, z); }

     updateCamera() {
      const cp = Math.cos(this.cam.pitch);
      const sp = Math.sin(this.cam.pitch);
      this.camera.position.set(
        this.target.x + this.cam.distance * cp * Math.sin(this.cam.yaw),
        this.target.y + this.cam.distance * sp,
        this.target.z + this.cam.distance * cp * Math.cos(this.cam.yaw)
      );
      this.camera.lookAt(this.target);
    }
    }