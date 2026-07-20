export class BaseGame {
  constructor() {
    this.gameOver = false;
  }

  initialize(engine) {
    this.engine = engine;
    this.scene = engine.scene;
    this.camera = engine.camera;
  }


}
