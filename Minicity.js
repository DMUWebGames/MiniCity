import * as THREE from 'three';
import { Engine } from './Engine.js';
import { Player, MAN, WOMAN } from './Player.js';

const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

export class MiniCity {
  constructor(engine){
    this.scene  = engine.scene;
    this.camera = engine.camera;
    this.canevas = engine.renderer.domElement;

    this.makeSky(); 
    this.buildWorld();
    this.setupCamera(this.canevas);
    this.score = 0;
    this.setupMarker();
    this.lastX = 0;
    this.lastZ = 0;
    this.setupSpeedHUD();
    this.timeLeft =30;
    this.gameOver = false;
    this.setupTimerHUD();
    this.goal = 2;
    this.setupGoalHUD();
     this.setupExtras(); 
     
  }
 buildWorld(){
  this.buildings = [];
  this.setCharacter(MAN);
  this.setupUI();
  this.setupInput();

  const ground = Engine.box(220,1,220,0x527342);
  ground.position.y = -0.5;
  this.scene.add(ground);

  const lines = [-60,-40,-20,0,20,40,60];
  const roadW = 10;
  for(const x of lines){ const r=Engine.box(roadW,0.14,200,0x38383d); r.position.set(x,0.06,0); this.scene.add(r); }
  for(const z of lines){ const r=Engine.box(200,0.14,roadW,0x38383d); r.position.set(0,0.06,z); this.scene.add(r); }

  const palette = [0x8d8d99,0x736b60,0x9a6155,0x5a8089,0x80806b,0x666b80];
  const mids = [-50,-30,-10,10,30,50];
  const half = (20 - roadW) / 2;         

  for(const bx of mids) for(const bz of mids){
    const w = 4 + Math.random()*5;       
    const d = 4 + Math.random()*5;
    const h = 14 + Math.random()*45;
    const b = Engine.box(w, h, d, palette[Math.random()*palette.length|0]);

    
    const jx = (Math.random()*2 - 1) * (half - w/2);
    const jz = (Math.random()*2 - 1) * (half - d/2);
    b.position.set(bx + jx, h/2, bz + jz);
    this.buildings.push({ x: bx + jx, z: bz + jz, hw: w/2, hd: d/2 });

    this.scene.add(b);
  }
}
makeSky(){
  this.scene.background = new THREE.Color(0x87bdf0);
  /**Sun */
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(14, 24, 24),
    new THREE.MeshBasicMaterial({color: 0xffe066})
  );
  sun.position.set(120, 110, -160);
  this.scene.add(sun);
}

setupExtras(){}
updateExtras(dt){}

  setupCamera(canvas){
    this.target=new THREE.Vector3(0,4,0);
    this.cam={yaw: Math.PI,pitch:0.45,distance:14};
    this.dragging =false;
    let lx=0,ly=0;
    canvas.addEventListener('pointerdown',e=>{this.dragging =true;lx=e.clientX;ly=e.clientY;});
    canvas.addEventListener('pointermove',e=>{if(!this.dragging)return;
      this.cam.yaw-=(e.clientX-lx)*0.005; this.cam.pitch=clamp(this.cam.pitch+(e.clientY-ly)*0.005,0.1,1.4);
      lx=e.clientX;ly=e.clientY;});
    canvas.addEventListener('pointerup',()=>this.dragging =false);
    canvas.addEventListener('wheel',e=>{e.preventDefault();
      this.cam.distance=clamp(this.cam.distance+Math.sign(e.deltaY)*6,20,160);},{passive:false});
  }
  updateCamera(){
    const cp=Math.cos(this.cam.pitch),sp=Math.sin(this.cam.pitch);
    this.camera.position.set(
      this.target.x+this.cam.distance*cp*Math.sin(this.cam.yaw),
      this.target.y+this.cam.distance*sp,
      this.target.z+this.cam.distance*cp*Math.cos(this.cam.yaw));
    this.camera.lookAt(this.target);
  }
  setCharacter(style){
  if(this.player) this.scene.remove(this.player.group);  
  this.player = new Player(style);                       
  this.scene.add(this.player.group);
}
setupUI(){
  document.getElementById('btnH').onclick = () => this.setCharacter(MAN);
  document.getElementById('btnF').onclick = () => this.setCharacter(WOMAN);
}
setupInput(){
  this.keys = {};
  addEventListener('keydown', e => { this.keys[e.code] = true;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => { this.keys[e.code] = false; });
}
setupSpeedHUD(){
  this.speedEl = document.createElement('div');
  this.speedEl.style.cssText =
    'position:fixed;bottom:16px;right:20px;z-index:10;color:#fff;' +
    'font-family:sans-serif;font-weight:900;font-size:34px;text-align:right;text-shadow:0 2px 8px #000';
  document.body.appendChild(this.speedEl);
}
setupMarker(){
  this.marker = Engine.box(2, 5, 2, 0xffd433);   // poteau jaune
  this.scene.add(this.marker);
  this.moveMarker();
}

moveMarker(){
  const lines = [-60,-40,-20,0,20,40,60];
  let x, z;
  do {
    x = lines[Math.random()*lines.length|0];
    z = lines[Math.random()*lines.length|0];
  } while(this.player &&
          Math.hypot(this.player.group.position.x - x, this.player.group.position.z - z) < 20);
  this.marker.position.set(x, 2.5, z);
}
restart(){
  this.score = 0;
  this.timeLeft = 25;
  this.gameOver = false;
  this.lostEl.style.display = 'none';      
  this.winEl.style.display = 'none'; 
  this.player.group.position.set(4, 0, 4); 
  this.moveMarker();                       
}
setupTimerHUD(){
    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:10;color:#fff;' +
    'font-family:sans-serif;font-weight:900;font-size:32px;text-shadow:0 2px 8px #000';
    document.body.appendChild(this.timerEl);

    this.lostEl = document.createElement('div');
    this.lostEl.textContent = 'LOST';
    this.lostEl.style.cssText = 'position:fixed;inset:0;z-index:20;display:none;place-items:center;' +
    'background:#000a;color:#ff5555;font-family:sans-serif;font-weight:900;font-size:80px';

    this.startEl =document.createElement('button');
    this.startEl.textContent = 'Start';
    this.startEl.style.cssText =
    'font-size:24px;font-weight:bold;padding:10px 28px;border:0;border-radius:10px;' +
    'background:#fff;color:#000;cursor:pointer';

    this.winEl = document.createElement('div');
    this.winEl.style.cssText =
    'position:fixed;inset:0;z-index:20;display:none;flex-direction:column;gap:20px;' +
    'align-items:center;justify-content:center;background:#000a;' +
    'color:#5dff8f;font-family:sans-serif;font-weight:900;text-align:center';
    const wtxt = document.createElement('div');
    wtxt.textContent = 'Congratulations! You have reached the next level';
    wtxt.style.cssText = 'font-size:48px;max-width:80%';

    const wbtn = document.createElement('button');
    wbtn.textContent = 'Continue';
    wbtn.style.cssText =
    'font-size:24px;font-weight:bold;padding:10px 28px;border:0;border-radius:10px;' +
    'background:#fff;color:#000;cursor:pointer';
    wbtn.onclick = () => this.restart();
    wbtn.onclick = () => { window.location.href = 'night.html'; };

   this.winEl.append(wtxt, wbtn);
   document.body.appendChild(this.winEl);

    this.startEl.onclick = () => this.restart();
    this.lostEl.append( this.startEl);

    document.body.appendChild(this.lostEl);

}
setupGoalHUD(){
  this.goalEl = document.createElement('div');
  this.goalEl.style.cssText =
    'position:fixed;top:12px;right:12px;z-index:10;color:#fff;' +
    'font-family:sans-serif;font-weight:900;font-size:32px;text-shadow:0 2px 8px #000';
  document.body.appendChild(this.goalEl);
  this.updateGoal();
}

updateGoal(){
  const left = this.goal - this.score;
  this.goalEl.textContent = 'Deliveries left : ' + left;
}

resolveCollisions(){
  const pr = 1.2;
  const pos = this.player.group.position;
  for(const b of this.buildings){
    if(Math.abs(pos.x - b.x) < b.hw + pr &&
       Math.abs(pos.z - b.z) < b.hd + pr){
      pos.x = this.lastX;   
      pos.z = this.lastZ;
      return;
    }
  }
}
 update(dt){
  if(this.gameOver) return; 
  const k = this.keys;
  const fwd  = (k['KeyW']||k['KeyZ']||k['ArrowUp']   ? 1:0) - (k['KeyS']||k['ArrowDown']        ? 1:0);
  const str  = (k['KeyD']||k['ArrowLeft']           ? 1:0) - (k['KeyA']||k['KeyQ']||k['ArrowRight'] ? 1:0);
  const jump = !!k['Space'];
   

  this.player.update(dt, fwd, str, jump, this.camera);
  this.resolveCollisions();

   if((fwd !== 0 || str !== 0) && !this.dragging){
    const want = this.player.group.rotation.y + Math.PI;
    let d = want - this.cam.yaw;
    while(d >  Math.PI) d -= 2*Math.PI;
    while(d < -Math.PI) d += 2*Math.PI;
    this.cam.yaw += d * Math.min(1, dt*4);
  }

  /**the camera follows the person */
  const p = this.player.group.position;

  /** speed = distance traveled / elapsed time */
const moved = Math.hypot(p.x - this.lastX, p.z - this.lastZ);
const kmh = dt > 0 ? Math.round((moved / dt) * 8) : 0;
this.lastX = p.x;
this.lastZ = p.z;
this.speedEl.textContent = kmh + ' KM/H';

  const dx = p.x - this.marker.position.x;
  const dz = p.z - this.marker.position.z;
  if(Math.hypot(dx, dz) < 4){
    this.score++;
    this.moveMarker();
     this.timeLeft = 25; 
     this.updateGoal();
    if(this.score >= this.goal){    
    this.gameOver = true;
    this.winEl.style.display = 'flex';
  }
  }

  
  this.marker.rotation.y += dt * 2;

  this.target.set(p.x, p.y + 3, p.z);

  /**chrono*/
this.timeLeft -= dt;  /**breakdown  */
this.timerEl.textContent = Math.max(0, this.timeLeft).toFixed(1) + ' s';
if(this.timeLeft <= 0){
  this.gameOver = true;
  this.lostEl.style.display = 'grid';  
}
  this.updateExtras(dt); 
  this.updateCamera();
}


}