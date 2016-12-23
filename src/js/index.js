import './../styles/index.scss';

import tinycolor from 'tinycolor2';

var Engine = (function Engine(canvas) {
  var objectsForDelete = [],
    downKeys = [],
    objects = [],
    startFrameTime,
    frameDeltaTime,
    GObj,
    canvas,
    frame = function () {
    },
    intervalID,
    inAction = false,
    keyEvents = {},
    timeout = 1000 / 50;

  document.addEventListener('keydown', function (event) {
    var key = getKeyCode(event);
    if (!(key in downKeys))
      downKeys[key] = true;
    if (keyEvents.hasOwnProperty(key) && keyEvents[key].hasOwnProperty("down"))
      keyEvents[key]["down"].fn.call(keyEvents[key]["down"].context);
  }.bind(this));
  document.addEventListener('keyup', function (event) {
    var key = getKeyCode(event);
    if (key in downKeys)
      delete downKeys[key];
    if (keyEvents.hasOwnProperty(key) && keyEvents[key].hasOwnProperty("up"))
      keyEvents[key]["up"].fn.call(keyEvents[key]["up"].context);
  }.bind(this));


  function getTime() {
    var date = new Date();
    return date.getMilliseconds() + date.getSeconds() * 1000;
  }

  function GObj(color, x, y, width, height) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  ;
  GObj.prototype = {
    draw: function (context) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  };

  function getKeyCode(event) {
    var keycode;
    if (!event)
      var event = window.event;
    if (event.keyCode) {
      getKeyCode = function (event) {
        if (!event)
          var event = window.event;
        return event.keyCode;
      }
      keycode = event.keyCode;// IE
    } else if (event.which) {
      getKeyCode = function (event) {
        if (!event)
          var event = window.event;
        return event.which; // all browsers
      }
      keycode = event.which;
    }
    return keycode;
  }

  function setFrameFunc(fn) {
    frame = fn;
  }

  function setKeyEvent(key, event, fn, context) {
    if (!keyEvents.hasOwnProperty(key))
      keyEvents[key] = {};
    keyEvents[key][event] = {fn: fn, context: context};
  }

  function setCanvas(cnv) {
    canvas = cnv.getContext('2d');
    this.width = cnv.width;
    this.height = cnv.height;
  }

  function setTimeout(ms) {
    this.timeout = ms;
  }

  function getPressKeys() {
    return downKeys;
  }

  function createObj(color, x, y, width, height) {
    var obj = new GObj(color, x, y, width, height)
    objects.push(obj);
    return obj;
  }

  function deleteObj(obj) {
    objectsForDelete.push(obj);
  }

  function start() {
    inAction = true;
    intervalID = setInterval(function () {
      var delObjCount = objectsForDelete.length,
        now = getTime();
      if (!inAction) {
        clearInterval(intervalID);
      } else {
        for (var key in downKeys)
          if (downKeys.hasOwnProperty(key))
            if (keyEvents.hasOwnProperty(key)) {
              if (keyEvents[key].hasOwnProperty("press"))
                keyEvents[key]["press"].fn.call(keyEvents[key]["press"].context);
            }
        while (delObjCount--) {
          objects.splice(objects.indexOf(objectsForDelete[delObjCount]), 1);
          objectsForDelete.pop();
        }
        frameDeltaTime = now - startFrameTime;
        startFrameTime = now;
        clear();
        if (!frame(frameDeltaTime))
          inAction = false;

        drawAll();
      }
    }.bind(this), timeout);
  }

  function stop() {
    inAction = false;
  }

  function drawAll() {
    var i = objects.length;
    while (i--) {
      objects[i].draw(canvas);
    }
  }

  function clear() {
    canvas.clearRect(0, 0, this.width, this.height);
  }

  return {
    setCanvas: setCanvas,
    setTimeout: setTimeout,
    setFrameFunc: setFrameFunc,
    setKeyEvent: setKeyEvent,
    frame: setFrameFunc,
    createObj: createObj,
    deleteObj: deleteObj,
    start: start,
    stop: stop,
    drawAll: drawAll,
    objects: objects
  };
}());


var Tetris = function Tetris(eng) {
  if (!(this instanceof Tetris)) {
    return new Tetris();
  }

  var colsCount = 10,
    cellSize = eng.width / colsCount,
    rowsCount = eng.height / cellSize,
    Figure,
    activeFg,
    field,
    figures,
    loss = false;

  figures = [
    [[-1, 0], [0, -1], [0, 0], [-1, -1]],
    [[-1, 0], [0, 0], [0, -1], [1, -1]],
    [[-1, -1], [0, -1], [0, 0], [1, 0]],
    [[-1, -1], [-1, 0], [0, 0], [1, 0]],
    [[-2, 0], [-1, 0], [0, 0], [0, -1]],
    [[-1, 0], [0, 0], [1, 0], [0, -1]],
    [[0, -1], [0, 0], [0, 1], [0, 2]]
  ];

  function Cell(x, y, cellSize) {
    this.state = false;
    this.obj = eng.createObj("#FFF",
      x * cellSize,
      y * cellSize,
      cellSize,
      cellSize
    );
  }

  Cell.prototype = {
    invert: function () {
      this.state = !this.state;
    },
    off: function () {
      this.obj.color = "#FFF";
    },
    color: function (color) {
      this.obj.color = color;
    }
  }

  field = (function () {
    var row = [],
      col = [];
    for (var i = 0; i < colsCount; i++) {
      row = [];
      for (var j = 0; j < rowsCount; j++) {
        row.push(new Cell(i, j, cellSize));
      }
      col.push(row);
    }
    return col;
  }());


  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function Square(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  Square.prototype = {
    draw: function () {
      if (this.y >= 0 && this.y < rowsCount)
        field[this.x][this.y].color(this.color);
    },
    clear: function () {
      if (this.y >= 0 && this.y < rowsCount)
        field[this.x][this.y].off();
    },
    fix: function () {
      if (this.y < 0) {
        loss = true;
      } else if (this.y < rowsCount) {
        field[this.x][this.y].state = true;
      }
    }
  }

  function Figure(positions) {
    this.active = true;
    this.pose = positions;
    this.sqCount = positions.length;
    this.squares = [];
    this.actions = [];
    this.color = new tinycolor({h: getRandomInt(0, 360), s: 0.7, v: 0.8}).toHexString();
    for (var i = this.sqCount; i--;) {
      this.squares.push(new Square(this.pose[i][0], this.pose[i][1], this.color));
    }
  }

  Figure.prototype = (function () {
    var actionFuncs = (function () {
      function getNearestFreeCell() {
        var nearestCell,
          i, sq,
          maxNearestCell = rowsCount;
        for (sq = 0; sq < this.sqCount; sq++) {
          nearestCell = 0;
          for (i = (this.squares[sq].y < 0 ? 0 : this.squares[sq].y);
               i < rowsCount; i++) {
            if (!field[this.squares[sq].x][i].state) {
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

      function checkWay(x_, y_) {
        //console.log("x = " + x_ + ", y = " + y_);
        for (var i = this.sqCount; i--;) {
          var x = this.squares[i].x + x_,
            y = this.squares[i].y + y_;

          if (y < 0)
            return true;
          if (x > colsCount - 1 || x < 0) {
            return false;
          }
          if (y > rowsCount - 1 || field[x][y].state) {
            return false;
          }
        }
        return true;
      }

      function hasOwn(x, y) {
        for (var i = this.sqCount; i--;) {
          if (this.squares[i].x === x && this.squares[i].y === y)
            return true;
        }
        return false;
      }

      //result.x = x * cost - y * sint;
      //result.y = x * sint + y * cost;

      function rotatePose(dir) {
        var x = 0, y = 0;
        for (var i = this.sqCount; i--;) {
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

      function rotate() {
        var delta_x = 0,
          delta_y = 0,
          tempDelta = 0,
          delta_x_m = 0,
          delta_y_m = 0,
          delta_x_p = 0,
          delta_y_p = 0;

        rotatePose.call(this, true);
        for (var i = this.sqCount; i--;) {
          if (this.squares[i].x < 0 && this.squares[i].x < delta_x) {
            delta_x = this.squares[i].x;
          } else if (this.squares[i].x >= colsCount && this.squares[i].x > delta_x) {
            delta_x = this.squares[i].x;
          }
          if (this.squares[i].y > rowsCount && delta_y < this.squares[i].y) {
            delta_y = this.squares[i].y
          }
        }
        if (delta_x > 0) {
          delta_x -= colsCount - 1;
        }
        if (delta_y > 0) {
          delta_y -= rowsCount - 1;
        }
        for (var i = this.sqCount; i--;) {
          this.squares[i].x -= delta_x;
          this.squares[i].y -= delta_y;

          if (this.squares[i].x >= 0 && this.squares[i].x < colsCount
            && this.squares[i].y >= 0 && this.squares[i].y < rowsCount)
            if (field[this.squares[i].x][this.squares[i].y].state) {
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
            for (var i = this.sqCount; i--;) {
              this.squares[i].x += delta_x;
              this.squares[i].y += delta_y;
            }
            rotatePose.call(this, false);
            return;
          }
        }
        if ((delta_y_m !== 0) !== (delta_y_p !== 0)) {
          delta_y = (delta_y_m !== 0 ? delta_y_m : delta_y_p);
        } else {
          delta_y = 0;
        }

        for (var i = this.sqCount; i--;) {
          this.squares[i].x -= delta_x;
          this.squares[i].y -= delta_y;
        }
      }

      function pos(x, y) {
        for (var i = this.sqCount; i--;) {
          this.squares[i].x = x + this.pose[i][0];
          this.squares[i].y = y + this.pose[i][1];
        }
      }

      function move(x, y) {
        //console.log("move");
        if (checkWay.call(this, x, y)) {
          for (var i = this.sqCount; i--;) {
            this.squares[i].x += x;
            this.squares[i].y += y;
          }
          return true;
        } else if (y !== 0) {
          this.fix();
        }
        return false;
      }

      function fall() {
        move.call(this, 0, getNearestFreeCell.call(this));
        this.fix();
      }

      return {
        rotate: rotate,
        pos: pos,
        move: move,
        fall: fall
      }
    }());

    function fix() {
      this.active = false;
      for (var i = this.sqCount; i--;) {
        this.squares[i].fix();
      }
    }

    function doAct(name, args) {
      var answer;
      if (this.active) {
        this.clear();
        answer = actionFuncs[name].apply(this, args);
        this.draw();
      }
      this.actions = [];
      return answer;
    }

    function clear() {
      for (var i = this.sqCount; i--;) {
        this.squares[i].clear();
      }
    }

    function draw() {
      this.clear();
      for (var i = this.sqCount; i--;) {
        this.squares[i].draw();
      }
    }

    return {
      setPos: actionFuncs["pos"],
      draw: draw,
      clear: clear,
      doAct: doAct,
      fix: fix
    }
  }());

  function getField() {
    console.log(field);
    return field;
  }

  function clearRow(y) {
    if (y >= 0 && y < rowsCount)
      for (var x = colsCount; x--;) {
        field[x][y].off();
      }
  }

  function downShift(from_y) {
    for (var y = from_y; y > 0; y--) {
      for (var x = colsCount; x--;) {
        field[x][y].state = field[x][y - 1].state;
        field[x][y].obj.color = field[x][y - 1].obj.color;
        field[x][y - 1].off();
      }
    }
  }

  function checkThrow(fig) {
    var checkRows = [],
      isSet = false,
      i, j,
      rowIsFull = false,
      latestFreeRow = -1,
      downShiftDelta = 0;
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
      rowIsFull = true;
      for (var x = colsCount; x--;) {
        if (checkRows[i] >= 0 && checkRows[i] < rowsCount && !field[x][checkRows[i]].state) {
          rowIsFull = false;
          break;
        }
      }
      if (rowIsFull) {
        clearRow(checkRows[i]);
        downShift(checkRows[i]);
      }
    }
  }

  function newFig() {
    activeFg = new Figure(figures[getRandomInt(0, figures.length - 1)]);
    activeFg.setPos(5, 0);
    for (var i = getRandomInt(0, 3); i--;) {
      activeFg.doAct("rotate");
    }
  }

  var step = false;

  eng.setFrameFunc(function (delta) {
    if (loss)
      return false;
    if (!activeFg) {
      newFig();
    }
    if (!activeFg.active) {
      checkThrow(activeFg);
      newFig();
    }
    activeFg.draw();
    if (!Tetris.deltaTimeFall)
      Tetris.deltaTimeFall = 0;
    if (!Tetris.deltaTimeMove)
      Tetris.deltaTimeMove = 0;
    if (Tetris.deltaTimeFall < 0) {//<----WTF???
      Tetris.deltaTimeFall = 0;
      Tetris.deltaTimeMove = 0;
    }
    Tetris.deltaTimeFall += delta;
    Tetris.deltaTimeMove += delta;
    if (Tetris.deltaTimeFall >= 400) {
      Tetris.deltaTimeFall = 0;
      activeFg.doAct("move", [0, 1]);
    }
    if (Tetris.deltaTimeMove >= 200) {
      Tetris.deltaTimeMove = 0;
      step = false;
    }
    eng.setKeyEvent("83", "press", function () {
      activeFg.doAct("move", [0, 1]);
    });
    eng.setKeyEvent("65", "press", function () {
      if (!step) {
        activeFg.doAct("move", [-1, 0]);
        step = true;
      }
    });
    eng.setKeyEvent("68", "press", function () {
      if (!step) {
        activeFg.doAct("move", [1, 0]);
        step = true;
      }
    });
    eng.setKeyEvent("70", "down", function () {
      activeFg.doAct("rotate");
    });
    eng.setKeyEvent("87", "down", function () {
      if (!step) {
        activeFg.doAct("fall");
        step = true;
      }
    });

    return true;
  });
};

window.addEventListener('load', function () {
  Engine.setCanvas(document.getElementById("glass"));
  const tetris = new Tetris(Engine);
  Engine.start();
});


(function () {
  var i = 10;
  while (i-- > 0) {
    console.log(i);
  }
}());


function print_r(arr) {
  if (!print_r.tab) {
    print_r.tab = "";
  }
  var text = "",
    aobj = "[object Object]",
    aarr = "[object Array]",
    isObj = false,
    isArr = false,
    toString = Object.prototype.toString;
  for (var el in arr)
    if (arr.hasOwnProperty(el)) {
      isObj = toString.call(arr[el]) === aobj;
      isArr = toString.call(arr[el]) === aarr;
      if (isObj || isArr) {
        text += print_r.tab + el + ": ";
        text += (isObj ? "{" : "[") + "\n";
        print_r.tab += "    ";
        text += print_r(arr[el]);
        print_r.tab = print_r.tab.slice(0, print_r.tab.length - 4);
        text += print_r.tab + (isObj ? "}" : "]") + ",\n";
      } else {
        text += print_r.tab + el + ": " + arr[el] + ",\n";
      }
    }
  return text;
}
