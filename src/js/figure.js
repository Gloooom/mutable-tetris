import Tinycolor from 'tinycolor2';

import {getRandomInt} from './utils';
import {Square} from './square';

export class Figure {
  constructor(positions, field, onOutOfField) {
    this.pose = positions;
    this.sqCount = positions.length;
    this.field = field;

    for (let i = this.sqCount; i--;) {
      this.squares.push(new Square(this.pose[i][0], this.pose[i][1], this.color, field, onOutOfField));
    }
  }

  active = true;
  squares = [];
  actions = [];
  color = new Tinycolor({h: getRandomInt(0, 360), s: 0.7, v: 0.8}).toHexString();

  pose;
  sqCount;
  field;


  fix() {
    this.active = false;
    for (let i = this.sqCount; i--;) {
      this.squares[i].fix();
    }
  }

  action(name, ...args) {
    let answer;
    if (this.active) {
      this.clear();
      answer = this[name](...args);
      this.draw();
    }
    this.actions = [];
    return answer;
  }

  clear() {
    for (let i = this.sqCount; i--;) {
      this.squares[i].clear();
    }
  }

  draw() {
    this.clear();
    for (let i = this.sqCount; i--;) {
      this.squares[i].draw();
    }
  }

  getNearestFreeCell() {
    let nearestCell,
      i, sq,
      maxNearestCell = this.field.getRowsCount();
    for (sq = 0; sq < this.sqCount; sq++) {
      nearestCell = 0;
      for (i = (this.squares[sq].y < 0 ? 0 : this.squares[sq].y);
           i < this.field.getRowsCount(); i++) {
        if (!this.field.getState(this.squares[sq].x, i)) {
          nearestCell = i;
        } else {
          break;
        }
      }
      if (maxNearestCell > nearestCell - this.squares[sq].y)
        maxNearestCell = nearestCell - this.squares[sq].y;
    }

    return maxNearestCell;// - this.squares[collisionSq].y;
  }

  checkWay(x_, y_) {
    //console.log("x = " + x_ + ", y = " + y_);
    for (let i = this.sqCount; i--;) {
      let x = this.squares[i].x + x_,
        y = this.squares[i].y + y_;

      if (y < 0)
        return true;
      if (x > this.field.getColsCount() - 1 || x < 0) {
        return false;
      }
      if (y > this.field.getRowsCount() - 1 || this.field.getState(x, y)) {
        return false;
      }
    }
    return true;
  }

  hasOwn(x, y) {
    for (let i = this.sqCount; i--;) {
      if (this.squares[i].x === x && this.squares[i].y === y)
        return true;
    }
    return false;
  }

  //result.x = x * cost - y * sint;
  //result.y = x * sint + y * cost;

  rotatePose(dir) {
    let x = 0, y = 0;
    for (let i = this.sqCount; i--;) {
      this.squares[i].x -= this.pose[i][0];
      this.squares[i].y -= this.pose[i][1];
      if (dir) {
        x = 0 - this.pose[i][1];
        y = this.pose[i][0];
      } else {
        x = 0 - this.pose[i][1] * (-1);
        y = this.pose[i][0] * (-1);
      }
      this.pose[i][0] = x;
      this.pose[i][1] = y;
      this.squares[i].x += x;
      this.squares[i].y += y;
    }
  }

  rotate() {
    let delta_x = 0,
      delta_y = 0,
      tempDelta = 0,
      delta_x_m = 0,
      delta_y_m = 0,
      delta_x_p = 0,
      delta_y_p = 0;

    this.rotatePose(true);

    for (let i = this.sqCount; i--;) {
      if (this.squares[i].x < 0 && this.squares[i].x < delta_x) {
        delta_x = this.squares[i].x;
      } else if (this.squares[i].x >= this.field.getColsCount() && this.squares[i].x > delta_x) {
        delta_x = this.squares[i].x;
      }

      if (this.squares[i].y > this.field.getRowsCount() && delta_y < this.squares[i].y) {
        delta_y = this.squares[i].y
      }
    }

    if (delta_x > 0) {
      delta_x -= this.field.getColsCount() - 1;
    }

    if (delta_y > 0) {
      delta_y -= this.field.getRowsCount() - 1;
    }

    for (let i = this.sqCount; i--;) {
      this.squares[i].x -= delta_x;
      this.squares[i].y -= delta_y;

      if (this.squares[i].x >= 0 && this.squares[i].x < this.field.getColsCount()
        && this.squares[i].y >= 0 && this.squares[i].y < this.field.getRowsCount())
        if (this.field.getState(this.squares[i].x, this.squares[i].y)) {
          if (delta_x_m > this.pose[i][0])
            delta_x_m = this.pose[i][0];
          if (delta_y_m > this.pose[i][1])
            delta_y_m = this.pose[i][1];
          if (delta_x_p < this.pose[i][0])
            delta_x_p = this.pose[i][0];
          if (delta_y_p < this.pose[i][1])
            delta_y_p = this.pose[i][1];
        }
    }

    if ((delta_x_m !== 0) !== (delta_x_p !== 0)) {
      delta_x = (delta_x_m !== 0 ? delta_x_m : delta_x_p);
    } else {
      if (delta_x_m === 0 && delta_x_p === 0) {
        delta_x = 0;
      } else {
        for (let i = this.sqCount; i--;) {
          this.squares[i].x += delta_x;
          this.squares[i].y += delta_y;
        }

        this.rotatePose(false);
        return;
      }
    }

    if ((delta_y_m !== 0) !== (delta_y_p !== 0)) {
      delta_y = (delta_y_m !== 0 ? delta_y_m : delta_y_p);
    } else {
      delta_y = 0;
    }

    for (let i = this.sqCount; i--;) {
      this.squares[i].x -= delta_x;
      this.squares[i].y -= delta_y;
    }
  }

  setPos(x, y) {
    for (let i = this.sqCount; i--;) {
      this.squares[i].x = x + this.pose[i][0];
      this.squares[i].y = y + this.pose[i][1];
    }
  }

  move(x, y) {
    if (this.checkWay(x, y)) {
      for (let i = this.sqCount; i--;) {
        this.squares[i].x += x;
        this.squares[i].y += y;
      }

      return true;
    } else if (y !== 0) {
      this.fix();
      return false;
    }
  }

  fall() {
    this.move(0, this.getNearestFreeCell.call(this));
    this.fix();
  }
}
