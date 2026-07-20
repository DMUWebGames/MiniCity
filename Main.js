import { Engine } from './js/core/Engine.js';
import { MiniCity } from './js/games/Minicity.js';

const engine = new Engine(document.getElementById('gfx'));
const game   = new MiniCity(engine, 9, 10, 18);
engine.start(game);