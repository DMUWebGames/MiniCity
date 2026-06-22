import { Engine } from './Engine.js';
import { MiniCity } from './Minicity.js';

const engine = new Engine(document.getElementById('gfx'));
const game   = new MiniCity(engine);
engine.start(game);