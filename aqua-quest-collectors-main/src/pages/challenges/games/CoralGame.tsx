import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const GRID_SIZE = 8;
const CORAL_TYPES = ['🪸', '🐠', '🐡', '🐙', '🦀', '🦐'];
const MIN_MATCH = 3;
const POINTS_PER_MATCH = 100;
const WINNING_SCORE = 2000;

const CoralGame = () => {
    const [grid, setGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(20);
    const [isAnimating, setIsAnimating] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        initializeGrid();
    }, []);

    const initializeGrid = () => {
        const newGrid = Array(GRID_SIZE).fill(null).map(() =>
            Array(GRID_SIZE).fill(null).map(() =>
                CORAL_TYPES[Math.floor(Math.random() * CORAL_TYPES.length)]
            )
        );
        setGrid(newGrid);
    };

    // Rest of the CoralGame component code remains the same...
    // (keeping all the game logic and handlers from the previous implementation)

    const handleCellClick = (row, col) => {
        if (isAnimating || gameOver || moves === 0) return;

        if (selectedCell === null) {
            setSelectedCell({ row, col });
        } else {
            if (isAdjacent(selectedCell, { row, col })) {
                swapCells(selectedCell, { row, col });
            }
            setSelectedCell(null);
        }
    };

    const isAdjacent = (cell1, cell2) => {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };

    const swapCells = async (cell1, cell2) => {
        setIsAnimating(true);
        const newGrid = [...grid];
        const temp = newGrid[cell1.row][cell1.col];
        newGrid[cell1.row][cell1.col] = newGrid[cell2.row][cell2.col];
        newGrid[cell2.row][cell2.col] = temp;
        setGrid(newGrid);

        const hasMatches = await checkMatches(newGrid);
        if (!hasMatches) {
            setTimeout(() => {
                newGrid[cell1.row][cell1.col] = temp;
                newGrid[cell2.row][cell2.col] = newGrid[cell1.row][cell1.col];
                setGrid(newGrid);
                setIsAnimating(false);
            }, 500);
        } else {
            setMoves(moves - 1);
            if (moves === 1) {
                setGameOver(true);
            }
        }
    };

    const checkMatches = async (currentGrid) => {
        let hasMatches = false;
        const newGrid = [...currentGrid];

        // Check horizontal matches
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                const current = newGrid[row][col];
                if (current &&
                    current === newGrid[row][col + 1] &&
                    current === newGrid[row][col + 2]) {
                    hasMatches = true;
                    for (let i = 0; i < MIN_MATCH; i++) {
                        newGrid[row][col + i] = null;
                    }
                    setScore(prev => prev + POINTS_PER_MATCH);
                }
            }
        }

        // Check vertical matches
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const current = newGrid[row][col];
                if (current &&
                    current === newGrid[row + 1][col] &&
                    current === newGrid[row + 2][col]) {
                    hasMatches = true;
                    for (let i = 0; i < MIN_MATCH; i++) {
                        newGrid[row + i][col] = null;
                    }
                    setScore(prev => prev + POINTS_PER_MATCH);
                }
            }
        }

        if (hasMatches) {
            setGrid(newGrid);
            await new Promise(resolve => setTimeout(resolve, 300));
            await fillEmptyCells(newGrid);
        }

        return hasMatches;
    };

    const fillEmptyCells = async (currentGrid) => {
        const newGrid = [...currentGrid];
        let hasEmpty = false;

        // Drop existing cells down
        for (let col = 0; col < GRID_SIZE; col++) {
            let writeRow = GRID_SIZE - 1;
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                if (newGrid[row][col] !== null) {
                    newGrid[writeRow][col] = newGrid[row][col];
                    if (writeRow !== row) {
                        newGrid[row][col] = null;
                    }
                    writeRow--;
                }
            }
        }

        // Fill empty cells with new corals
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (newGrid[row][col] === null) {
                    hasEmpty = true;
                    newGrid[row][col] = CORAL_TYPES[Math.floor(Math.random() * CORAL_TYPES.length)];
                }
            }
        }

        setGrid(newGrid);

        if (hasEmpty) {
            await new Promise(resolve => setTimeout(resolve, 300));
            await checkMatches(newGrid);
        }

        setIsAnimating(false);

        if (score >= WINNING_SCORE) {
            setGameOver(true);
            toast.success("You've restored the coral reef!");
        }
    };

    const resetGame = () => {
        setScore(0);
        setMoves(20);
        setGameOver(false);
        setSelectedCell(null);
        initializeGrid();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
            <Navigation />

            <main className="max-w-screen-xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 font-pixel animate-float">
                        Coral Restoration
                    </h1>
                    <div className="flex justify-center gap-8 mb-4">
                        <p className="text-primary font-medium">Score: {score}</p>
                        <p className="text-primary font-medium">Moves Left: {moves}</p>
                    </div>
                    {gameOver && (
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-2">
                                {score >= WINNING_SCORE ? "Victory!" : "Game Over!"}
                            </h2>
                            <p className="mb-4">Final Score: {score}</p>
                            <Button onClick={resetGame}>Play Again</Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <div className="grid gap-1 bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-gray-100 shadow-lg">
                        {grid.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                                {row.map((cell, colIndex) => (
                                    <button
                                        key={`${rowIndex}-${colIndex}`}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        disabled={isAnimating || gameOver}
                                        className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl transition-all duration-300 hover:scale-105 ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                                            ? 'bg-primary/20'
                                            : 'bg-primary/5'
                                            } ${isAnimating ? 'animate-pulse' : ''}`}
                                    >
                                        <span className="transform transition-transform duration-300 hover:scale-110">
                                            {cell}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">
                        Match 3 or more corals to restore the reef! <br />
                        Score {WINNING_SCORE} points to win!
                    </p>
                    <Button onClick={resetGame} variant="outline">Restart Game</Button>
                </div>
            </main>
        </div>
    );
};

export default CoralGame;