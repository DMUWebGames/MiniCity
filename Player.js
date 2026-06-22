import * as THREE from 'three';
import { Engine } from './Engine.js';

/**two predefined characters (just data: colors + options) */
export const MAN = { skin:0xf5cc30, torso:0x0e85c6, legs:0x4d9e45, hair:0x4a2f1a, longHair:false, skirt:false };
export const WOMAN = { skin:0xf3c9a0, torso:0xd94f8a, legs:0x6a4bd6, hair:0x3a2412, longHair:true,  skirt:true  };

export class Player {
  constructor(style = MAN){
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.vy = 0;
    this.grounded = true;
    this.phase = 0;
    this.amp = 0;
    const s = style;

    const limb=(x,pivotY,w,h,d,col)=>{
      const p=new THREE.Group(); p.position.set(x,pivotY,0);
      const m=Engine.box(w,h,d,col); m.position.y=-h/2; p.add(m);
      this.group.add(p); return p;
    };
    this.legL=limb(-0.5,2,    .85,2,.85, s.legs);
    this.legR=limb( 0.5,2,    .85,2,.85, s.legs);
    this.armL=limb(-1.425,4,  .85,2,.85, s.skin);
    this.armR=limb( 1.425,4,  .85,2,.85, s.skin);

    const torso=Engine.box(2,2,1, s.torso); torso.position.y=3;    this.group.add(torso);
    const head =Engine.box(1.4,1.3,1.4, s.skin); head.position.y=4.65; this.group.add(head);

    for(const ex of [-0.32,0.32]){ const e=Engine.box(0.24,0.3,0.06,0x1a1a1a); e.position.set(ex,4.77,0.7); this.group.add(e); }
    const mouth=Engine.box(0.72,0.14,0.06,0x1a1a1a); mouth.position.set(0,4.37,0.7); this.group.add(mouth);

    /**hair */
    const hair=Engine.box(1.5,0.35,1.5, s.hair); hair.position.y=5.3; this.group.add(hair);
    if(s.longHair){ 
      const back=Engine.box(1.5,1.4,0.3, s.hair); back.position.set(0,4.3,-0.75); this.group.add(back);
    }
    if(s.skirt){ // une jupe qui couvre le haut des jambes
      const skirt=Engine.box(2.4,0.9,1.5, s.torso); skirt.position.y=1.9; this.group.add(skirt);
    }
  }
 update(dt, fwd, turn, jump){
  // tourner le perso (gauche/droite)
  this.group.rotation.y += turn * 2.2 * dt;          // 2.2 = vitesse de rotation

  // avancer / reculer DANS la direction où il regarde
  if(fwd !== 0){
    const yaw = this.group.rotation.y;
    this.group.position.x += Math.sin(yaw) * fwd * 7 * dt;
    this.group.position.z += Math.cos(yaw) * fwd * 7 * dt;
    this.phase += dt * 9;
    this.amp += (0.6 - this.amp) * Math.min(1, dt * 10);
  } else {
    this.amp += (0 - this.amp) * Math.min(1, dt * 10);
  }

  // saut + gravité (inchangé)
  if(jump && this.grounded){ this.vy = 11; this.grounded = false; }
  this.vy -= 26 * dt;
  this.group.position.y += this.vy * dt;
  if(this.group.position.y <= 0){ this.group.position.y = 0; this.vy = 0; this.grounded = true; }

  // animation de marche
  const a = Math.sin(this.phase) * this.amp;
  this.legL.rotation.x =  a; this.legR.rotation.x = -a;
  this.armL.rotation.x = -a; this.armR.rotation.x =  a;
}
}