import {Engine} from './Engine.js';
import {NightCity} from './NightCity.js';


const engine = new Engine(document.getElementById('gfx'));
const game = new NightCity(engine);
engine.start(game);