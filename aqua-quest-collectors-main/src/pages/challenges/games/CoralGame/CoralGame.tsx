// CoralGame.tsx
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

// Our decoupled subcomponents
import {
    ModeSelection,
    StatsBoard,
    TutorialModal,
    GameOverModal,
    GameBoard,
    AdventureSelector,
    LEVELS,         // <--- New import
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

    // Difficulty slider for Free Play
    const [freePlayDifficulty, setFreePlayDifficulty] = useState(5);

    // --------------------------------------------
    // ADVENTURE MODE STATE
    // --------------------------------------------
    // The array of levels from GameComponent, but stored in state so we can update `isCompleted`.
    const [levels, setLevels] = useState<Level[]>(() => LEVELS.map(l => ({ ...l })));

    // The index of the current level the user is playing (or null if not selected yet)
    const [currentLevelIndex, setCurrentLevelIndex] = useState<number | null>(null);

    // If we are in ADVENTURE mode and the user selected a level, we want to use that level’s moves & target
    const currentLevel =
        gameMode === GAME_MODES.ADVENTURE && currentLevelIndex !== null
            ? levels[currentLevelIndex]
            : null;

    // Audio references
    const swapAudio = useRef<HTMLAudioElement | null>(null);
    const matchAudio = useRef<HTMLAudioElement | null>(null);
    const winAudio = useRef<HTMLAudioElement | null>(null);

    // For tracking which corals have been collected
    const [collectedCorals, setCollectedCorals] = useState<Record<string, number>>({});
    const [totalCollected, setTotalCollected] = useState(0);

    useEffect(() => {
        swapAudio.current = new Audio(swapSoundFile);
        matchAudio.current = new Audio(matchSoundFile);
        winAudio.current = new Audio(winSoundFile);

        // Optional: set volume levels
        swapAudio.current.volume = 0.6;
        matchAudio.current.volume = 0.65;
        winAudio.current.volume = 0.7;
    }, []);

    useEffect(() => {
        if (gameMode) {
            // If we just selected Challenge/Free, we initialize immediately
            // For Adventure, we wait until user picks a level
            if (gameMode !== GAME_MODES.ADVENTURE) {
                initializeGame();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameMode]);

    // If user picks a level in ADVENTURE => call this
    const handleSelectLevel = (index: number) => {
        setCurrentLevelIndex(index);
        initializeGameWithLevel(levels[index]); // sets up grid/moves, etc.
    };

    // For ADVENTURE Mode only
    const initializeGameWithLevel = (lvl: Level) => {
        // For each new level, reset everything
        initializeGrid(lvl.difficulty);
        setScore(0);
        setMoves(lvl.moves);
        setGameOver(false);
        setCombo(0);
        setCollectedCorals({});
        setTotalCollected(0);
        setShowTutorial(true);
    };

    // For other modes (challenge/free)
    const initializeGame = () => {
        // “Difficulty” here is for free play. Challenge is fixed.
        // If we’re in free mode => the user picks from 1-10 => create bigger sets, etc.
        initializeGrid(freePlayDifficulty);
        setScore(0);
        setMoves(gameMode === GAME_MODES.CHALLENGE ? INITIAL_MOVES : Infinity);
        setGameOver(false);
        setCombo(0);
        setCollectedCorals({});
        setTotalCollected(0);
        setShowTutorial(true);
    };

    // Adjust the set of corals based on difficulty
    const getCoralSet = (difficulty: number) => {
        if (gameMode === GAME_MODES.CHALLENGE) {
            return CORALS.regular; // Original 6 corals
        }
        else if (gameMode === GAME_MODES.ADVENTURE) {
            // For demonstration, link the difficulty from the level to the “extended” set
            const totalTypes = 6 + Math.floor((difficulty / 10) * CORALS.extended.length);
            return [...CORALS.regular, ...CORALS.extended].slice(0, totalTypes);
        }
        else {
            // Free Play
            const totalTypes = 6 + Math.floor((difficulty / 10) * CORALS.extended.length);
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

    const isAdjacent = (cell1: { row: number; col: number }, cell2: { row: number; col: number }) => {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };

    const handleCellClick = (row: number, col: number) => {
        if (isAnimating || gameOver) return;
        if ((gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) && moves <= 0) return;

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
        // 10% chance for Challenge
        // Or slightly variable for free/adventure
        let chance = 0.1;
        if (gameMode === GAME_MODES.FREE) {
            const penalty = (freePlayDifficulty - 1) * 0.007;
            chance = Math.max(0.1 - penalty, 0.01);
        }
        else if (gameMode === GAME_MODES.ADVENTURE && currentLevel) {
            // For demonstration, do the same logic or some custom approach
            const penalty = (currentLevel.difficulty - 1) * 0.007;
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
            // If match found in challenge or adventure, decrement moves
            if (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) {
                setMoves((m) => m - 1);
            }
        }
    };

    const updateCollection = (matchedCoralsArr: string[]) => {
        const updated = { ...collectedCorals };
        matchedCoralsArr.forEach((coral) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            // Expand for bombs/lines, etc.
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

            // Clear matched
            const newGrid = structuredClone(currentGrid);
            matchPositions.forEach((pos) => {
                const [r, c] = pos.split(",");
                newGrid[r][c] = null;
            });

            updateCollection(matchedCoralsArr);
            // If challenge or adventure => add points
            if (gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) {
                const points = matchPositions.size * POINTS_PER_MATCH;
                setScore((s) => s + points);
            }

            setCombo((c) => c + 1);
            setGrid(newGrid);
            triggerMatchEffects();

            await new Promise((resolve) => setTimeout(resolve, 350));
            await fillEmptyCells(newGrid);

            // ADVENTURE Mode => check if we reached currentLevel.targetScore
            if (gameMode === GAME_MODES.ADVENTURE && currentLevel && score >= currentLevel.targetScore) {
                setGameOver(true);
                triggerWinEffects(); // confetti + sound
            }
            // Challenge => check if we reached WINNING_SCORE
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

        const difficultyValue =
            gameMode === GAME_MODES.ADVENTURE && currentLevel
                ? currentLevel.difficulty
                : freePlayDifficulty;

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
            // fill with new pieces
            const coralSet = getCoralSet(difficultyValue);
            for (let row = writeRow; row >= 0; row--) {
                const powerUp = generatePowerUp();
                newGrid[row][col] = powerUp ?? coralSet[Math.floor(Math.random() * coralSet.length)];
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
        setCurrentLevelIndex(null); // reset adventure state
    };

    // Mark the current level as completed, update state
    const completeCurrentLevel = () => {
        if (currentLevelIndex !== null) {
            setLevels(prevLevels => {
                const updated = [...prevLevels];
                updated[currentLevelIndex] = {
                    ...updated[currentLevelIndex],
                    isCompleted: true,
                };
                return updated;
            });
        }
    };

    // If user hits "Next Level" in the game over screen
    const handleNextLevel = () => {
        if (currentLevelIndex === null) return;
        const nextIndex = currentLevelIndex + 1;
        if (nextIndex < levels.length) {
            // proceed to next level
            setCurrentLevelIndex(nextIndex);
            initializeGameWithLevel(levels[nextIndex]);
        } else {
            // No more levels => done.
            toast.success("Congratulations! You've finished all levels!");
            // Return to level select screen, or do something else
            setCurrentLevelIndex(null);
            setGameOver(false);
        }
    };

    // Determine if we "won" the level in ADVENTURE
    const didWinAdventureLevel =
        gameMode === GAME_MODES.ADVENTURE &&
        currentLevel &&
        score >= currentLevel.targetScore;

    // If user restarts the same level
    const handleReplayLevel = () => {
        if (gameMode === GAME_MODES.ADVENTURE && currentLevel) {
            initializeGameWithLevel(currentLevel);
        } else {
            // fallback for other modes
            initializeGame();
        }
    };

    // If the game is over in ADVENTURE and we have indeed "won",
    // mark the level as completed
    useEffect(() => {
        if (didWinAdventureLevel && gameOver && currentLevelIndex !== null) {
            completeCurrentLevel();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [didWinAdventureLevel, gameOver]);

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
                ) : gameMode === GAME_MODES.ADVENTURE && currentLevelIndex === null ? (
                    // Show Adventure Selector if user is in ADVENTURE but hasn't chosen a level
                    <AdventureSelector
                        levels={levels}
                        onSelectLevel={handleSelectLevel}
                    />
                ) : (
                    // Normal game screen (Challenge/Free OR Adventure if level selected)
                    <div>
                        <StatsBoard
                            gameMode={gameMode}
                            score={score}
                            moves={Number.isFinite(moves) ? moves : 99999}
                            totalCollected={totalCollected}
                            collectedCorals={collectedCorals}
                            freePlayDifficulty={freePlayDifficulty}
                            // If we're in adventure => show level name & target
                            currentLevelName={currentLevel?.name}
                            currentTargetScore={currentLevel?.targetScore}
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
                            // Adventure-specific props
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
