import * as THREE from 'three';

export class Planet {
  constructor(scene, distance, size, texture){
    this.distance = distance;              
    this.radius = size;                    
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.1 + Math.random() * 0.2;    
    this.selfSpin = 0.2 + Math.random() * 0.5; 

    // la sphère
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 32, 32),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 })
    );

    // le pivot incliné => chaque planète orbite dans son propre plan
    this.pivot = new THREE.Object3D();
    this.pivot.rotation.x = (Math.random() - 0.5) * 1.6;
    this.pivot.rotation.z = (Math.random() - 0.5) * 1.6;
    this.pivot.add(this.mesh);
    scene.add(this.pivot);
  }

  update(dt){
    this.angle += this.speed * dt;
    this.mesh.position.set(
      Math.cos(this.angle) * this.distance,
      0,
      Math.sin(this.angle) * this.distance
    );
    this.mesh.rotation.y += this.selfSpin * dt;
  }

  // position réelle dans le monde (le pivot est incliné !)
  worldPosition(){
    const p = new THREE.Vector3();
    this.mesh.getWorldPosition(p);
    return p;
  }
}