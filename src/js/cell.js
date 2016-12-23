export class Cell {
  constructor(x, y, cellSize, creator) {
    this.obj = creator("#FFF",
      x * cellSize,
      y * cellSize,
      cellSize,
      cellSize
    );
  }

  state = false;

  invert() {
    this.state = !this.state;
  }

  off() {
    this.color("#FFF");
  }

  clear() {
    this.off();
    this.state = false;
  }

  color(color) {
    this.obj.color = color;
  }
}
