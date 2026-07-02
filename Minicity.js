import * as THREE from 'three';
import { box } from './MeshFactory.js';
import { Player, MAN, WOMAN } from './Player.js';
import { HUD } from './HUD.js';
import { Minimap } from './Minimap.js';
import { BaseGame } from './BaseGame.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class MiniCity extends BaseGame {
  constructor(engine) {
    super();
    this.initialize(engine);
    this.canvas = engine.renderer.domElement;
    this.size = 200;
    this.lines = Array.from({ length: this.size / 20 }, (_, i) => (i - 4) * 20);
    this.score = 0;
    this.timeLeft = 60;
    this.goal = 2;
    this.hud = new HUD();
    this.minimap = new Minimap(this.size);

    this.makeSky();
    this.buildWorld();
    this.setupExtras();
    this.setupCamera(this.canvas);
    this.setupMarker();
    this.hud.updateGoal(this.goal - this.score);
    this.hud.updateTime(this.timeLeft);
    this.lastX = this.player.group.position.x;
    this.lastZ = this.player.group.position.z;
  }

  initialize(engine) {
    super.initialize(engine);
  }

  buildWorld() {
    this.buildings = [];
    this.setCharacter(MAN);
    this.setupUI();
    this.setupInput();

    const ground = box(this.size, 1, this.size, 0x527342);
    ground.position.y = -0.5;
    this.scene.add(ground);

    const roadW = 10;
    for (const x of this.lines) {
      const road = box(roadW, 0.14, this.size, 0x38383d);
      road.position.set(x, 0.06, 0);
      this.scene.add(road);
    }
    for (const z of this.lines) {
      const road = box(this.size, 0.14, roadW, 0x38383d);
      road.position.set(0, 0.06, z);
      this.scene.add(road);
    }

    const palette = [0x8d8d99, 0x736b60, 0x9a6155, 0x5a8089, 0x80806b, 0x666b80];
    const mids = [-90, -70, -50, -30, -10, 10, 30, 50, 70, 90];
    const half = (20 - roadW) / 2;

    for (const bx of mids) {
      for (const bz of mids) {
        const w = 4 + Math.random() * 5;
        const d = 4 + Math.random() * 5;
        const h = 14 + Math.random() * 45;
        const building = box(w, h, d, palette[Math.floor(Math.random() * palette.length)]);
        const jx = (Math.random() * 2 - 1) * (half - w / 2);
        const jz = (Math.random() * 2 - 1) * (half - d / 2);
        building.position.set(bx + jx, h / 2, bz + jz);
        this.buildings.push({ x: bx + jx, z: bz + jz, hw: w / 2, hd: d / 2 });
        this.scene.add(building);
      }
    }
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

  setupExtras() {}
  updateExtras(dt) {}

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
    this.player.group.position.set(4, 0, 4);
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
      x = this.lines[Math.floor(Math.random() * this.lines.length)];
      z = this.lines[Math.floor(Math.random() * this.lines.length)];
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
    const pos = this.player.group.position;

    for (const building of this.buildings) {
      if (
        Math.abs(pos.x - building.x) < building.hw + pushRadius &&
        Math.abs(pos.z - building.z) < building.hd + pushRadius
      ) {
        pos.x = this.lastX;
        pos.z = this.lastZ;
        return;
      }
    }
  }

  update(dt) {
    if (this.gameOver) return;

    const k = this.keys;
    const forward = (k['KeyW'] || k['KeyZ'] || k['ArrowUp'] ? 1 : 0) - (k['KeyS'] || k['ArrowDown'] ? 1 : 0);
    const turn = (k['KeyD'] || k['ArrowRight'] ? 1 : 0) - (k['KeyA'] || k['KeyQ'] || k['ArrowLeft'] ? 1 : 0);
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
        this.hud.showWin(() => {
          window.location.href = 'night.html';
        });
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
