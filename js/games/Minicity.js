import * as THREE from 'three';
import { box } from '../core/MeshFactory.js';
import { Player, MAN, WOMAN } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { Minimap } from '../ui/Minimap.js';
import { BaseGame } from '../core/BaseGame.js';
import { Bird } from '../entities/Bird.js';
import { City } from '../entities/City.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class MiniCity extends BaseGame {
  constructor(engine,nRoads=10,roadWidth=10,blockSize=20) {
    super();
    this.initialize(engine);
    this.canvas = engine.renderer.domElement;

    this.nRoads = nRoads;
    this.roadWidth = roadWidth;
    this.blockSize = blockSize;
   
   this.score = 0;
    this.timeLeft = 60;
    this.goal = 1;
    this.hud = new HUD();
    

    this.makeSky();
    this.buildWorld();
    this.setupExtras();
    this.setupCamera(this.canvas);
    this.setupMarker();
    console.log(this.goal , this.score);
    this.hud.updateGoal(this.goal - this.score);
    this.hud.updateTime(this.timeLeft);
    this.lastX = this.player.group.position.x;
    this.lastZ = this.player.group.position.z;
    this.minimap = new Minimap(this.city.size);
  }

  initialize(engine) {
    super.initialize(engine);
  }

  buildWorld() {
    this.setupUI();
    this.setupInput();
    this.city = new City(this.scene,this.nRoads,this.roadWidth,this.blockSize);
    this.setCharacter(MAN);
  }

  makeSky() {
    this.scene.background = new THREE.Color(0x87bdf0);
    this.scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x9aa978, 1.4));
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(14, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe066 })
    );
    sun.position.set(120, 110, -160);
    this.scene.add(sun);
  }

 setupExtras(){
  this.birds = [];
  for(let i=0; i < 30; i++){
    const bird = new Bird();
    this.scene.add(bird.group);
    this.birds.push(bird);
  }
}
updateExtras(dt){
  for(const bird of this.birds) bird.update(dt);
}

  setupCamera(canvas) {
    this.target = new THREE.Vector3(0, 4, 0);
    this.cam = { yaw: Math.PI, pitch: 0.45, distance: 14 };
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
      this.cam.pitch = clamp(this.cam.pitch + (event.clientY - lastY) * 0.005, 0.1, 1.4);
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
        this.cam.distance = clamp(this.cam.distance + Math.sign(event.deltaY) * 6, 20, 160);
      },
      { passive: false }
    );
  }

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

  setCharacter(style) {
    if (this.player) this.scene.remove(this.player.group);
    this.player = new Player(style);
    const [x, z] = this.city.playerSpawnPosition();
    this.player.group.position.set(x, 0, z);
    this.scene.add(this.player.group);
    this.lastX = this.player.group.position.x;
    this.lastZ = this.player.group.position.z;
  }

  setupUI() {
    const btnH = document.getElementById('btnH');
    const btnF = document.getElementById('btnF');
    if (btnH) btnH.addEventListener('click', () => this.setCharacter(MAN));
    if (btnF) btnF.addEventListener('click', () => this.setCharacter(WOMAN));
  }

  setupInput() {
    this.keys = {};
    addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    });
    addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });
  }

  setupMarker() {
    this.marker = box(2, 5, 2, 0xffd433);
    this.marker.position.y = 2.5;
    this.scene.add(this.marker);
    this.moveMarker();
  }

  moveMarker() {
    let x;
    let z;
    do {
      [x, z] = this.city.randomPosition();
    } while (
      this.player &&
      Math.hypot(this.player.group.position.x - x, this.player.group.position.z - z) < 20
    );
    this.marker.position.set(x, 2.5, z);
  }

  restart() {
    this.score = 0;
    this.timeLeft = 60;
    this.gameOver = false;
    this.hud.hideLose();
    this.hud.hideWin();
    this.player.group.position.set(4, 0, 4);
    this.player.vy = 0;
    this.player.grounded = true;
    this.moveMarker();
    this.hud.updateGoal(this.goal - this.score);
    this.hud.updateTime(this.timeLeft);
  }

  resolveCollisions() {
    const pushRadius = 1.2;
    const playerPos = this.player.group.position;

    for (const building of this.city.buildings) {
      // const buildingPos = building.position;

      if (
        Math.abs(playerPos.x - building.x) < building.hw + pushRadius &&
        Math.abs(playerPos.z - building.z) < building.hd + pushRadius
      ) {
        playerPos.x = this.lastX;
        playerPos.z = this.lastZ;
        return;
      }
    }
  }
  onWin() {
    this.hud.showWin(() => {
          window.location.href = 'level2.html';
        });
      }

  update(dt) {
    if (this.gameOver) return;

    const k = this.keys;
    const forward = (k['KeyW'] || k['KeyZ'] || k['ArrowUp'] ? 1 : 0) - (k['KeyS'] || k['ArrowDown'] ? 1 : 0);
    const turn = (k['KeyD'] || k['ArrowLeft'] ? 1 : 0) - (k['KeyA'] || k['KeyQ'] || k['ArrowRight'] ? 1 : 0);
    const jump = !!k['Space'];

    this.player.update(dt, forward, turn, jump);
    this.resolveCollisions();

    if ((forward !== 0 || turn !== 0) && !this.dragging) {
      const desired = this.player.group.rotation.y + Math.PI;
      let delta = desired - this.cam.yaw;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      this.cam.yaw += delta * Math.min(1, dt * 4);
    }

    const position = this.player.group.position;
    const moved = Math.hypot(position.x - this.lastX, position.z - this.lastZ);
    const kmh = dt > 0 ? Math.round((moved / dt) * 8) : 0;
    this.lastX = position.x;
    this.lastZ = position.z;
    this.hud.updateSpeed(kmh);

    const distanceToMarker = Math.hypot(position.x - this.marker.position.x, position.z - this.marker.position.z);
    if (distanceToMarker < 4) {
      this.score += 1;
      this.moveMarker();
      this.timeLeft = 60;
      this.hud.updateGoal(this.goal - this.score);
      if (this.score >= this.goal) {
        this.gameOver = true;
        this.onWin();
      }
    }

    this.marker.rotation.y += dt * 2;
    this.target.set(position.x, position.y + 3, position.z);

    this.timeLeft -= dt;
    this.hud.updateTime(this.timeLeft);
    if (this.timeLeft <= 0) {
      this.gameOver = true;
      this.hud.showLose(() => this.restart());
    }

    this.updateExtras(dt);
    this.updateCamera();
    this.minimap.draw(position, this.player.group.rotation.y, this.marker.position);
  }
}
