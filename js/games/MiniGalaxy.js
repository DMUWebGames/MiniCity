import * as THREE from 'three';
import { Ship } from '../entities/Ship.js';
import { HUD } from '../ui/HUD.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const GOAL = 5, FAR = -260, LIMX = 16, LIMY = 10;

export class MiniGalaxy {
  constructor(engine){
    this.scene  = engine.scene;
    this.camera = engine.camera;                 
    this.scene.background = new THREE.Color(0x02030a);

    this.hud = new HUD();

    this.setupLights();
    this.buildGalaxy();
    this.buildStars();
    this.setupObstacles();
    this.setupTargets();

    this.ship = new Ship();
    this.scene.add(this.ship.group);
    this.setupInput();
    this.restart();
  }

  setupLights(){
    /** on retire les lumières de jour de l'Engine */
    this.scene.children.filter(o => o.isLight).forEach(l => this.scene.remove(l));
    this.scene.add(new THREE.AmbientLight(0x556677, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 8, 10);
    this.scene.add(key);
  }

  buildGalaxy(){
    const count = 40000, radius = 90, branches = 3, spin = 1, rnd = 0.35, power = 3;
    const pos = new Float32Array(count*3), col = new Float32Array(count*3);
    const cIn = new THREE.Color(0xff6030), cOut = new THREE.Color(0x1b3984);

    for(let i = 0; i < count; i++){
      const i3 = i*3, r = Math.random()*radius;
      const branch = (i % branches)/branches * Math.PI*2, spinA = r*spin;
      const rx = Math.pow(Math.random(), power)*(Math.random()<.5?1:-1)*rnd*r;
      const ry = Math.pow(Math.random(), power)*(Math.random()<.5?1:-1)*rnd*r;
      const rz = Math.pow(Math.random(), power)*(Math.random()<.5?1:-1)*rnd*r;
      pos[i3]   = Math.cos(branch+spinA)*r + rx;
      pos[i3+1] = ry;
      pos[i3+2] = Math.sin(branch+spinA)*r + rz;
      const mix = cIn.clone().lerp(cOut, r/radius);
      col[i3] = mix.r; col[i3+1] = mix.g; col[i3+2] = mix.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    this.galaxy = new THREE.Points(g, new THREE.PointsMaterial({
      size: 0.5, sizeAttenuation: true, depthWrite: false,
      blending: THREE.AdditiveBlending, vertexColors: true
    }));
    this.galaxy.rotation.x = Math.PI/2.4;      
    this.galaxy.position.set(0, -10, -120);
    this.scene.add(this.galaxy);
  }

  buildStars(){
    this.N = 900;
    const sp = new Float32Array(this.N*3);
    for(let i = 0; i < this.N; i++){
      sp[i*3]   = (Math.random()-0.5)*120;
      sp[i*3+1] = (Math.random()-0.5)*80;
      sp[i*3+2] = -Math.random()*300;
    }
    this.starGeo = new THREE.BufferGeometry();
    this.starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.scene.add(new THREE.Points(this.starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));
  }

  /** planètes SOMBRES = obstacles à éviter */
  setupObstacles(){
    const DARK = [0x1a1a22, 0x241c1c, 0x1c2430, 0x2a2420];
    this.obstacles = [];
    for(let i = 0; i < 10; i++){
      const size = 1.2 + Math.random()*2.6;
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(size, 28, 28),
        new THREE.MeshStandardMaterial({ color: DARK[i % DARK.length], roughness: 1 })
      );
      m.userData = { r: size, spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()) };
      this.scene.add(m);
      this.obstacles.push(m);
    }
  }

  /** planètes TEXTURÉES = à récupérer */
  setupTargets(){
    const loader = new THREE.TextureLoader();
    const names = ['earth','mars','venus','neptune','uranus','saturn','pluto','moon','exo_green','exo_purple'];
    this.planetTex = names.map(n => loader.load('texture/' + n + '.png'));

    this.targets = [];
    for(let i = 0; i < 5; i++){
      const size = 1.2 + Math.random()*2.6;
      const c = new THREE.Mesh(
        new THREE.SphereGeometry(size, 28, 28),
        new THREE.MeshStandardMaterial({ map: this.planetTex[i % this.planetTex.length], roughness: 0.85 })
      );
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(size*1.35, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x36e0c0, transparent: true, opacity: 0.16 })
      );
      c.add(halo);
      c.userData = { r: size };
      this.scene.add(c);
      this.targets.push(c);
    }
  }

  setupInput(){
    this.keys = {};
    addEventListener('keydown', e => { this.keys[e.code] = true;
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
  }

  respawn(o){
    o.position.set(
      (Math.random()-0.5)*LIMX*2.4,
      (Math.random()-0.5)*LIMY*2.4,
      FAR - Math.random()*200
    );
  }
  pick(a){ return a[Math.floor(Math.random()*a.length)]; }

  restart(){
    this.score = 0; this.lives = 3; this.timeLeft = 60;
    this.speed = 34; this.gameOver = false; this.invuln = 0;
    this.hud.hideLose(); this.hud.hideWin();
    this.ship.group.position.set(0, 0, 0);
    for(const o of this.obstacles) this.respawn(o);
    for(const c of this.targets)   this.respawn(c);
     this.hud.updateGoal(GOAL - this.score, 'Planètes'); 
  }

  endGame(win){
    this.gameOver = true;
    if(win) this.hud.showWin(() => location.reload());
    else    this.hud.showLose(() => this.restart());
  }

  update(dt){
    this.galaxy.rotation.z += dt * 0.03;
    if(this.gameOver) return;

    /** pilotage : uniquement latéral  */ 
    const k = this.keys;
    const mx = (k['KeyD']||k['ArrowRight'] ? 1:0) - (k['KeyA']||k['KeyQ']||k['ArrowLeft'] ? 1:0);
    const my = (k['KeyW']||k['KeyZ']||k['ArrowUp'] ? 1:0) - (k['KeyS']||k['ArrowDown'] ? 1:0);
    this.ship.update(dt, mx, my);

    const p = this.ship.group.position;

    /** caméra derrière */
    this.camera.position.set(p.x*0.35, p.y*0.35 + 2.5, 12);
    this.camera.lookAt(p.x*0.5, p.y*0.5, -25);

    this.speed += dt * 0.7;                 
    if(this.invuln > 0) this.invuln -= dt;

    /** étoiles qui défilent  */
    const sPos = this.starGeo.attributes.position.array;
    for(let i = 0; i < this.N; i++){
      sPos[i*3+2] += this.speed*dt;
      if(sPos[i*3+2] > 12) sPos[i*3+2] = -300;
    }
    this.starGeo.attributes.position.needsUpdate = true;

    /** obstacles */ 
    for(const o of this.obstacles){
      o.position.z += this.speed*dt;
      o.rotation.x += o.userData.spin.x*dt*0.4;
      o.rotation.y += o.userData.spin.y*dt*0.4;
      if(o.position.z > 12) this.respawn(o);

      if(this.invuln <= 0 &&
         Math.abs(o.position.z - p.z) < o.userData.r + 1 &&
         Math.hypot(p.x - o.position.x, p.y - o.position.y) < o.userData.r + this.ship.radius){
        this.lives--; this.invuln = 1.4;
        this.respawn(o);
        if(this.lives <= 0) this.endGame(false);
      }
    }

    /** planètes à récupérer */ 
    for(const c of this.targets){
      c.position.z += this.speed*dt;
      c.rotation.y += dt*0.6;
      if(c.position.z > 12) this.respawn(c);

      if(Math.abs(c.position.z - p.z) < c.userData.r + 1 &&
         Math.hypot(p.x - c.position.x, p.y - c.position.y) < c.userData.r + this.ship.radius){
        this.score++;
        this.timeLeft = Math.min(this.timeLeft + 4, 60);
        c.material.map = this.pick(this.planetTex);   
        c.material.needsUpdate = true;
        this.respawn(c);
        this.hud.updateGoal(GOAL - this.score);
        if(this.score >= GOAL) this.endGame(true);
      }
    }

    /**  chrono */ 
    this.timeLeft -= dt;
    this.hud.updateTime(this.timeLeft);
    if(this.timeLeft <= 0) this.endGame(false);

    this.ship.group.visible = this.invuln > 0 ? (Math.floor(performance.now()/80) % 2 === 0) : true;
    this.hud.updateSpeed(Math.round(this.speed * 8));
  }
}