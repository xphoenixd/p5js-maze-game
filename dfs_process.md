create a stack for backtracking
choose a cell index at random from the grid to be current cell
set visited cells to 1

while visited cells < total cells
    get unvisited neighbors using cell_neighbors
    if at least one neighbor
        choose random neighbor to be new cell
        knock down wall between it and current cell using connect_cells
        push current cell to stack
        set current cell to new cell
        add 1 to visited cells
    else
        pop from stack to current cell
    call refresh_maze_view to update visualization

set state to 'solve'