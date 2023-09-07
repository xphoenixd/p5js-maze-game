let h = 15;
let w = 15;
let canvasWidth = 600;
let canvasHeight = 600;

const oppositeDir = { N: "S", E: "W", S: "N", W: "E" };

const defaultCellColour = "#fff";

const createCell = (x, y) => {
  const walls = ["N", "E", "S", "W"];
  const cell = {
    pos: { x, y },
    walls,
    visited: false,
    colour: defaultCellColour,
    flags: [],
    hasWall: (dir) => walls.includes(dir),
    removeWall: (dir) => {
      const i = walls.indexOf(dir);
      if (i >= 0) {
        walls.splice(i, 1);
      }
    },
    possibleDirections: function () {
      const out = [];
      if (this.pos.y != 0) out.push("N");
      if (this.pos.x != w - 1) out.push("E");
      if (this.pos.y != h - 1) out.push("S");
      if (this.pos.x != 0) out.push("W");
      return out;
    },
    canCarve: function () {
      const out = [];
      if (this.pos.y != 0 && !maze.getCell(this.pos.x, this.pos.y - 1).visited)
        out.push("N");
      if (
        this.pos.x != w - 1 &&
        !maze.getCell(this.pos.x + 1, this.pos.y).visited
      )
        out.push("E");
      if (
        this.pos.y != h - 1 &&
        !maze.getCell(this.pos.x, this.pos.y + 1).visited
      )
        out.push("S");
      if (this.pos.x != 0 && !maze.getCell(this.pos.x - 1, this.pos.y).visited)
        out.push("W");
      return out;
    },
  };
  return cell;
};

createMaze = (w, h) => {
  const cells = [];
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const cell = createCell(col, row);
      cells.push(cell);
    }
  }
  const maze = {
    width: w,
    height: h,
    cells,

    getCell: (x, y) => {
      return cells[y * w + x];
    },
    carve: (from, next, dir) => {
      //remove wall if exists:
      from.removeWall(dir);
      next.removeWall(oppositeDir[dir]);
    },

    randomCell: function (row) {
      const res = this.getCell(
        Math.floor(Math.random() * w),
        row ?? Math.floor(Math.random() * h)
      );
      console.assert(!!res, "random cell should never be undefined");
      return res;
    },
    connectCells: function (from, to, dir) {
      from.removeWall(dir);

      to.removeWall(oppositeDir[dir]);
    },
  };
  return maze;
};

const randomInArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getNeighbours = (cell, filter) => {
  let dirs = cell.possibleDirections();
  let possibleNeighbours = [];

  for (let i = 0; i < dirs.length; i++) {
    const possible = dirs[i];
    let nextX = cell.pos.x;
    let nextY = cell.pos.y;

    if (possible === "N") {
      nextY -= 1;
    } else if (possible === "E") {
      nextX += 1;
    } else if (possible === "S") {
      nextY += 1;
    } else if (possible === "W") {
      nextX -= 1;
    }
    const possibleNeighbour = maze.getCell(nextX, nextY);
    possibleNeighbours.push({
      direction: possible,
      cell: possibleNeighbour,
    });
  }
  let filtered;
  if (filter == "visited")
    filtered = possibleNeighbours.filter((n) => n.cell.visited);
  if (filter == "unvisited")
    filtered = possibleNeighbours.filter((n) => !n.cell.visited);
  return filter ? filtered : possibleNeighbours;
};

const huntAndKill = {
  lastRowCompletelyVisited: 0,
  carve: function (cell) {
    let dir;
    while ((dir = randomInArray(cell.canCarve()))) {
      let nextPos = { x: cell.pos.x, y: cell.pos.y };
      if (dir === "N") nextPos.y -= 1;
      if (dir === "E") nextPos.x += 1;
      if (dir === "S") nextPos.y += 1;
      if (dir === "W") nextPos.x -= 1;

      let nextCell = maze.getCell(nextPos.x, nextPos.y);
      nextCell.visited = true;
      cell.visited = true;
      maze.connectCells(cell, nextCell, dir);
      if (nextCell.canCarve().length) {
        this.carve(nextCell);
      } else {
        return true;
      }
    }
    return false;
  },
  run: function () {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let cell = maze.getCell(x, y);

        if (!cell.visited) {
          cell.visited = true;
          this.carve(cell);
          this.hunt(x, y);
        }
      }
    }
  },
  hunt: function (x, y) {
    while (x < w - 1 || y < h - 1) {
      let cell = maze.getCell(x, y);
      if (x === w - 1 && y === h - 1) return;

      // if (y > 1 && y % 2 === 0 && x == w - 1) await sleep(1);

      let nextHuntX = x + 1;
      let nextHuntY = y;

      if (x === w - 1) {
        nextHuntX = 0;
        nextHuntY += 1;
      }

      if (!cell.visited) {
        let possibleNeighbours = getNeighbours(cell);
        let visitedPossibleNeighbours = possibleNeighbours.filter(
          (n) => n.cell.visited
        );
        if (visitedPossibleNeighbours.length) {
          let nextNeighbour = visitedPossibleNeighbours[0];
          let nextDirection = nextNeighbour.direction;

          nextNeighbour.cell.visited = true;
          maze.connectCells(cell, nextNeighbour.cell, nextDirection);
          let carved = this.carve(nextNeighbour.cell);
          if (!carved) return;
        }
      }

      x = nextHuntX;
      y = nextHuntY;
    }
  },
};
let maze = createMaze(w, h);

const dfs = {
  stack: [],
  visited: 0,
  cell: maze.getCell(0, 0),
  run: function () {
    while (this.visited < w * h) {
      this.cell.visited = true;
      const unvisitedNeighbours = getNeighbours(this.cell, "unvisited");
      if (unvisitedNeighbours.length) {
        const random = randomInArray(
          unvisitedNeighbours.map((n) => n.direction)
        );
        const randomCellInfo = unvisitedNeighbours.find(
          (n) => n.direction === random
        );
        if (randomCellInfo) {
          const randomCell = randomCellInfo.cell;
          maze.connectCells(this.cell, randomCell, randomCellInfo.direction);
          this.stack.push(this.cell);
          this.cell = randomCell; // Move to the random neighboring cell.
          this.visited++;
        }
      } else {
        if (this.stack.length === 0) {
          // You've visited all cells and the stack is empty, exit the loop.
          break;
        }
        this.cell = this.stack.pop(); // Backtrack to the previous cell.
      }
    }
  },
};

const prims = {
  walls: [],
  addWalls: function (cell) {
    const neighbors = getNeighbours(cell, "unvisited");
    for (const neighbor of neighbors) {
      this.walls.push({
        cell,
        neighbor: neighbor.cell,
        direction: neighbor.direction,
      });
    }
  },
  run: function () {
    const startCell = maze.randomCell();
    startCell.visited = true;

    this.addWalls(startCell);

    while (this.walls.length) {
      const randomIndex = Math.floor(Math.random() * this.walls.length);
      const randomWall = this.walls[randomIndex];
      const { cell, neighbor, direction } = randomWall;

      if (!neighbor.visited) {
        neighbor.visited = true;
        maze.connectCells(cell, neighbor, direction);
        this.addWalls(neighbor);
      }

      this.walls.splice(randomIndex, 1);
    }
  },
};

const ab = {
  cell: maze.randomCell(),
  visited: 1,
  run: async function () {
    while (this.visited < w * h - 1) {
      const neighbour = randomInArray(getNeighbours(this.cell));
      if (!neighbour.cell.visited) {
        maze.connectCells(this.cell, neighbour.cell, neighbour.direction);
        neighbour.cell.visited = true;
        this.visited++;
      }
      this.cell = neighbour.cell;
    }
  },
};

const player = {
  pos: { x: null, y: null },
  colour: "#000",
  canMove: function (dir) {
    if (timerFinished) return false;
    if (dir == "N") return !maze.getCell(this.pos.x, this.pos.y).hasWall("N");
    if (dir == "E") return !maze.getCell(this.pos.x, this.pos.y).hasWall("E");
    if (dir == "S") return !maze.getCell(this.pos.x, this.pos.y).hasWall("S");
    if (dir == "W") return !maze.getCell(this.pos.x, this.pos.y).hasWall("W");
  },
  move: function (dir) {
    if (this.canMove(dir)) {
      if (dir == "N") return this.pos.y--;
      if (dir == "E") return this.pos.x++;
      if (dir == "S") return this.pos.y++;
      if (dir == "W") return this.pos.x--;
    }
  },
};

let firstMove = false;
let timerStarted = false;
let timerFinished = false;
let startTime;
let endTime;
let totalTime;

let startCell = maze.randomCell(0);
startCell.flags.push("START");
startCell.visited = true;
startCell.colour = "#5fd963";
let finishCell = maze.randomCell(h - 1);
finishCell.flags.push("FINISH");
finishCell.visited = true;
finishCell.colour = "#d95f5f";

const solver = {
  stack: [startCell],
  cell: startCell,
  pathFound: false,
  visited: 0,
  canSearch: function (dir) {
    if (dir == "N")
      return !maze.getCell(this.cell.pos.x, this.cell.pos.y).hasWall("N");
    if (dir == "E")
      return !maze.getCell(this.cell.pos.x, this.cell.pos.y).hasWall("E");
    if (dir == "S")
      return !maze.getCell(this.cell.pos.x, this.cell.pos.y).hasWall("S");
    if (dir == "W")
      return !maze.getCell(this.cell.pos.x, this.cell.pos.y).hasWall("W");
  },
  run: function () {
    maze.cells.forEach((cell) => cell.visited = false);
    n = 0;
    while (!this.pathFound) {
      this.cell = this.stack[this.stack.length - 1]
      if(this.cell.pos.x == finishCell.pos.x && this.cell.pos.y == finishCell.pos.y) {this.pathFound = true; return this.setPathColour();}
      const unvisitedNeighbours = getNeighbours(this.cell, "unvisited").filter(
        (n) => this.canSearch(n.direction)
      );
      if(unvisitedNeighbours.length) {
        const randomNeighbour = randomInArray(unvisitedNeighbours)
        randomNeighbour.cell.visited = true;
        this.stack.push(randomNeighbour.cell);
      } else {
        this.stack.pop();
      }

    }
  },
  setPathColour: function() {
    this.stack.forEach((c, i) => {
      if(i && i != this.stack.length - 1) c.colour = "lightblue";
    })
  }
};

player.pos = startCell.pos;

setup = () => {
  createCanvas(canvasWidth, canvasHeight);
};

draw = () => {
  background("white");

  const cellSize = min(width / w, height / h); // Use the minimum dimension

  if (firstMove && !timerStarted) {
    startTime = new Date();
    timerStarted = true;
  }
  if (
    player.pos.x == finishCell.pos.x &&
    player.pos.y == finishCell.pos.y &&
    !timerFinished
  ) {
    timerFinished = true;
    endTime = new Date();
  }
  if (startTime && endTime) {
    totalTime = (endTime - startTime) / 1000;
  }

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const cell = maze.getCell(col, row);
      const x = col * cellSize;
      const y = row * cellSize;
      const playerX = player.pos.x * cellSize;
      const playerY = player.pos.y * cellSize;
      const playerSizeDiff = cellSize / 2;

      fill(cell.colour);
      noStroke();
      rect(x, y, cellSize, cellSize);
      fill("black");
      rect(
        playerX + playerSizeDiff / 2,
        playerY + playerSizeDiff / 2,
        cellSize - playerSizeDiff,
        cellSize - playerSizeDiff
      );
      stroke(0);
      strokeWeight(1);
      if (cell.hasWall("N")) line(x, y, x + cellSize, y);
      if (cell.hasWall("E")) line(x + cellSize, y, x + cellSize, y + cellSize);
      if (cell.hasWall("S")) line(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.hasWall("W")) line(x, y, x, y + cellSize);
    }
  }
  if (timerFinished) {
    fill(255, 255, 255, 220);
    rect(0, 0, width, height);
    textAlign(CENTER);
    textSize(40);
    fill("black");
    text(`${totalTime.toFixed(2)} seconds`, width / 2, height / 2);
  }
};

generate = () => {
  w = document.getElementById("width").value || 8;
  h = document.getElementById("height").value || 8;
  const algorithm = document.getElementById("algorithm").value;

  document.getElementById("solve").removeAttribute("disabled");

  const cellSize = min(canvasWidth / w, canvasHeight / h);

  maze = createMaze(w, h);
  startCell = maze.randomCell(0);
  startCell.flags.push("START");
  startCell.colour = "#5fd963";
  finishCell = maze.randomCell(h - 1);
  finishCell.flags.push("FINISH");
  finishCell.colour = "#d95f5f";

  solver.cell = startCell;
  solver.stack = [startCell];
  solver.pathFound = false;

  resizeCanvas(w * cellSize, h * cellSize);

  if (algorithm === "huntandkill") {
    huntAndKill.carve(startCell);
  } else if (algorithm === "dfs") {
    dfs.stack = [];
    dfs.visited = 0;
    dfs.cell = maze.getCell(0, 0);
    dfs.run();
  } else if (algorithm === "prims") {
    prims.run();
  } else if (algorithm === "ab") {
    ab.cell = maze.randomCell();
    ab.visited = 1;
    ab.run();
  }
  player.pos = startCell.pos;
  firstMove = false;
  timerStarted = false;
  timerFinished = false;
  let startTime;
  let endTime;
  let totalTime;
};

keyPressed = () => {
  // p5
  if (
    !firstMove &&
    [UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)
  ) {
    firstMove = true;
  }
  if (keyCode == UP_ARROW) player.move("N");
  if (keyCode == DOWN_ARROW) player.move("S");
  if (keyCode == LEFT_ARROW) player.move("W");
  if (keyCode == RIGHT_ARROW) player.move("E");
};
