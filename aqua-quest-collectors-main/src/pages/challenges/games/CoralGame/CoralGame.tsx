/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Sound imports
import swapSoundFile from "/sounds/swap.mp3";
import matchSoundFile from "/sounds/match.mp3";
import winSoundFile from "/sounds/success.mp3";

// UI / icons
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

// Subcomponents
import {
    ModeSelection,
    StatsBoard,
    TutorialModal,
    GameOverModal,
    GameBoard,
    AdventureMap,
    Level,
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
    // Basic states
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

    // **Highlight** matched positions
    const [matchedPositions, setMatchedPositions] = useState<Set<string> | null>(null);

    // Adventure levels
    const [levels, setLevels] = useState<Level[]>(() => [
        {
            id: 1,
            name: "Coral Coast",
            difficulty: 2,
            moves: 10,
            targetScore: 600,
            isCompleted: false,
            locked: false,
            x: 100,
            y: 300,
            adjacency: [1],
        },
        {
            id: 2,
            name: "Shark Bay",
            difficulty: 3,
            moves: 15,
            targetScore: 900,
            isCompleted: false,
            locked: true,
            x: 300,
            y: 220,
            adjacency: [0, 2],
        },
        {
            id: 3,
            name: "Sunken Ship",
            difficulty: 4,
            moves: 18,
            targetScore: 1200,
            isCompleted: false,
            locked: true,
            x: 500,
            y: 300,
            adjacency: [1, 3],
        },
        {
            id: 4,
            name: "Deep Cavern",
            difficulty: 5,
            moves: 20,
            targetScore: 1500,
            isCompleted: false,
            locked: true,
            x: 400,
            y: 400,
            adjacency: [2, 4],
        },
        {
            id: 5,
            name: "Atlantis Gate",
            difficulty: 6,
            moves: 25,
            targetScore: 2000,
            isCompleted: false,
            locked: true,
            x: 250,
            y: 420,
            adjacency: [3],
        },
    ]);

    const [currentLevelIndex, setCurrentLevelIndex] = useState<number | null>(null);

    // Audio refs
    const swapAudio = useRef<HTMLAudioElement | null>(null);
    const matchAudio = useRef<HTMLAudioElement | null>(null);
    const winAudio = useRef<HTMLAudioElement | null>(null);

    // Coral collection
    const [collectedCorals, setCollectedCorals] = useState<Record<string, number>>({});
    const [totalCollected, setTotalCollected] = useState(0);

    useEffect(() => {
        swapAudio.current = new Audio(swapSoundFile);
        matchAudio.current = new Audio(matchSoundFile);
        winAudio.current = new Audio(winSoundFile);

        if (swapAudio.current) swapAudio.current.volume = 0.6;
        if (matchAudio.current) matchAudio.current.volume = 0.65;
        if (winAudio.current) winAudio.current.volume = 0.7;
    }, []);

    // If user picks CHALLENGE or FREE => init
    useEffect(() => {
        if (gameMode && gameMode !== GAME_MODES.ADVENTURE) {
            initializeGame();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameMode]);

    // Generate power-ups (10% chance)
    const generatePowerUp = (): string | null => {
        if (Math.random() < 0.1) {
            const powerUps = Object.values(CORALS.special) as string[];
            return powerUps[Math.floor(Math.random() * powerUps.length)];
        }
        return null;
    };

    // Choose a set of corals based on difficulty
    const getCoralSet = (difficultyValue: number) => {
        if (gameMode === GAME_MODES.CHALLENGE) {
            return CORALS.regular;
        } else {
            const totalTypes = 6 + Math.floor((difficultyValue / 10) * CORALS.extended.length);
            return [...CORALS.regular, ...CORALS.extended].slice(0, totalTypes);
        }
    };

    // Initialize the grid
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

    // Check adjacency
    const isAdjacent = (c1: { row: number; col: number }, c2: { row: number; col: number }) => {
        return (
            (Math.abs(c1.row - c2.row) === 1 && c1.col === c2.col) ||
            (Math.abs(c1.col - c2.col) === 1 && c1.row === c2.row)
        );
    };

    // ======================= GAME MODE CONTROL =======================
    const handleModeSelect = (mode: GameMode) => {
        setGameMode(mode);
        setCurrentLevelIndex(null);
    };

    const handleBackToModeSelect = () => {
        setGameMode(null);
    };

    const handleSelectLevel = (index: number) => {
        setCurrentLevelIndex(index);
        initializeGameWithLevel(levels[index]);
    };

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

    // For Free or Challenge
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

    // ======================== PLAYER ACTIONS =========================
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
                swapCells(selectedCell, { row, col });
            }
            setSelectedCell(null);
        }
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
        if (matched) {
            // Play swap sound if a valid match was produced
            swapAudio.current?.play().catch(() => { });
            if (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) {
                setMoves((m) => m - 1);
            }
        } else {
            // revert
            setTimeout(() => {
                newGrid[cell2.row][cell2.col] = newGrid[cell1.row][cell1.col];
                newGrid[cell1.row][cell1.col] = temp;
                setGrid(newGrid);
                setIsAnimating(false);
            }, 500);
        }
    };

    // =============== MATCH/RESHUFFLE LOGIC ===============
    // Quick function to check if ANY swap can produce a match
    const checkAnyPossibleMove = (gridToCheck: (string | null)[][]): boolean => {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (col < GRID_SIZE - 1) {
                    // Swap right
                    if (simulateSwapAndCheck(gridToCheck, row, col, row, col + 1)) {
                        return true;
                    }
                }
                if (row < GRID_SIZE - 1) {
                    // Swap down
                    if (simulateSwapAndCheck(gridToCheck, row, col, row + 1, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const simulateSwapAndCheck = (
        gridToCheck: (string | null)[][],
        r1: number,
        c1: number,
        r2: number,
        c2: number
    ): boolean => {
        const newGrid = structuredClone(gridToCheck);
        const temp = newGrid[r1][c1];
        newGrid[r1][c1] = newGrid[r2][c2];
        newGrid[r2][c2] = temp;
        return hasImmediateMatch(newGrid);
    };

    // Just do a basic 3-match check (like in checkMatches but simpler).
    const hasImmediateMatch = (g: (string | null)[][]): boolean => {
        // horizontal
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                const val = g[row][col];
                if (val && val === g[row][col + 1] && val === g[row][col + 2]) {
                    return true;
                }
            }
        }
        // vertical
        for (let col = 0; col < GRID_SIZE; col++) {
            for (let row = 0; row < GRID_SIZE - 2; row++) {
                const val = g[row][col];
                if (val && val === g[row + 1][col] && val === g[row + 2][col]) {
                    return true;
                }
            }
        }
        return false;
    };

    const reshuffleGrid = () => {
        // Flatten ignoring null
        const flattened = grid.flat().filter((val) => val != null) as string[];
        // shuffle
        for (let i = flattened.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flattened[i], flattened[j]] = [flattened[j], flattened[i]];
        }

        // Reassign
        const newGrid = Array(GRID_SIZE)
            .fill(null)
            .map(() => Array(GRID_SIZE).fill(null));
        let idx = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                newGrid[r][c] = flattened[idx++];
            }
        }
        setGrid(newGrid);
        toast("Grid reshuffled for new moves!", { description: "Try again!" });
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
            // 1) highlight matched positions
            setMatchedPositions(matchPositions);
            // 2) short delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            matchAudio.current?.play();

            // Expand bombs, lines, etc.
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",").map(Number);
                const piece = currentGrid[r][c];
                if (piece === CORALS.special.BOMB) {
                    for (let rr = -1; rr <= 1; rr++) {
                        for (let cc = -1; cc <= 1; cc++) {
                            const nr = r + rr;
                            const nc = c + cc;
                            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                                matchPositions.add(`${nr},${nc}`);
                                matchedCoralsArr.push(currentGrid[nr][nc] || "");
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

            // Clear matched
            const newGrid = structuredClone(currentGrid);
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",").map(Number);
                newGrid[r][c] = null;
            });

            // remove highlight
            setMatchedPositions(null);

            updateCollection(matchedCoralsArr);

            if (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) {
                const points = matchPositions.size * POINTS_PER_MATCH;
                setScore((s) => s + points);
            }

            setCombo((c) => c + 1);
            setGrid(newGrid);
            triggerMatchEffects();

            await new Promise((resolve) => setTimeout(resolve, 300));
            await fillEmptyCells(newGrid);

            // check if user hit target
            if (gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null) {
                const lvl = levels[currentLevelIndex];
                if (score >= lvl.targetScore) {
                    setGameOver(true);
                    triggerWinEffects();
                }
            } else if (gameMode === GAME_MODES.CHALLENGE && score >= WINNING_SCORE) {
                setGameOver(true);
                triggerWinEffects();
            }
        } else {
            // no match => free up
            setCombo(0);
            setIsAnimating(false);

            // check if there's any possible move
            if (!checkAnyPossibleMove(currentGrid)) {
                reshuffleGrid();
            }
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
            // check if any possible move
            if (!checkAnyPossibleMove(newGrid)) {
                reshuffleGrid();
            }
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

    // Mark level completed, unlock next if any
    const completeCurrentLevel = () => {
        if (currentLevelIndex !== null) {
            setLevels((prev) => {
                const updated = [...prev];
                updated[currentLevelIndex].isCompleted = true;
                const nextIndex = currentLevelIndex + 1;
                if (nextIndex < updated.length) {
                    updated[nextIndex].locked = false;
                }
                return updated;
            });
        }
    };

    const allLevelsCompleted = levels.every((lvl) => lvl.isCompleted);
    const didWinAdventureLevel =
        gameMode === GAME_MODES.ADVENTURE &&
        currentLevelIndex !== null &&
        score >= levels[currentLevelIndex].targetScore;

    useEffect(() => {
        if (didWinAdventureLevel && gameOver && currentLevelIndex !== null) {
            completeCurrentLevel();
            if (allLevelsCompleted) {
                toast.success("All corals restored! Feel free to replay any level! 🌊");
            }
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
            // If all levels done
            toast.success("You've completed all levels! Replay anytime!");
            setCurrentLevelIndex(null);
            setGameOver(false);
        }
    };

    const handleViewMap = () => {
        setGameOver(false);
        setCurrentLevelIndex(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 pt-16 relative overflow-hidden">
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
                        onBackToModeSelect={handleBackToModeSelect}
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

                        {/* Pass matchedPositions so we highlight cells */}
                        <GameBoard
                            grid={grid}
                            selectedCell={selectedCell}
                            isAnimating={isAnimating}
                            gameOver={gameOver}
                            onCellClick={handleCellClick}
                            matchedPositions={matchedPositions}
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
                            onViewMap={handleViewMap}
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
