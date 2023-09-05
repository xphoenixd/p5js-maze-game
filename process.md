1. For each cell in the grid:
   a. Generate cell with all walls
   b. Push cell to array
2. Choose random cell on grid
3. Choose random direction. Ensure it doesn't go out of bounds or go into a visited cell.
4. Remove the wall facing the direction, remove the opposite wall on the next cell in the direction
   e.g. cell 1 is (2,3) and direction is east (+1, 0). remove east wall on cell 1, and remove west wall on cell 2 (3, 3)
5. Set current cell to next cell, set cell as visited
6. Repeat steps 3 & 4, only move to unvisited cells
7. Once no more moves are possible, enter hunt mode: scan grid starting at (0, 0) moving across (+1, 0), looking for an unvisited cell adjacent to a visited cell
8. Set current cell to (0, 0), move east (+1, 0) until the end of the row then move down to the next column (0, 1).
9. For each unvisited cell, check if there is a neighbouring cell. This can be done in two ways:
   a. For each visited cell, check for unvisited neighbours
   b. For each unvisited cell, check for visited neighbours
10. Once a cell has been found, connect the two (unvisited, visited) cells, and begin the carving process again with the starting position at the newly found unvisited cell.
11. Repeat steps 3 & 4, only move to unvisited cells
12. Repeat carving and hunting steps until the entire grid has been scanned and there are no more unvisited cells.
13. Draw the walls
14. Choose a random cell on the top row (x, 0) to be the entry, and delete the north wall
15. Choose a random cell on the bottom row (x, height - 1) to be the exit, and delete the south wall
