import {Field} from './field';
import {Figure} from './figure';
import figures from './figures-presets';
import {getRandomInt, timezoneOffset} from './utils';
import {Stats} from './stats';

const COLS_COUNT = 10;

export class Tetris {
  constructor(engine) {
    this.field = new Field(engine, COLS_COUNT);

    this.engine = engine;
    this.engine.setFrameFunc((delta) => this.frameFunction(delta));

    this.stats = new Stats();
  }

  activeFigure;
  field;
  stats;
  loss = false;
  step = false;
  score = 0;

  checkThrow(fig) {
    let checkRows = [],
      isSet = false,
      i, j,
      fullRowsCount = 0;

    for (i = fig.squares.length; i--;) {
      isSet = false;

      for (j = checkRows.length; j--;) {
        if (fig.squares[i].y === checkRows[j]) {
          isSet = true;
          break;
        }
      }

      if (!isSet) {
        checkRows.push(fig.squares[i].y);
      }
    }

    checkRows.sort();

    for (i = 0; i < checkRows.length; i++) {
      let rowIsFull = true;

      for (let x = this.field.getColsCount(); x--;) {
        if (checkRows[i] >= 0 && checkRows[i] < this.field.getRowsCount()
          && !this.field.getState(x, checkRows[i])) {
          rowIsFull = false;
          break;
        }
      }

      if (rowIsFull) {
        fullRowsCount++;
        this.field.clearRow(checkRows[i]);
        this.field.downShift(checkRows[i]);
      }
    }

    if (fullRowsCount > 0) {
      this.addScore(Math.pow(2, 1 + fullRowsCount * 2));
    }
  }

  addScore(score) {
    this.score += score;
    this.stats.setScore(this.score);
  }

  newFig() {
    this.activeFigure = new Figure(figures[getRandomInt(0, figures.length - 1)], this.field, () => this.fail());

    this.activeFigure.setPos(5, 0);

    for (let i = getRandomInt(0, 3); i--;) {
      this.activeFigure.action("rotate");
    }
  }

  fail() {
    this.loss = true;
    this.engine.showOverlay('FAIL');
    this.stats.stopTimer();
  }

  frameFunction(delta) {
    if (this.loss) {
      return false;
    }

    if (!this.activeFigure) {
      this.newFig();
    }

    if (!this.activeFigure.active) {
      this.checkThrow(this.activeFigure);
      this.newFig();
    }

    this.activeFigure.draw();

    if (!Tetris.deltaTimeFall) {
      Tetris.deltaTimeFall = 0;
    }

    if (!Tetris.deltaTimeMove) {
      Tetris.deltaTimeMove = 0;
    }

    if (Tetris.deltaTimeFall < 0) {//<----WTF???
      Tetris.deltaTimeFall = 0;
      Tetris.deltaTimeMove = 0;
    }

    Tetris.deltaTimeFall += delta;
    Tetris.deltaTimeMove += delta;

    if (Tetris.deltaTimeFall >= 400) {
      Tetris.deltaTimeFall = 0;
      this.activeFigure.action("move", 0, 1);
    }

    if (Tetris.deltaTimeMove >= 200) {
      Tetris.deltaTimeMove = 0;
      this.step = false;
    }

    this.engine.setKeyEvent("83", "press", () => {
      this.activeFigure.action("move", 0, 1);
    });

    this.engine.setKeyEvent("65", "press", () => {
      if (!this.step) {
        this.activeFigure.action("move", -1, 0);
        this.step = true;
      }
    });

    this.engine.setKeyEvent("68", "press", () => {
      if (!this.step) {
        this.activeFigure.action("move", 1, 0);
        this.step = true;
      }
    });

    this.engine.setKeyEvent("32", "down", () => {
      this.activeFigure.action("rotate");
    });

    this.engine.setKeyEvent("87", "down", () => {
      if (!this.step) {
        this.activeFigure.action("fall");
        this.step = true;
      }
    });

    this.engine.setKeyEvent("81", "up", () => {
      if (this.engine.inAction) {
        this.engine.stop();
        this.engine.showOverlay('PAUSE');
        this.stats.stopTimer();
      } else {
        this.engine.start();
        this.engine.hideOverlay();
        this.stats.startTimer();
      }
    });

    this.engine.setKeyEvent("82", "up", () => {
      this.reset();
      this.step = true;
    });

    return true;
  }

  reset() {
    this.engine.hideOverlay();
    this.score = 0;
    this.stats.reset();
    this.activeFigure.fall();
    this.field.clear();
  }
}
