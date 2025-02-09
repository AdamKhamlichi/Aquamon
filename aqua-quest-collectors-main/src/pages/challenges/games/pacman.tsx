import { useState, useEffect } from "react";
import Timer from "@/components/game/timer";

const element = ["⬛", "🦐", "🐢", " "];

const startPoint = (gridSize) => {
  let ran = [Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)];
  return ran;
};

const generateMaze = (gridSize = 20) => {
    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
  
    const carvePath = (x, y) => {
      grid[y][x] = 3;
      const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
      ];
      directions.sort(() => Math.random() - 0.5);
  
      for (let [horizontal, vertical] of directions) {
        const nx = x + horizontal * 2, ny = y + vertical * 2;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[ny][nx] === 0) {
          grid[y + vertical][x + horizontal] = 1;
          carvePath(nx, ny);
        }
      }
    };
  
    const startX = Math.floor(Math.random() * gridSize);
    const startY = Math.floor(Math.random() * gridSize);
    carvePath(startX, startY);

    console.log([grid.length]);
    /*for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (grid[y][x] === 3) {
            grid[y][x] = 1;
          }
        }
      }*/      //TRY TO CHANGE AFTER TO SPAWN SHRIMPS EVERYWHERE
    
    return grid;

  };

const findStartPos = (grid) => {
    let start = [-1 , -1];
    while (start[0] == -1 || start[1] == -1 || grid[start[0]][start[1]] !== 3)
    {
        console.log(grid[0].length);
        start[0] = Math.floor(Math.random() * grid.length);
        start[1] = Math.floor(Math.random() * grid.length);
    }
    return start;
}

const Pacman = () => {
  const gridSize = 20;
  const [grid, setGrid] = useState([]);
  const [currentPos, setPos] = useState([null]);
  
  useEffect(() => {
    const newGrid = generateMaze(gridSize);
    const startPos = findStartPos(newGrid);
    setGrid(newGrid);
    setPos(startPos);
  }, []);
  /*useEffect(() => {
    const start = startPoint(gridSize);
 
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (rowIndex === start[0] && colIndex === start[1]) {
          return 2;
        }
        const rand = Math.floor(Math.random()*3);
        if (rand < 0.5) {
          return 0;
        } else {
          return 1;
        }
      })
    );
    setPos(start);
    setGrid(newGrid);
  }, []);*/

  useEffect(() => {
    console.log("Turtle position changed:", currentPos);
  }, [currentPos]);

  const handleKeyPress = (event) => {
    let [x, y] = currentPos;

    switch (event.key) {
      case "ArrowUp":
        if (x > 0 && grid[x - 1][y] !== 0) {
          moveTurtle(x, y, x - 1, y);
        }
        break;

      case "ArrowLeft":
        if (y > 0 && grid[x][y - 1] !== 0) {
          moveTurtle(x, y, x, y - 1);
        }
        break;

      case "ArrowDown":
        if (x < gridSize - 1 && grid[x + 1][y] !== 0) {
          moveTurtle(x, y, x + 1, y);
        }
        break;

      case "ArrowRight":
        if (y < gridSize - 1 && grid[x][y + 1] !== 0) {
          moveTurtle(x, y, x, y + 1);
        }
        break;

      default:
        break;
    }
  };

  const moveTurtle = (oldX, oldY, newX, newY) => {
    const newGrid = [...grid];
    newGrid[oldX][oldY] = 3;
    newGrid[newX][newY] = 2;
    setGrid(newGrid);
    setPos([newX, newY]);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentPos]);

  return (
    <div className="flex flex-wrap w-[500px]">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-[25px] h-[25px] border border-gray-300 bg-white flex justify-center items-center"
          >
            {element[cell]}
          </div>
        ))
      )}

      <div className="mt-4">
        Current Position: ({currentPos[0]}, {currentPos[1]})
      </div>

      <div>
        <Timer></Timer>
      </div>
    </div>
  );
};

export default Pacman;
