import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { randomInt } from "crypto";

const element = ["⬛", "🦐", "🐢"];

const startPoint = (gridSize) => {
    let ran =  [Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)];
    console.log(ran);
    return ran;
}

const Pacman =() => {
    const gridSize = 20;
    const [grid, setGrid] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill(0)));
     // 20x20 grid
  //const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

  useEffect(() => {  const start = startPoint(gridSize);

    const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (rowIndex === start[0] && colIndex === start[1] ? 2 : Math.floor(Math.random() * 2)))
      );
  
      // Update the state with the modified grid
      setGrid(newGrid);
    }, []);

  return (
    <div className="flex flex-wrap w-[500px]">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${colIndex}`}
            className="w-[25px] h-[25px] border border-gray-300 bg-white"
          >
            {/* Content inside each cell, if needed */ element[grid[rowIndex][colIndex]]}
          </div>
        ))
      )}


    </div>    
  )
}
export default Pacman;