
class GObj {
  constructor(color, x, y, width, height) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  color = '#FFFFFF';
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

export class Engine {
  constructor(canvas) {
    this.setCanvas(canvas);

    const checkKeyEvent = (event, state) => {
      let key = this.getKeyCode(event);

      if (key in this.downKeys && state === 'up') {
        this.downKeys.splice(key, 1);
      } else {
        this.downKeys[key] = true;
      }

      if (this.keyEvents.hasOwnProperty(key) && this.keyEvents[key].hasOwnProperty(state)) {
        this.keyEvents[key][state]();
      }
    };

    document.addEventListener('keydown', (event) => checkKeyEvent(event, 'down'));
    document.addEventListener('keyup', (event) => checkKeyEvent(event, 'up'));

    window.eng = this;
  }

  width = 0;
  height = 0;
  objectsForDelete = [];
  downKeys = [];
  objects = [];
  startFrameTime;
  frameDeltaTime;
  canvas;
  frame = () => {};
  intervalID;
  inAction = false;
  keyEvents = {};
  timeout = 1000 / 50;

  getTime() {
    let date = new Date();
    return date.getMilliseconds() + date.getSeconds() * 1000;
  }

  getKeyCode(event) {
    let keycode;

    if (!event) {
      event = window.event;
    }

    if (event.keyCode != null) {
      keycode = event.keyCode;// IE
    } else if (event.which != null) {
      keycode = event.which;
    }

    return keycode;
  }

  setFrameFunc(fn) {
    this.frame = fn;
  }

  setKeyEvent(key, event, fn) {
    if (!this.keyEvents.hasOwnProperty(key)) {
      this.keyEvents[key] = {};
    }

    this.keyEvents[key][event] = fn;
  }

  setCanvas(canvas) {
    this.canvas = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  setTimeout(ms) {
    this.timeout = ms;
  }

  getPressKeys() {
    return this.downKeys.slice();
  }

  createObj(color, x, y, width, height) {
    let obj = new GObj(color, x, y, width, height);
    
    this.objects.push(obj);
    
    return obj;
  }

  deleteObj(obj) {
    this.objectsForDelete.push(obj);
  }

  start() {
    this.inAction = true;

    this.intervalID = setInterval(() => {
      let delObjCount = this.objectsForDelete.length,
        now = this.getTime();

      if (!this.inAction) {
        clearInterval(this.intervalID);
      } else {
        for (let key in this.downKeys) {
          if (this.downKeys.hasOwnProperty(key)
            && this.keyEvents.hasOwnProperty(key)
            && this.keyEvents[key].hasOwnProperty("press")) {
            this.keyEvents[key]["press"]();
          }
        }

        while (delObjCount--) {
          this.objects.splice(this.objects.indexOf(this.objectsForDelete[delObjCount]), 1);
          this.objectsForDelete.pop();
        }

        this.frameDeltaTime = now - this.startFrameTime;
        this.startFrameTime = now;
        this.clear();

        if (!this.frame(this.frameDeltaTime)) {
          this.inAction = false;
        }

        this.drawAll();
      }
    }, this.timeout);
  }

  stop() {
    this.inAction = false;
  }

  drawAll() {
    let i = this.objects.length;

    while (i--) {
      this.objects[i].draw(this.canvas);
    }
  }

  clear() {
    this.canvas.clearRect(0, 0, this.width, this.height);
  }
}
