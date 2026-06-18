
import * as THREE from 'three';

const canvas = document.getElementById('gfx');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87bdf0);

const camera = new THREE.PerspectiveCamera(55,window.innerWidth / window.innerHeight,0.1,1000);
camera.position.set(40, 45, 60);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x445544, 1.0));

const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(8, 14, 6);
scene.add(sun);

function createBox(width, height, depth, color) {
  const material = new THREE.MeshLambertMaterial({ color });
  const geometry = new THREE.BoxGeometry(width, height, depth);
  return new THREE.Mesh(geometry, material);
}

const ground = createBox(220, 1, 220, 0x52733f);
ground.position.y = -0.5;
scene.add(ground);

const roadPositions = [-40, -20, 0, 20, 40];

for (const x of roadPositions) {
  const road = createBox(8, 0.12, 200, 0x383a3e);
  road.position.set(x, 0.06, 0);
  scene.add(road);
}

for (const z of roadPositions) {
  const road = createBox(200, 0.12, 8, 0x383a3e);
  road.position.set(0, 0.06, z);
  scene.add(road);
}

const palette = [0x8d8d99, 0x736b60, 0x9a6155, 0x5a8089, 0x80806b, 0x666b80];
const blockCenters = [-30, -10, 10, 30];

for (const bx of blockCenters) {
  for (const bz of blockCenters) {
    const buildingCount = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < buildingCount; i++) {
      const width = 4 + Math.random() * 4;
      const depth = 4 + Math.random() * 4;
      const height = 5 + Math.random() * 16;
      const color = palette[Math.floor(Math.random() * palette.length)];

      const building = createBox(width, height, depth, color);
      building.position.set(
        bx + (Math.random() - 0.5) * 8,
        height / 2,
        bz + (Math.random() - 0.5) * 8
      );

      scene.add(building);
    }
  }
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
