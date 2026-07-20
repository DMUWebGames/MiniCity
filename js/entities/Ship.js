import * as THREE from 'three';
import { box } from '../core/MeshFactory.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Ship {
  constructor(){
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);   // ◄ au centre de l'écran
    this.radius = 1.1;                  // ◄ pour les collisions
    this.build();
  }

  build(){
    // nez : un cône qui pointe vers l'avant
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 2.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x3aa0ff, metalness: 0.4, roughness: 0.35 })
    );
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -0.6;

    /** ailes */
    const wing = box(3, 0.18, 0.9, 0x1b6fc4);
    wing.position.z = 0.4;

    /** réacteur */
    this.glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x9fe8ff })
    );
    this.glow.position.z = 1.2;

    this.group.add(nose, wing, this.glow);
  }

  /** mx : gauche/droite | my : haut/bas */
  update(dt, mx, my){
    const LIMX = 16, LIMY = 10;

    // déplacement dans le plan (le vaisseau n'avance pas lui-même)
    this.group.position.x = clamp(this.group.position.x + mx * 20 * dt, -LIMX, LIMX);
    this.group.position.y = clamp(this.group.position.y + my * 16 * dt, -LIMY, LIMY);

    // inclinaison pour le ressenti
    this.group.rotation.z = -mx * 0.5;    // roule en virage
    this.group.rotation.x =  my * 0.25;   // cabre/pique légèrement

    // le réacteur pulse
    this.glow.scale.setScalar(1 + Math.sin(performance.now() * 0.01) * 0.15);
  }

  get position(){ return this.group.position; }
}