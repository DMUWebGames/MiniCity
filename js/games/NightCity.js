import * as THREE from 'three';
import { MiniCity } from './Minicity.js';
import { box } from '../core/MeshFactory.js';

export class NightCity extends MiniCity {
  makeSky() {
    this.scene.background = new THREE.Color(0x081828);
    this.scene.children.filter((child) => child.isLight).forEach((light) => this.scene.remove(light));
    this.scene.add(new THREE.HemisphereLight(0x445577, 0x101820, 0.55));
    const moonLight = new THREE.DirectionalLight(0x99c8ff, 0.95);
    moonLight.position.set(-8, 18, -6);
    moonLight.castShadow = false;
    this.scene.add(moonLight);
    this.scene.add(new THREE.AmbientLight(0x556677, 0.35));

    const moonGlow = new THREE.PointLight(0xb0d8ff, 0.8, 200, 2);
    moonGlow.position.set(-120, 110, -160);
    this.scene.add(moonGlow);

    const starCount = 900;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = 30 + Math.random() * 140;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4 })));

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(12, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xf5f3d0 })
    );
    moon.position.set(-120, 110, -160);
    this.scene.add(moon);
  }

  setupExtras() {
    this.cars = [];
    for (let i = 0; i < 6; i++) {
      const car = box(3, 2, 5, 0xcc2222);
      const lane = this.lines[Math.floor(Math.random() * this.lines.length)];
      if (Math.random() < 0.5) {
        car.position.set(Math.random() * 200 - 100, 1, lane);
        car.userData = { axis: 'x' };
      } else {
        car.position.set(lane, 1, Math.random() * 200 - 100);
        car.userData = { axis: 'z' };
      }
      this.scene.add(car);
      this.cars.push(car);
    }
  }

  updateExtras(dt) {
    if (!this.cars) return;
    const speed = 30;
    const p = this.player.group.position;
    for (const car of this.cars) {
      if (car.userData.axis === 'x') {
        car.position.x += speed * dt;
        if (car.position.x > 100) car.position.x = -100;
      } else {
        car.position.z += speed * dt;
        if (car.position.z > 100) car.position.z = -100;
      }

      if (Math.abs(p.x - car.position.x) < 2.8 && Math.abs(p.z - car.position.z) < 3.5) {
        this.gameOver = true;
        this.hud.showLose(() => this.restart());
        return;
      }
    }
  }
}
