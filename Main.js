import { Engine } from './js/core/Engine.js';
import { MiniCity } from './js/games/Minicity.js';

const engine = new Engine(document.getElementById('gfx'));
const game   = new MiniCity(engine, 5, 5, 6);
engine.start(game);