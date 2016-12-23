import {Cell} from './cell';

export class Field {
  constructor(eng, colsCount) {
    this.colsCount = colsCount;
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

    this.area = cols;
  }

  colsCount;
  cellSize;
  rowsCount;
  area;

  getRowsCount() {
    return this.rowsCount;
  }

  getColsCount() {
    return this.colsCount;
  }

  get(x, y) {
    return this.area[x][y];
  }

  getState(x, y) {
    return this.area[x][y].state;
  }

  getRawField() {
    return this.area;
  }

  clearRow(y) {
    if (y >= 0 && y < this.rowsCount)
      for (let x = this.colsCount; x--;) {
        this.area[x][y].off();
      }
  }

  clear() {
    for (let y = this.rowsCount;  y--;) {
      for (let x = this.colsCount; x--;) {
        this.area[x][y].clear();
      }
    }
  }

  downShift(from_y) {
    for (let y = from_y; y > 0; y--) {
      for (let x = this.colsCount; x--;) {
        this.area[x][y].state = this.area[x][y - 1].state;
        this.area[x][y].obj.color = this.area[x][y - 1].obj.color;
        this.area[x][y - 1].off();
      }
    }
  }
}
