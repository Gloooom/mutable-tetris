import {Cell} from './cell';

export class Field {
  constructor(eng) {
    this.colsCount = 10;
    this.cellSize = eng.width / this.colsCount;
    this.rowsCount = eng.height / this.cellSize;

    let row = [],
      cols = [];

    let createCell = (...args) => eng.createObj(...args);

    for (let i = 0; i < this.colsCount; i++) {
      row = [];

      for (let j = 0; j < this.rowsCount; j++) {
        row.push(new Cell(i, j, this.cellSize, createCell));
      }

      cols.push(row);
    }

    this.cols = cols;
  }

  getRowsCount() {
    return this.rowsCount;
  }

  getColsCount() {
    return this.colsCount;
  }

  get(x, y) {
    return this.cols[x][y];
  }

  getState(x, y) {
    return this.cols[x][y].state;
  }

  getRawField() {
    return this.cols;
  }

  clearRow(y) {
    if (y >= 0 && y < this.rowsCount)
      for (let x = this.colsCount; x--;) {
        this.cols[x][y].off();
      }
  }

  downShift(from_y) {
    for (let y = from_y; y > 0; y--) {
      for (let x = this.colsCount; x--;) {
        this.cols[x][y].state = this.cols[x][y - 1].state;
        this.cols[x][y].obj.color = this.cols[x][y - 1].obj.color;
        this.cols[x][y - 1].off();
      }
    }
  }
}
