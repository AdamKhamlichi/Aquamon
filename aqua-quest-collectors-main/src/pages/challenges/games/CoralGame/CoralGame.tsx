/* eslint-disable @typescript-eslint/no-explicit-any */
// CoralGame.tsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Sound imports
import swapSoundFile from "/sounds/swap.mp3";
import matchSoundFile from "/sounds/match.mp3";
import winSoundFile from "/sounds/success.mp3";

// UI
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

// Our subcomponents
import {
    ModeSelection,
    StatsBoard,
    TutorialModal,
    GameOverModal,
    GameBoard,
    AdventureMap,
    Level,
} from "./GameComponent";

// Constants
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
    // Basic game state
    const [grid, setGrid] = useState<(string | null)[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState<number>(INITIAL_MOVES);
    const [isAnimating, setIsAnimating] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0);
    const [showTutorial, setShowTutorial] = useState(true);
    const [gameMode, setGameMode] = useState<GameMode | null>(null);

    // Free Play difficulty
    const [freePlayDifficulty, setFreePlayDifficulty] = useState(5);

    // ADVENTURE levels array
    // Notice each level has adjacency for index-based references.
    const [levels, setLevels] = useState<Level[]>(() => [
        {
            id: 1,
            name: "Coral Coast",
            difficulty: 2,
            moves: 15,
            targetScore: 1000,
            isCompleted: false,
            locked: false,
            x: 150,
            y: 300,
            adjacency: [1], // connects to levels[1] (index 1 in array)
        },
        {
            id: 2,
            name: "Deep Sea Canyon",
            difficulty: 4,
            moves: 20,
            targetScore: 1500,
            isCompleted: false,
            locked: true,
            x: 350,
            y: 220,
            adjacency: [0, 2], // connects back to levels[0], forward to levels[2]
        },
        {
            id: 3,
            name: "Sunken Ship Reef",
            difficulty: 6,
            moves: 25,
            targetScore: 2000,
            isCompleted: false,
            locked: true,
            x: 550,
            y: 320,
            adjacency: [1], // connects back to levels[1]
        },
    ]);

    // Which level index is currently being played (null => none selected)
    const [currentLevelIndex, setCurrentLevelIndex] = useState<number | null>(null);

    // Audio refs
    const swapAudio = useRef<HTMLAudioElement | null>(null);
    const matchAudio = useRef<HTMLAudioElement | null>(null);
    const winAudio = useRef<HTMLAudioElement | null>(null);

    // Collected corals
    const [collectedCorals, setCollectedCorals] = useState<Record<string, number>>({});
    const [totalCollected, setTotalCollected] = useState(0);

    // Initialize audio
    useEffect(() => {
        swapAudio.current = new Audio(swapSoundFile);
        matchAudio.current = new Audio(matchSoundFile);
        winAudio.current = new Audio(winSoundFile);

        if (swapAudio.current) swapAudio.current.volume = 0.6;
        if (matchAudio.current) matchAudio.current.volume = 0.65;
        if (winAudio.current) winAudio.current.volume = 0.7;
    }, []);

    // If user picks Challenge/Free, auto-init the game
    useEffect(() => {
        if (gameMode && gameMode !== GAME_MODES.ADVENTURE) {
            initializeGame();
        }
    }, [gameMode]);

    // For ADVENTURE => user must pick a level from the map
    const handleSelectLevel = (index: number) => {
        setCurrentLevelIndex(index);
        initializeGameWithLevel(levels[index]);
    };

    // Setup a single level in ADVENTURE
    const initializeGameWithLevel = (lvl: Level) => {
        initializeGrid(lvl.difficulty);
        setScore(0);
        setMoves(lvl.moves);
        setGameOver(false);
        setCombo(0);
        setCollectedCorals({});
        setTotalCollected(0);
        setShowTutorial(true);
    };

    // For CHALLENGE or FREE
    const initializeGame = () => {
        if (gameMode === GAME_MODES.CHALLENGE) {
            setMoves(INITIAL_MOVES);
        } else if (gameMode === GAME_MODES.FREE) {
            setMoves(Infinity);
        }
        initializeGrid(freePlayDifficulty);
        setScore(0);
        setGameOver(false);
        setCombo(0);
        setCollectedCorals({});
        setTotalCollected(0);
        setShowTutorial(true);
    };

    // Get a coral set based on difficulty
    const getCoralSet = (difficultyValue: number) => {
        if (gameMode === GAME_MODES.CHALLENGE) {
            return CORALS.regular;
        } else {
            // free or adventure => scale extended
            const totalTypes = 6 + Math.floor((difficultyValue / 10) * CORALS.extended.length);
            return [...CORALS.regular, ...CORALS.extended].slice(0, totalTypes);
        }
    };

    const initializeGrid = (difficultyValue: number) => {
        const coralSet = getCoralSet(difficultyValue);
        const newGrid = Array(GRID_SIZE)
            .fill(null)
            .map(() =>
                Array(GRID_SIZE)
                    .fill(null)
                    .map(() => coralSet[Math.floor(Math.random() * coralSet.length)])
            );
        setGrid(newGrid);
    };

    const isAdjacent = (c1: { row: number; col: number }, c2: { row: number; col: number }) => {
        const rowDiff = Math.abs(c1.row - c2.row);
        const colDiff = Math.abs(c1.col - c2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };

    const handleCellClick = (row: number, col: number) => {
        if (isAnimating || gameOver) return;
        if (
            (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) &&
            moves <= 0
        ) {
            return;
        }

        if (!selectedCell) {
            setSelectedCell({ row, col });
        } else {
            if (isAdjacent(selectedCell, { row, col })) {
                swapAudio.current?.play();
                swapCells(selectedCell, { row, col });
            }
            setSelectedCell(null);
        }
    };

    const generatePowerUp = (): string | null => {
        let chance = 0.1;
        if (gameMode === GAME_MODES.FREE) {
            const penalty = (freePlayDifficulty - 1) * 0.007;
            chance = Math.max(0.1 - penalty, 0.01);
        } else if (gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null) {
            const lvl = levels[currentLevelIndex];
            const penalty = (lvl.difficulty - 1) * 0.007;
            chance = Math.max(0.1 - penalty, 0.01);
        }

        if (Math.random() < chance) {
            const powerUps = Object.values(CORALS.special) as string[];
            return powerUps[Math.floor(Math.random() * powerUps.length)];
        }
        return null;
    };

    const swapCells = async (
        cell1: { row: number; col: number },
        cell2: { row: number; col: number }
    ) => {
        setIsAnimating(true);
        const newGrid = structuredClone(grid);

        const temp = newGrid[cell1.row][cell1.col];
        newGrid[cell1.row][cell1.col] = newGrid[cell2.row][cell2.col];
        newGrid[cell2.row][cell2.col] = temp;
        setGrid(newGrid);

        const matched = await checkMatches(newGrid);
        if (!matched) {
            setTimeout(() => {
                newGrid[cell2.row][cell2.col] = newGrid[cell1.row][cell1.col];
                newGrid[cell1.row][cell1.col] = temp;
                setGrid(newGrid);
                setIsAnimating(false);
            }, 500);
        } else {
            if (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) {
                setMoves((m) => m - 1);
            }
        }
    };

    const updateCollection = (matchedCoralsArr: string[]) => {
        const updated = { ...collectedCorals };
        matchedCoralsArr.forEach((coral) => {
            if ([...CORALS.regular, ...CORALS.extended].includes(coral as any)) {
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

        const isMatchingPiece = (a: string | null, b: string | null) => {
            return (
                a !== null &&
                b !== null &&
                (a === b || a === CORALS.special.RAINBOW || b === CORALS.special.RAINBOW)
            );
        };

        // Horizontal
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

        // Vertical
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
            matchAudio.current?.play();

            // Expand bombs/lines
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",").map(Number);
                const piece = currentGrid[r][c];
                if (piece === CORALS.special.BOMB) {
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
                    for (let i = 0; i < GRID_SIZE; i++) {
                        matchPositions.add(`${r},${i}`);
                        matchedCoralsArr.push(currentGrid[r][i] || "");
                        matchPositions.add(`${i},${c}`);
                        matchedCoralsArr.push(currentGrid[i][c] || "");
                    }
                }
            });

            // Clear them
            const newGrid = structuredClone(currentGrid);
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",").map(Number);
                newGrid[r][c] = null;
            });

            updateCollection(matchedCoralsArr);

            if (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) {
                const points = matchPositions.size * POINTS_PER_MATCH;
                setScore((s) => s + points);
            }

            setCombo((c) => c + 1);
            setGrid(newGrid);
            triggerMatchEffects();

            await new Promise((resolve) => setTimeout(resolve, 350));
            await fillEmptyCells(newGrid);

            // If adventure => check level target
            if (gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null) {
                const lvl = levels[currentLevelIndex];
                if (score >= lvl.targetScore) {
                    setGameOver(true);
                    triggerWinEffects();
                }
            }
            // If challenge => check 2000
            else if (gameMode === GAME_MODES.CHALLENGE && score >= WINNING_SCORE) {
                setGameOver(true);
                triggerWinEffects();
            }
        } else {
            setCombo(0);
            setIsAnimating(false);
        }

        return hasMatches;
    };

    const fillEmptyCells = async (currentGrid: (string | null)[][]) => {
        const newGrid = structuredClone(currentGrid);
        let hasEmpty = false;

        let difficultyValue = freePlayDifficulty;
        if (gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null) {
            difficultyValue = levels[currentLevelIndex].difficulty;
        }

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
            // fill empty
            const coralSet = getCoralSet(difficultyValue);
            for (let row = writeRow; row >= 0; row--) {
                const powerUp = generatePowerUp();
                newGrid[row][col] =
                    powerUp ?? coralSet[Math.floor(Math.random() * coralSet.length)];
                hasEmpty = true;
            }
        }

        if (hasEmpty) {
            setGrid(newGrid);
            await new Promise((resolve) => setTimeout(resolve, 300));
            await checkMatches(newGrid);
        } else {
            setIsAnimating(false);
        }
    };

    const triggerMatchEffects = () => {
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
        toast.success("You've reached the target score!");
    };

    const handleModeSelect = (mode: GameMode) => {
        setGameMode(mode);
        setCurrentLevelIndex(null);
    };

    const completeCurrentLevel = () => {
        if (currentLevelIndex !== null) {
            setLevels((prev) => {
                const updated = [...prev];
                updated[currentLevelIndex].isCompleted = true;
                // unlock next
                if (currentLevelIndex + 1 < updated.length) {
                    updated[currentLevelIndex + 1].locked = false;
                }
                return updated;
            });
        }
    };

    const didWinAdventureLevel = (() => {
        if (
            gameMode === GAME_MODES.ADVENTURE &&
            currentLevelIndex !== null &&
            levels[currentLevelIndex]
        ) {
            return score >= levels[currentLevelIndex].targetScore;
        }
        return false;
    })();

    useEffect(() => {
        if (didWinAdventureLevel && gameOver && currentLevelIndex !== null) {
            completeCurrentLevel();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [didWinAdventureLevel, gameOver]);

    const handleReplayLevel = () => {
        if (gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null) {
            initializeGameWithLevel(levels[currentLevelIndex]);
        } else {
            initializeGame();
        }
    };

    const handleNextLevel = () => {
        if (currentLevelIndex === null) return;
        const nextIndex = currentLevelIndex + 1;
        if (nextIndex < levels.length) {
            setCurrentLevelIndex(nextIndex);
            initializeGameWithLevel(levels[nextIndex]);
        } else {
            toast.success("Congratulations! You've finished all levels!");
            setCurrentLevelIndex(null);
            setGameOver(false);
        }
    };

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
                ) : gameMode === GAME_MODES.ADVENTURE && currentLevelIndex === null ? (
                    <AdventureMap
                        levels={levels}
                        onSelectLevel={handleSelectLevel}
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
                            currentLevelName={
                                gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null
                                    ? levels[currentLevelIndex].name
                                    : undefined
                            }
                            currentTargetScore={
                                gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null
                                    ? levels[currentLevelIndex].targetScore
                                    : undefined
                            }
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
                                    onClick={
                                        gameMode === GAME_MODES.ADVENTURE
                                            ? handleReplayLevel
                                            : initializeGame
                                    }
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
                            onPlayAgain={handleReplayLevel}
                            onChangeMode={() => setGameMode(null)}
                            isAdventure={gameMode === GAME_MODES.ADVENTURE}
                            didWinAdventureLevel={didWinAdventureLevel}
                            onNextLevel={handleNextLevel}
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
