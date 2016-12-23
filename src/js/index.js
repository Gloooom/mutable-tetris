import './../styles/index.scss';

import {Engine} from './engine';
import {Tetris} from './tetris';


window.addEventListener('load', function () {
  const engine = new Engine(document.getElementById("glass"));
  const tetris = new Tetris(engine);

  engine.start();
});
