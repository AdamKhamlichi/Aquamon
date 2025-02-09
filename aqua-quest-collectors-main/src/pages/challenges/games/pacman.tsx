import { useState, useEffect, useCallback } from "react";
import Timer from "@/components/game/timer";

const element = ["⬛", "🦐", "🐢", " ", "🚢"];

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

  let start = [-1 , -1];
  while (start[0] == -1 || start[1] == -1 || grid[start[0]][start[1]] !== 3) {
    start[0] = Math.floor(Math.random() * grid.length);
    start[1] = Math.floor(Math.random() * grid.length);
  }
  grid[start[0]][start[1]] = 2;

  let bots = [];
  for (let i = 0; i < 6; i++) {
    let start = [-1 , -1];
    while (start[0] == -1 || start[1] == -1 || grid[start[0]][start[1]] !== 3) {
      start[0] = Math.floor(Math.random() * grid.length);
      start[1] = Math.floor(Math.random() * grid.length);
    }
    grid[start[0]][start[1]] = 4;
    bots.push(start);
  }

  return [grid, start, bots];
};

function countOccurrences(nestedArray, target) {
    let count = 0;
    
    // Iterate over each sub-array
    for (let i = 0; i < nestedArray.length; i++) {
      // Iterate over each element in the sub-array
      for (let j = 0; j < nestedArray[i].length; j++) {
        // Increment count if the current element matches the target
        if (nestedArray[i][j] === target) {
          count++;
        }
      }
    }
  
    return count;
  }

const Pacman = () => {
  const gridSize = 20;
  const [grid, setGrid] = useState([]);
  const [currentPos, setPos] = useState([null]);
  const [bots, setBots] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [lost, setLost] = useState(0);
  const [points, setPoints] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const infoMap = generateMaze(gridSize);
    setGrid(infoMap[0]);
    setBots(infoMap[2]);
    setPos(infoMap[1]);
  }, []);


  useEffect(() => {
    // This effect will be triggered when `grid` state is updated
    if (grid.length > 0) {
      setTotal(countOccurrences(grid, 1));
    }
  }, [grid]);

 /* const handleSecondsChange = useCallback((newSeconds) => {
    // Avoid updating state directly during render phase
    moveBoats();
    console.log(`Parent received seconds: ${newSeconds}`);
  }, [bots, grid]);*/

  useEffect(() => {
    // Set interval to move the boats every second (1000 milliseconds)
    const intervalId = setInterval(() => {
      moveBoats();
    }, 1000);
  
    // Cleanup function to clear the interval when the component unmounts or when dependencies change
    return () => clearInterval(intervalId);
  }, [bots, grid]);

  const navLosingPage = () => {
    console.log("you lost");
  }

  const navWinningPage = () => {
    console.log("you won");
  }

  const handleSecondsChange = useCallback((newSeconds) => {
    setSeconds(newSeconds);
    if(points + lost === total)
    {
        navWinningPage;
    }
  }, []);

  const moveBoats = () => {
    const newGrid = [...grid];
    const newBots = [...bots];
    console.log("boa");
    bots.forEach((pos, index) => {
      updatePos(pos, index, newGrid, newBots);
    });

    console.log("af");

    bots.forEach(a => console.log(a));
    setGrid(newGrid);
    setBots(newBots);
  };

  const validateMovements = (grid, pos, tile, movement) => {
    // Create a new tempPos to avoid mutation of the original pos
    let tempPos = [...pos]; // Clone the array to avoid side effects
    tempPos[tile] = tempPos[tile] + movement;
  
    // Check if the new position is within bounds
    if (tempPos[0] < 0 || tempPos[0] >= grid.length) return false;
    if (tempPos[1] < 0 || tempPos[1] >= grid[0].length) return false;
  
    // Check if the tile is blocked (e.g., 0 is a blocked tile)
    if (grid[tempPos[0]][tempPos[1]] === 0) return false;
  
    // The position is valid
    return true;
  };
  
  const updatePos = (pos, index, newGrid, newBots) => {
    let tile = Math.floor(Math.random() * 2); // 0 is for x, 1 is for y
    
    // Ensure movement is either -1 or 1 (not 0)
    let movement = (Math.random() < 0.5) ? -1 : 1; // Randomly set movement to -1 or 1
    
    let moveSuccess = false;
    let newPos = [...pos]; // Clone the original position
  
    // Try moving until a valid position is found
    while (!moveSuccess) {
      // Ensure the chosen tile and movement don't cause the bot to move to a blocked space
      if (validateMovements(newGrid, newPos, tile, movement)) {
        // Update position if valid
        newPos[tile] = newPos[tile] + movement;
        moveSuccess = true;
      } else {
        // Randomly change direction if current movement is invalid
        tile = Math.floor(Math.random() * 2); // Re-choose the axis to move (x or y)
        movement = (Math.random() < 0.5) ? -1 : 1; // Re-choose direction (1 or -1)
      }
    }
  
    // Log for debugging
   // console.log("Moving bot to:", newPos);
  
    // Update the grid and bot position
    if(newGrid[newPos[0]][newPos[1]] === 1) setLost(lost + 1);
    if(newGrid[newPos[0]][newPos[1]] === 2) navLosingPage();
    newGrid[pos[0]][pos[1]] = 3; // Mark the old position as path (3)
    newGrid[newPos[0]][newPos[1]] = 4; // Mark the new position as bot (4)
    newBots[index] = [newPos[0], newPos[1]]; // Update bot position in the bot list
  };
  

  const handleKeyPress = (event) => {
    let [x, y] = currentPos;
    switch (event.key) {
      case "ArrowUp":
        if (x > 0 && grid[x - 1][y] !== 0) {
          move(x, y, x - 1, y);
        }
        break;
      case "ArrowLeft":
        if (y > 0 && grid[x][y - 1] !== 0) {
          move(x, y, x, y - 1);
        }
        break;
      case "ArrowDown":
        if (x < gridSize - 1 && grid[x + 1][y] !== 0) {
          move(x, y, x + 1, y);
        }
        break;
      case "ArrowRight":
        if (y < gridSize - 1 && grid[x][y + 1] !== 0) {
          move(x, y, x, y + 1);
        }
        break;
      default:
        break;
    }
  };

  const move = (oldX, oldY, newX, newY) => {
    const newGrid = [...grid];
    if (newGrid[newX][newY] === 4) console.log("YOU LOST");
    if (newGrid[newX][newY] === 1) setPoints(points + 1);

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
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center">
        {/* Ocean Cleanup Title */}
        <h1 className="text-4xl font-bold mb-6">Ocean Cleanup</h1>
  
        {/* Maze Grid */}
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
            <Timer onSecondsChange={handleSecondsChange} />
            <h1>Points gained: {points}</h1>
            <h1>Points lost: {lost}</h1>
            <h1>Total possible: {total} </h1>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Pacman;
