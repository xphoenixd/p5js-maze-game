let h = 8;
let w = 8;
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

const randomDirection = (possible) => {
  return possible[Math.floor(Math.random() * possible.length)];
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
    const dir = randomDirection(cell.canCarve());
    let nextPos = { x: cell.pos.x, y: cell.pos.y };
    if (dir && dir.length) {
      if (dir == "N") {
        nextPos.y -= 1;
      }
      if (dir == "E") {
        nextPos.x += 1;
      }
      if (dir == "S") {
        nextPos.y += 1;
      }
      if (dir == "W") {
        nextPos.x -= 1;
      }
      let nextCell = maze.getCell(nextPos.x, nextPos.y);
      nextCell.visited = true;
      cell.visited = true;
      maze.connectCells(cell, nextCell, dir);
      if (nextCell.canCarve().length) {
        this.carve(nextCell);
      } else {
        this.hunt(0, this.lastRowCompletelyVisited);
      }
    }
  },
  hunt: async function (x, y) {
    const cell = maze.getCell(x, y);
    if (x === w - 1 && cell.visited) lastRowCompletelyVisited = y;
    if (x === w - 1 && y === h - 1 && cell.visited)
      return console.log("Maze finished");
    if (y > 1 && y % 2 === 0 && x == w - 1) await sleep(1);

    let nextHuntX = x + 1;
    let nextHuntY = y;

    if (x === w - 1) {
      nextHuntX = 0;
      nextHuntY += 1;
    }
    if (cell.visited) return this.hunt(nextHuntX, nextHuntY);

    const possibleNeighbours = getNeighbours(cell);

    const visitedPossibleNeighbours = possibleNeighbours.filter(
      (n) => n.cell.visited
    );
    if (visitedPossibleNeighbours.length) {
      const nextNeighbour = visitedPossibleNeighbours[0];
      const nextDirection = nextNeighbour.direction;

      nextNeighbour.cell.visited = true;
      maze.connectCells(cell, nextNeighbour.cell, nextDirection);
      this.carve(nextNeighbour.cell);
    } else return this.hunt(nextHuntX, nextHuntY);
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
        const random = randomDirection(
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

setup = () => {
  createCanvas(canvasWidth, canvasHeight);

  const startCell = maze.randomCell(0);
  startCell.flags.push("START");
  startCell.colour = "#5fd963";
  const finishCell = maze.randomCell(h - 1);
  finishCell.flags.push("FINISH");
  finishCell.colour = "#d95f5f";
};

draw = () => {
  background(defaultCellColour);

  const cellSize = min(width / w, height / h); // Use the minimum dimension

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const cell = maze.getCell(col, row);
      const x = col * cellSize;
      const y = row * cellSize;

      fill(cell.colour);
      noStroke();
      rect(x, y, cellSize, cellSize);
      fill("black");
      stroke(0);
      strokeWeight(1);
      if (cell.hasWall("N")) line(x, y, x + cellSize, y);
      if (cell.hasWall("E")) line(x + cellSize, y, x + cellSize, y + cellSize);
      if (cell.hasWall("S")) line(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.hasWall("W")) line(x, y, x, y + cellSize);
    }
  }
};

generate = () => {
  w = document.getElementById("width").value || 8;
  h = document.getElementById("height").value || 8;
  const algorithm = document.getElementById("algorithm").value;

  const cellSize = min(canvasWidth / w, canvasHeight / h);

  maze = createMaze(w, h);
  const startCell = maze.randomCell(0);
  startCell.flags.push("START");
  startCell.colour = "#5fd963";
  const finishCell = maze.randomCell(h - 1);
  finishCell.flags.push("FINISH");
  finishCell.colour = "#d95f5f";

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
  }
};

keyPressed = () => {
  // p5
  if (keyCode == UP_ARROW) player.move("N");
  if (keyCode == DOWN_ARROW) player.move("S");
  if (keyCode == LEFT_ARROW) player.move("W");
  if (keyCode == RIGHT_ARROW) player.move("E");
};
