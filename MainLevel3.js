import { Engine } from './Engine.js';
import { MiniGalaxy } from './js/games//MiniGalaxy.js';
export class MainLevel3 {
  constructor() {
    this.engine = new Engine(document.getElementById('gfx'));
    this.game = new MiniGalaxy(this.engine, 10, 10, 20);
    this.engine.start(this.game);
  }
}