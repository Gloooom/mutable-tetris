
export class Square {
  constructor(x, y, color, field, onOutOfField) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.field = field;
    this.onOutOfField = onOutOfField;
  }

  x;
  y;
  color;
  field;
  onOutOfField;

  draw() {
    if (this.y >= 0 && this.y < this.field.getRowsCount()) {
      this.field.get(this.x, this.y).color(this.color);
    }
  }

  clear() {
    if (this.y >= 0 && this.y < this.field.getRowsCount()) {
      this.field.get(this.x, this.y).off();
    }
  }

  fix() {
    if (this.y < 0) {
      this.onOutOfField();
    } else if (this.y < this.field.getRowsCount()) {
      this.field.get(this.x, this.y).state = true;
    }
  }
}
