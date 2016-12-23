export class Cell {
  constructor(x, y, cellSize, creator) {
    this.state = false;
    this.obj = creator("#FFF",
      x * cellSize,
      y * cellSize,
      cellSize,
      cellSize
    );
  }

  invert() {
    this.state = !this.state;
  }

  off() {
    this.obj.color = "#FFF";
  }

  color(color) {
    this.obj.color = color;
  }
}
