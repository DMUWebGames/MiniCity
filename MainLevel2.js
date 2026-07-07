import {Engine} from './js/core/Engine.js';
import {NightCity} from './js/games/NightCity.js';


const engine = new Engine(document.getElementById('gfx'));
const game = new NightCity(engine);
engine.start(game);