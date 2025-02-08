// CoralGame.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// UI / icons
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

// Our decoupled subcomponents
import {
    ModeSelection,
    StatsBoard,
    TutorialModal,
    GameOverModal,
    GameBoard,
} from './GameComponent';

// Constants & types
import {
    GRID_SIZE,
    MIN_MATCH,
    POINTS_PER_MATCH,
    WINNING_SCORE,
    INITIAL_MOVES,
    GAME_MODES,
    GameMode,
    CORALS,
} from './constant';

const CoralGame: React.FC = () => {
    // Game state
    const [grid, setGrid] = useState<(string | null)[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState<number>(INITIAL_MOVES);
    const [isAnimating, setIsAnimating] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0);
    const [showTutorial, setShowTutorial] = useState(true);
    const [gameMode, setGameMode] = useState<GameMode | null>(null);
    const [collectedCorals, setCollectedCorals] = useState<Record<string, number>>({});
    const [totalCollected, setTotalCollected] = useState(0);

    // Whenever the user selects a mode, initialize the game
    useEffect(() => {
        if (gameMode) {
            initializeGame();
        }
    }, [gameMode]);

    // Setup a fresh grid and reset relevant state
    const initializeGame = () => {
        initializeGrid();
        setScore(0);
        setMoves(gameMode === GAME_MODES.CHALLENGE ? INITIAL_MOVES : Infinity);
        setGameOver(false);
        setCombo(0);
        setCollectedCorals({});
        setTotalCollected(0);
        setShowTutorial(true); // Optionally show tutorial every time mode is selected
    };

    const initializeGrid = () => {
        const newGrid = Array(GRID_SIZE)
            .fill(null)
            .map(() =>
                Array(GRID_SIZE)
                    .fill(null)
                    .map(() => CORALS.regular[Math.floor(Math.random() * CORALS.regular.length)])
            );
        setGrid(newGrid);
    };

    const isAdjacent = (cell1: { row: number; col: number }, cell2: { row: number; col: number }) => {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };

    const handleCellClick = (row: number, col: number) => {
        if (isAnimating || gameOver) return;
        if (gameMode === GAME_MODES.CHALLENGE && moves <= 0) return;

        if (!selectedCell) {
            setSelectedCell({ row, col });
        } else {
            if (isAdjacent(selectedCell, { row, col })) {
                swapCells(selectedCell, { row, col });
            }
            setSelectedCell(null);
        }
    };

    // 10% chance to spawn a special piece
    const generatePowerUp = (): string | null => {
        if (Math.random() < 0.1) {
            const powerUps = Object.values(CORALS.special) as string[];
            return powerUps[Math.floor(Math.random() * powerUps.length)];
        }
        return null;
    };

    const swapCells = async (cell1: { row: number; col: number }, cell2: { row: number; col: number }) => {
        setIsAnimating(true);
        const newGrid = structuredClone(grid); // or [...grid] (with deeper copy for nested arrays)

        const temp = newGrid[cell1.row][cell1.col];
        newGrid[cell1.row][cell1.col] = newGrid[cell2.row][cell2.col];
        newGrid[cell2.row][cell2.col] = temp;
        setGrid(newGrid);

        const matched = await checkMatches(newGrid);
        if (!matched) {
            // Swap back if no match
            setTimeout(() => {
                newGrid[cell2.row][cell2.col] = newGrid[cell1.row][cell1.col];
                newGrid[cell1.row][cell1.col] = temp;
                setGrid(newGrid);
                setIsAnimating(false);
            }, 500);
        } else {
            // If match found in challenge mode, decrement moves
            if (gameMode === GAME_MODES.CHALLENGE) {
                setMoves((m) => m - 1);
            }
        }
    };

    const updateCollection = (matchedCoralsArr: string[]) => {
        const updated = { ...collectedCorals };
        matchedCoralsArr.forEach((coral) => {
            if (CORALS.regular.includes(coral as typeof CORALS.regular[number])) {
                updated[coral] = (updated[coral] || 0) + 1;
                setTotalCollected((prev) => prev + 1);
            }
        });
        setCollectedCorals(updated);
    };

    const checkMatches = async (currentGrid: (string | null)[][]): Promise<boolean> => {
        let hasMatches = false;
        const matchPositions = new Set<string>();
        const matchedCoralsArr: string[] = [];

        // Helper for rainbow logic
        const isMatchingPiece = (a: string | null, b: string | null) => {
            return (
                a !== null &&
                b !== null &&
                (a === b || a === CORALS.special.RAINBOW || b === CORALS.special.RAINBOW)
            );
        };

        // Horizontal matches
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                const current = currentGrid[row][col];
                if (
                    current &&
                    isMatchingPiece(current, currentGrid[row][col + 1]) &&
                    isMatchingPiece(current, currentGrid[row][col + 2])
                ) {
                    hasMatches = true;
                    for (let i = 0; i < MIN_MATCH; i++) {
                        matchPositions.add(`${row},${col + i}`);
                        matchedCoralsArr.push(current);
                    }
                }
            }
        }

        // Vertical matches
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const current = currentGrid[row][col];
                if (
                    current &&
                    isMatchingPiece(current, currentGrid[row + 1][col]) &&
                    isMatchingPiece(current, currentGrid[row + 2][col])
                ) {
                    hasMatches = true;
                    for (let i = 0; i < MIN_MATCH; i++) {
                        matchPositions.add(`${row + i},${col}`);
                        matchedCoralsArr.push(current);
                    }
                }
            }
        }

        if (hasMatches) {
            // Check for BOMB/LINE, etc.
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(',').map(Number);
                const piece = currentGrid[r][c];
                if (piece === CORALS.special.BOMB) {
                    // Clear the surrounding 3x3
                    for (let rr = -1; rr <= 1; rr++) {
                        for (let cc = -1; cc <= 1; cc++) {
                            const newR = r + rr;
                            const newC = c + cc;
                            if (
                                newR >= 0 && newR < GRID_SIZE &&
                                newC >= 0 && newC < GRID_SIZE
                            ) {
                                matchPositions.add(`${newR},${newC}`);
                                matchedCoralsArr.push(currentGrid[newR][newC] || '');
                            }
                        }
                    }
                } else if (piece === CORALS.special.LINE) {
                    // Clear entire row & column
                    for (let i = 0; i < GRID_SIZE; i++) {
                        matchPositions.add(`${r},${i}`);
                        matchedCoralsArr.push(currentGrid[r][i] || '');
                        matchPositions.add(`${i},${c}`);
                        matchedCoralsArr.push(currentGrid[i][c] || '');
                    }
                }
            });

            // Clear matched positions
            const newGrid = structuredClone(currentGrid);
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(',').map(Number);
                newGrid[r][c] = null;
            });

            // Update the “collected corals” and score
            updateCollection(matchedCoralsArr);
            if (gameMode === GAME_MODES.CHALLENGE) {
                const points = matchPositions.size * POINTS_PER_MATCH;
                setScore((s) => s + points);
            }
            setCombo((c) => c + 1);
            setGrid(newGrid);
            triggerMatchEffects();

            // Wait a bit, then drop/fill
            await new Promise((resolve) => setTimeout(resolve, 300));
            await fillEmptyCells(newGrid);

            // In challenge mode, check for win
            if (gameMode === GAME_MODES.CHALLENGE && score >= WINNING_SCORE) {
                setGameOver(true);
                triggerWinEffects();
            }
        } else {
            // No matches => reset combo & free up next move
            setCombo(0);
            setIsAnimating(false);
        }

        return hasMatches;
    };

    const fillEmptyCells = async (currentGrid: (string | null)[][]) => {
        const newGrid = structuredClone(currentGrid);
        let hasEmpty = false;

        // "Fall down" logic
        for (let col = 0; col < GRID_SIZE; col++) {
            let writeRow = GRID_SIZE - 1;
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                if (newGrid[row][col] !== null) {
                    if (writeRow !== row) {
                        newGrid[writeRow][col] = newGrid[row][col];
                        newGrid[row][col] = null;
                        hasEmpty = true;
                    }
                    writeRow--;
                }
            }
            // Now fill remaining with new pieces
            for (let row = writeRow; row >= 0; row--) {
                const powerUp = generatePowerUp();
                newGrid[row][col] = powerUp || CORALS.regular[Math.floor(Math.random() * CORALS.regular.length)];
                hasEmpty = true;
            }
        }

        if (hasEmpty) {
            setGrid(newGrid);
            await new Promise((resolve) => setTimeout(resolve, 300));
            await checkMatches(newGrid);
        } else {
            // If no empties, just free up animations
            setIsAnimating(false);
        }
    };

    const triggerMatchEffects = () => {
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#6bd5e1', '#8edbe5', '#bff7f2'],
        });
    };

    const triggerWinEffects = () => {
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#00aaff', '#5bf5ee', '#c3f0f9'],
        });
        toast.success("You've restored the coral reef!");
    };

    const handleModeSelect = (mode: GameMode) => {
        setGameMode(mode);
        // This will trigger `useEffect` => initializeGame()
    };

    // --------------------- RENDERING ---------------------
    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
            <Navigation />
            <main className="max-w-screen-xl mx-auto px-4 py-8">
                {/* If no mode selected => show mode selection */}
                {!gameMode ? (
                    <ModeSelection onModeSelect={handleModeSelect} />
                ) : (
                    <div>
                        {/* Stats board */}
                        <StatsBoard
                            gameMode={gameMode}
                            score={score}
                            moves={Number.isFinite(moves) ? moves : 99999}
                            totalCollected={totalCollected}
                            collectedCorals={collectedCorals}
                        />

                        {/* Game Board */}
                        <GameBoard
                            grid={grid}
                            selectedCell={selectedCell}
                            isAnimating={isAnimating}
                            gameOver={gameOver}
                            onCellClick={handleCellClick}
                        />

                        {/* Game controls */}
                        <div className="mt-8 space-y-4 text-center">
                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={() => setGameMode(null)}
                                    variant="outline"
                                    className="bg-white"
                                >
                                    Change Mode
                                </Button>
                                <Button
                                    onClick={initializeGame}
                                    variant="outline"
                                    className="bg-white"
                                >
                                    Restart Game
                                </Button>
                            </div>
                        </div>

                        {/* Game Over Modal */}
                        <GameOverModal
                            show={gameOver}
                            score={score}
                            totalCollected={totalCollected}
                            collectedCorals={collectedCorals}
                            onPlayAgain={initializeGame}
                            onChangeMode={() => setGameMode(null)}
                        />

                        {/* Tutorial Modal */}
                        <TutorialModal
                            showTutorial={showTutorial}
                            onClose={() => setShowTutorial(false)}
                            gameMode={gameMode}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoralGame;
