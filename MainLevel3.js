import { MiniGalaxy } from './js/games/MiniGalaxy.js';
import {Engine} from './js/core/Engine.js';


const engine = new Engine(document.getElementById('gfx'));
const game = new MiniGalaxy(engine);
engine.start(game); 
