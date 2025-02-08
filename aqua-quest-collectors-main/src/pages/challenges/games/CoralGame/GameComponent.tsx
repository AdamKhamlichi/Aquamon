// GameComponent.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, Shell, Fish } from "lucide-react";
import {
    GAME_MODES,
    GameMode,
    WINNING_SCORE,
    INITIAL_MOVES,
    CORALS,
} from "./constant";

/* -------------------------------------------------------------------------- */
/*                                  LEVELS                                    */
/* -------------------------------------------------------------------------- */
// Example levels. Each has: moves, difficulty (1-10), targetScore, isCompleted
// You can add as many as you like or adjust their values.
export interface Level {
    id: number;
    name: string;
    difficulty: number;
    moves: number;
    targetScore: number;
    isCompleted: boolean;
}

// For demonstration, we define them here, but you can move them into constants.ts if you prefer.
export const LEVELS: Level[] = [
    {
        id: 1,
        name: "Coral Coast",
        difficulty: 2,
        moves: 15,
        targetScore: 1000,
        isCompleted: false,
    },
    {
        id: 2,
        name: "Deep Sea Canyon",
        difficulty: 4,
        moves: 20,
        targetScore: 1500,
        isCompleted: false,
    },
    {
        id: 3,
        name: "Sunken Ship Reef",
        difficulty: 6,
        moves: 25,
        targetScore: 2000,
        isCompleted: false,
    },
];

/* -------------------------------------------------------------------------- */
/*                              ADVENTURE SELECTOR                            */
/* -------------------------------------------------------------------------- */
// A simple screen listing all levels. We show if it’s completed, the difficulty,
// the moves, the target score. On click, we call onSelectLevel with the index.

interface AdventureSelectorProps {
    levels: Level[];
    onSelectLevel: (index: number) => void;
}

export const AdventureSelector: React.FC<AdventureSelectorProps> = ({
    levels,
    onSelectLevel,
}) => {
    return (
        <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl font-bold text-gray-900 mb-8 font-pixel animate-float">
                Adventure Mode
            </h1>
            <p className="text-gray-600 mb-4">
                Select a level to begin your undersea adventure:
            </p>

            <div className="max-w-md mx-auto space-y-4">
                {levels.map((lvl, i) => (
                    <motion.div
                        key={lvl.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-tr from-blue-50 via-sky-50 to-blue-100
                       backdrop-blur-lg rounded-2xl p-5 border border-blue-200 shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-blue-700">{lvl.name}</h2>
                            {lvl.isCompleted && (
                                <span className="text-sm text-green-600 font-semibold">COMPLETED</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">
                            Difficulty: <span className="font-semibold text-blue-500">{lvl.difficulty}</span><br />
                            Moves: <span className="font-semibold text-blue-500">{lvl.moves}</span><br />
                            Target Score:{" "}
                            <span className="font-semibold text-blue-500">{lvl.targetScore}</span>
                        </p>
                        <Button
                            variant="outline"
                            className="w-full mt-3"
                            onClick={() => onSelectLevel(i)}
                        >
                            {lvl.isCompleted ? "Replay" : "Start"} {lvl.name}
                        </Button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

/* -------------------------------------------------------------------------- */
/*                               MODE SELECTION                               */
/* -------------------------------------------------------------------------- */
interface ModeSelectionProps {
    onModeSelect: (mode: GameMode) => void;
    freePlayDifficulty: number;
    setFreePlayDifficulty: (value: number) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({
    onModeSelect,
    freePlayDifficulty,
    setFreePlayDifficulty,
}) => {
    return (
        <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
        >
            <h1 className="text-4xl font-bold text-gray-900 mb-8 font-pixel animate-float">
                Select Game Mode
            </h1>
            <div className="grid gap-6 max-w-md mx-auto">
                {/* Adventure Mode */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 shadow-lg"
                >
                    <h2 className="text-2xl font-bold mb-2 text-sky-700">Adventure Mode</h2>
                    <p className="text-gray-600 mb-4">
                        Play through multiple levels with increasing difficulty
                    </p>
                    <Button
                        onClick={() => onModeSelect(GAME_MODES.ADVENTURE)}
                        className="w-full"
                    >
                        Start Adventure
                    </Button>
                </motion.div>
                {/* Challenge Mode */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 shadow-lg"
                >
                    <h2 className="text-2xl font-bold mb-2">Challenge Mode</h2>
                    <p className="text-gray-600 mb-4">
                        Score {WINNING_SCORE} points in {INITIAL_MOVES} moves
                    </p>
                    <Button onClick={() => onModeSelect(GAME_MODES.CHALLENGE)} className="w-full">
                        Start Challenge
                    </Button>
                </motion.div>
                {/* Free Play Mode */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-tr from-blue-50 via-sky-50 to-blue-100 backdrop-blur-lg rounded-2xl p-6 border border-blue-200 shadow-xl"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Fish className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-bold text-blue-700">Free Play Mode</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Dive in and collect as many sea creatures as possible! Adjust your difficulty:
                    </p>
                    <div className="flex items-center gap-2 mb-4 justify-center">
                        <span className="text-sm font-semibold text-blue-500">Easy</span>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={freePlayDifficulty}
                            onChange={(e) => setFreePlayDifficulty(Number(e.target.value))}
                            className="w-1/2 accent-blue-400 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-blue-500">Hard</span>
                    </div>
                    <Button
                        onClick={() => onModeSelect(GAME_MODES.FREE)}
                        className="w-full"
                        variant="outline"
                    >
                        Begin Adventure (Difficulty: {freePlayDifficulty})
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
};

/* -------------------------------------------------------------------------- */
/*                                 STATS BOARD                                */
/* -------------------------------------------------------------------------- */
interface StatsBoardProps {
    gameMode: GameMode;
    score: number;
    moves: number;
    totalCollected: number;
    collectedCorals: Record<string, number>;
    freePlayDifficulty: number;
    // optional: if in ADVENTURE, show the current level or target
    currentLevelName?: string;
    currentTargetScore?: number;
}

export const StatsBoard: React.FC<StatsBoardProps> = ({
    gameMode,
    score,
    moves,
    totalCollected,
    collectedCorals,
    freePlayDifficulty,
    currentLevelName,
    currentTargetScore,
}) => {
    // For ADVENTURE, we can show the name + target score
    const adventureLabel = gameMode === GAME_MODES.ADVENTURE && currentLevelName
        ? `Playing: ${currentLevelName}`
        : null;

    return (
        <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
        >
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-pixel animate-float">
                {gameMode === GAME_MODES.CHALLENGE
                    ? "Challenge Mode"
                    : gameMode === GAME_MODES.FREE
                        ? "Free Play"
                        : "Adventure Mode"}
            </h1>

            {/* If ADVENTURE, show level name / target */}
            {adventureLabel && (
                <div className="text-sm text-sky-700 mb-2">
                    {adventureLabel} (Target Score: {currentTargetScore})
                </div>
            )}

            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                {gameMode === GAME_MODES.CHALLENGE && (
                    <>
                        <div className="bg-blue-50/90 rounded-xl p-4 shadow-lg border border-blue-100">
                            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Score</p>
                            <p className="text-xl font-bold text-blue-600">{score}</p>
                        </div>
                        <div className="bg-blue-50/90 rounded-xl p-4 shadow-lg border border-blue-100">
                            <Timer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Moves</p>
                            <p className="text-xl font-bold text-blue-600">{moves}</p>
                        </div>
                    </>
                )}

                {gameMode === GAME_MODES.ADVENTURE && (
                    <>
                        <div className="bg-blue-50/90 rounded-xl p-4 shadow-lg border border-blue-100">
                            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Score</p>
                            <p className="text-xl font-bold text-blue-600">{score}</p>
                        </div>
                        <div className="bg-blue-50/90 rounded-xl p-4 shadow-lg border border-blue-100">
                            <Timer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Moves</p>
                            <p className="text-xl font-bold text-blue-600">{moves}</p>
                        </div>
                    </>
                )}

                <div className="bg-blue-50/90 rounded-xl p-4 shadow-lg border border-blue-100">
                    <Shell className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Collected</p>
                    <p className="text-xl font-bold text-blue-600">{totalCollected}</p>
                </div>
            </div>

            {/* Collection Progress */}
            <div className="max-w-md mx-auto mb-8 bg-white/90 rounded-xl p-4 shadow-lg border border-blue-100">
                <h3 className="text-lg font-bold mb-2">Collection Progress</h3>
                <div className="grid grid-cols-3 gap-2">
                    {CORALS.regular.map((coral) => (
                        <div
                            key={coral}
                            className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                        >
                            <span className="text-2xl">{coral}</span>
                            <span className="font-bold text-blue-600">{collectedCorals[coral] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {gameMode === GAME_MODES.CHALLENGE && (
                <p className="text-gray-600">Score {WINNING_SCORE} points to win!</p>
            )}
            {gameMode === GAME_MODES.FREE && (
                <p className="text-gray-600">
                    Match corals to collect them!
                    <br />
                    Current Difficulty: <span className="font-semibold">{freePlayDifficulty}</span>
                </p>
            )}
        </motion.div>
    );
};

/* -------------------------------------------------------------------------- */
/*                               TUTORIAL MODAL                               */
/* -------------------------------------------------------------------------- */
interface TutorialModalProps {
    showTutorial: boolean;
    onClose: () => void;
    gameMode: GameMode;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
    showTutorial,
    onClose,
    gameMode,
}) => {
    return (
        <AnimatePresence>
            {showTutorial && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-8 max-w-md mx-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        <h3 className="text-2xl font-bold mb-4">How to Play</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold">Match Corals</h4>
                                <p className="text-gray-600">
                                    Swap adjacent corals to create matches of 3 or more.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">Power-ups</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(CORALS.special).map(([key, coral]) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg"
                                        >
                                            <span className="text-2xl">{coral}</span>
                                            <span className="text-sm text-gray-600">
                                                {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {gameMode === GAME_MODES.CHALLENGE && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Goal</h4>
                                    <p className="text-gray-600">
                                        Score {WINNING_SCORE} points in {INITIAL_MOVES} moves!
                                    </p>
                                </div>
                            )}
                            {gameMode === GAME_MODES.ADVENTURE && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Goal</h4>
                                    <p className="text-gray-600">
                                        Complete each level by reaching its target score within
                                        the allotted moves.
                                    </p>
                                </div>
                            )}
                        </div>
                        <Button onClick={onClose} className="w-full mt-6">
                            Let&apos;s Play!
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* -------------------------------------------------------------------------- */
/*                               GAME OVER MODAL                              */
/* -------------------------------------------------------------------------- */
interface GameOverModalProps {
    show: boolean;
    score: number;
    totalCollected: number;
    collectedCorals: Record<string, number>;
    onPlayAgain: () => void;
    onChangeMode: () => void;
    // For ADVENTURE: do we show "Go to Next Level"?
    isAdventure?: boolean;
    onNextLevel?: () => void;
    didWinAdventureLevel?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
    show,
    score,
    totalCollected,
    collectedCorals,
    onPlayAgain,
    onChangeMode,
    isAdventure,
    onNextLevel,
    didWinAdventureLevel,
}) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-8 max-w-md mx-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">
                            {didWinAdventureLevel ? "Level Complete! 🎉" : "Game Over"}
                        </h2>
                        <div className="space-y-4">
                            <p className="text-xl">Final Score: {score}</p>
                            <p className="text-lg">Corals Collected: {totalCollected}</p>
                            <div className="grid grid-cols-3 gap-2 my-4">
                                {Object.keys(collectedCorals).map((coral) => (
                                    <div
                                        key={coral}
                                        className="text-center p-2 bg-blue-50 rounded-lg"
                                    >
                                        <div className="text-2xl mb-1">{coral}</div>
                                        <div className="font-bold text-blue-600">
                                            {collectedCorals[coral] || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Button onClick={onPlayAgain} className="w-full">
                                    {didWinAdventureLevel ? "Replay Level" : "Play Again"}
                                </Button>
                                {/* If we’re in adventure mode and the user won the level, offer "Next Level" */}
                                {isAdventure && didWinAdventureLevel && onNextLevel && (
                                    <Button
                                        onClick={onNextLevel}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Next Level
                                    </Button>
                                )}
                                <Button onClick={onChangeMode} variant="outline" className="w-full">
                                    Change Mode
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* -------------------------------------------------------------------------- */
/*                                GAME BOARD                                  */
/* -------------------------------------------------------------------------- */
interface GameBoardProps {
    grid: (string | null)[][];
    selectedCell: { row: number; col: number } | null;
    isAnimating: boolean;
    gameOver: boolean;
    onCellClick: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
    grid,
    selectedCell,
    isAnimating,
    gameOver,
    onCellClick,
}) => {
    return (
        <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid gap-1 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-blue-100 shadow-lg">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                        {row.map((cell, colIndex) => {
                            const isSelected =
                                selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

                            return (
                                <motion.button
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => onCellClick(rowIndex, colIndex)}
                                    disabled={isAnimating || gameOver}
                                    className={`
                    w-14 h-14 flex items-center justify-center rounded-xl text-2xl
                    transition-all duration-300
                    ${isSelected
                                            ? "bg-blue-300/20 scale-110"
                                            : "bg-blue-300/5 hover:bg-blue-300/10"
                                        }
                  `}
                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                    whileTap={{ scale: 0.9, rotate: -5 }}
                                    layout
                                >
                                    <motion.span
                                        className="pointer-events-none"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 70 }}
                                    >
                                        {cell}
                                    </motion.span>
                                </motion.button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
