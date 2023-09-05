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
  };
  return cell;
};

createMaze = (w, h) => {
  console.log(w, h);
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
  };
  return maze;
};

const randomDirection = (possible) => {
  return possible[Math.floor(Math.random() * possible.length)];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let maze;
setup = () => {
  createCanvas(canvasWidth, canvasHeight);

  maze = createMaze(w, h);
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

  // const cellSize = min(canvasWidth / w, canvasHeight / h);
  // resizeCanvas(canvasWidth, canvasHeight); // Reset the canvas size to its original dimensions

  console.log(`generated new maze, ${h}, ${w}`);

  maze = createMaze(w, h);
  const startCell = maze.randomCell(0);
  startCell.flags.push("START");
  startCell.colour = "#5fd963";
  const finishCell = maze.randomCell(h - 1);
  finishCell.flags.push("FINISH");
  finishCell.colour = "#d95f5f";
};

keyPressed = () => {
  // p5
  if (keyCode == UP_ARROW) player.move("N");
  if (keyCode == DOWN_ARROW) player.move("S");
  if (keyCode == LEFT_ARROW) player.move("W");
  if (keyCode == RIGHT_ARROW) player.move("E");
};
