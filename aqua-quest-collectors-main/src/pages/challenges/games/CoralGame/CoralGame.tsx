import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Sound imports (place them in your assets/sounds folder)
import swapSoundFile from "/sounds/swap.mp3";
import matchSoundFile from "/sounds/match.mp3";
import winSoundFile from "/sounds/success.mp3";

// UI / icons
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

// Our decoupled subcomponents
import {
    ModeSelection,
    StatsBoard,
    TutorialModal,
    GameOverModal,
    GameBoard,
} from "./GameComponent";

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
} from "./constant";

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

    // Difficulty slider for Free Play (1 => easier, 10 => hardest)
    const [freePlayDifficulty, setFreePlayDifficulty] = useState(5);

    // Audio references
    const swapAudio = useRef<HTMLAudioElement | null>(null);
    const matchAudio = useRef<HTMLAudioElement | null>(null);
    const winAudio = useRef<HTMLAudioElement | null>(null);

    // For tracking which corals have been collected
    const [collectedCorals, setCollectedCorals] = useState<Record<typeof CORALS.regular[number] | typeof CORALS.extended[number], number>>(() => {
        const initialState: Record<typeof CORALS.regular[number] | typeof CORALS.extended[number], number> = {} as Record<typeof CORALS.regular[number] | typeof CORALS.extended[number], number>;
        [...CORALS.regular, ...CORALS.extended].forEach(coral => {
            initialState[coral] = 0;
        });
        return initialState;
    });
    const [totalCollected, setTotalCollected] = useState(0);

    // Initialize audio once
    useEffect(() => {
        swapAudio.current = new Audio(swapSoundFile);
        matchAudio.current = new Audio(matchSoundFile);
        winAudio.current = new Audio(winSoundFile);

        // Optional: set volume levels
        swapAudio.current.volume = 0.6;
        matchAudio.current.volume = 0.65;
        winAudio.current.volume = 0.7;
    }, []);

    // Whenever the user selects a mode, initialize the game
    useEffect(() => {
        if (gameMode) {
            initializeGame();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameMode]);

    // -----------------------------------
    // Difficulty-based coral sets
    // -----------------------------------
    const getCoralSet = () => {
        if (gameMode === GAME_MODES.CHALLENGE) {
            // Keep it the original 6 regular for challenge mode
            return CORALS.regular;
        } else {
            // The higher the difficulty, the more corals we pull from “extended”
            // e.g. difficulty 1 => 6 corals, difficulty 10 => 12 corals
            const totalTypes = 6 + Math.floor((freePlayDifficulty / 10) * CORALS.extended.length);
            return [...CORALS.regular, ...CORALS.extended].slice(0, totalTypes);
        }
    };

    // Setup a fresh grid and reset relevant state
    const initializeGame = () => {
        initializeGrid();
        setScore(0);
        setMoves(gameMode === GAME_MODES.CHALLENGE ? INITIAL_MOVES : Infinity);
        setGameOver(false);
        setCombo(0);
        setCollectedCorals(() => {
            const initialState: Record<typeof CORALS.regular[number] | typeof CORALS.extended[number], number> = {} as Record<typeof CORALS.regular[number] | typeof CORALS.extended[number], number>;
            [...CORALS.regular, ...CORALS.extended].forEach(coral => {
                initialState[coral] = 0;
            });
            return initialState;
        });
        setTotalCollected(0);
        setShowTutorial(true); // show tutorial each time mode is selected
    };

    const initializeGrid = () => {
        const coralSet = getCoralSet();
        const newGrid = Array(GRID_SIZE)
            .fill(null)
            .map(() =>
                Array(GRID_SIZE)
                    .fill(null)
                    .map(() => coralSet[Math.floor(Math.random() * coralSet.length)])
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
                // Play swap sound
                swapAudio.current?.play();
                swapCells(selectedCell, { row, col });
            }
            setSelectedCell(null);
        }
    };

    /**
     * Generate power-ups.
     * On higher difficulties, we can actually LOWER the chance
     * to get a special piece => making the game harder to clear matches.
     */
    const generatePowerUp = (): string | null => {
        if (gameMode === GAME_MODES.FREE) {
            // baseChance: 10%, minus up to 7% for difficulty (just an example)
            const difficultyPenalty = (freePlayDifficulty - 1) * 0.007; // ~0.063 at diff=10
            const actualChance = 0.1 - difficultyPenalty;
            if (Math.random() < Math.max(actualChance, 0.01)) {
                const powerUps = Object.values(CORALS.special) as string[];
                return powerUps[Math.floor(Math.random() * powerUps.length)];
            }
        } else {
            // Challenge mode => flat 10% chance
            if (Math.random() < 0.1) {
                const powerUps = Object.values(CORALS.special) as string[];
                return powerUps[Math.floor(Math.random() * powerUps.length)];
            }
        }
        return null;
    };

    const swapCells = async (
        cell1: { row: number; col: number },
        cell2: { row: number; col: number }
    ) => {
        setIsAnimating(true);
        const newGrid = structuredClone(grid);

        // Perform swap
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
            // Only track if it’s a normal coral
            if ([...CORALS.regular, ...CORALS.extended].includes(coral as typeof CORALS.regular[number] | typeof CORALS.extended[number])) {
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
            // We have a match => play match sound
            matchAudio.current?.play();

            // Expand for bombs/lines, etc.
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",").map(Number);
                const piece = currentGrid[r][c];
                if (piece === CORALS.special.BOMB) {
                    // Clear the surrounding 3x3
                    for (let rr = -1; rr <= 1; rr++) {
                        for (let cc = -1; cc <= 1; cc++) {
                            const newR = r + rr;
                            const newC = c + cc;
                            if (
                                newR >= 0 &&
                                newR < GRID_SIZE &&
                                newC >= 0 &&
                                newC < GRID_SIZE
                            ) {
                                matchPositions.add(`${newR},${newC}`);
                                matchedCoralsArr.push(currentGrid[newR][newC] || "");
                            }
                        }
                    }
                } else if (piece === CORALS.special.LINE) {
                    // Clear entire row & column
                    for (let i = 0; i < GRID_SIZE; i++) {
                        matchPositions.add(`${r},${i}`);
                        matchedCoralsArr.push(currentGrid[r][i] || "");
                        matchPositions.add(`${i},${c}`);
                        matchedCoralsArr.push(currentGrid[i][c] || "");
                    }
                }
            });

            // Clear matched positions
            const newGrid = structuredClone(currentGrid);
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",").map(Number);
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

            // Animate matched pieces a moment before dropping
            // (Optional: you could do more advanced transitions with a "matchedCells" state.)
            await new Promise((resolve) => setTimeout(resolve, 350));

            // Then drop/fill
            await fillEmptyCells(newGrid);

            // Check for winning conditions in Challenge
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
            const coralSet = getCoralSet();
            for (let row = writeRow; row >= 0; row--) {
                const powerUp = generatePowerUp();
                newGrid[row][col] = powerUp ?? coralSet[Math.floor(Math.random() * coralSet.length)];
                hasEmpty = true;
            }
        }

        if (hasEmpty) {
            setGrid(newGrid);
            // Wait for drop animation
            await new Promise((resolve) => setTimeout(resolve, 300));
            // Check for new matches after fill
            await checkMatches(newGrid);
        } else {
            // If no empties, free up animations
            setIsAnimating(false);
        }
    };

    const triggerMatchEffects = () => {
        // Casino-like confetti burst
        confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#ffe55c", "#ffc9ff", "#bff7f2"],
        });
    };

    const triggerWinEffects = () => {
        winAudio.current?.play();
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ["#00aaff", "#5bf5ee", "#ffc700"],
        });
        toast.success("You've restored the coral reef!");
    };

    const handleModeSelect = (mode: GameMode) => {
        setGameMode(mode);
    };

    // -----------------------------------
    // Render
    // -----------------------------------
    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20 relative overflow-hidden">
            <Navigation />
            <main className="max-w-screen-xl mx-auto px-4 py-8">
                {!gameMode ? (
                    <ModeSelection
                        onModeSelect={handleModeSelect}
                        freePlayDifficulty={freePlayDifficulty}
                        setFreePlayDifficulty={setFreePlayDifficulty}
                    />
                ) : (
                    <div>
                        <StatsBoard
                            gameMode={gameMode}
                            score={score}
                            moves={Number.isFinite(moves) ? moves : 99999}
                            totalCollected={totalCollected}
                            collectedCorals={collectedCorals}
                            freePlayDifficulty={freePlayDifficulty}
                        />

                        <GameBoard
                            grid={grid}
                            selectedCell={selectedCell}
                            isAnimating={isAnimating}
                            gameOver={gameOver}
                            onCellClick={handleCellClick}
                        />

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

                        <GameOverModal
                            show={gameOver}
                            score={score}
                            totalCollected={totalCollected}
                            collectedCorals={collectedCorals}
                            onPlayAgain={initializeGame}
                            onChangeMode={() => setGameMode(null)}
                        />

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
