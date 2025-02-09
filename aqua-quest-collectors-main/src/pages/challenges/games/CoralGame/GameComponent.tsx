// GameComponents.tsx

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, Shell, Fish } from "lucide-react";
import {
    GAME_MODES,
    GameMode,
    WINNING_SCORE,
    INITIAL_MOVES,
    CORALS,
    powerUpDescriptions,
} from "./constant";

/* -------------------------------------------------------------------------- */
/*                                 LEVEL TYPE                                 */
/* -------------------------------------------------------------------------- */
export interface Level {
    id: number;
    name: string;
    difficulty: number;
    moves: number;
    targetScore: number;
    isCompleted: boolean;
    locked?: boolean;
    x: number;
    y: number;
    adjacency: number[];
}

/* -------------------------------------------------------------------------- */
/*                           ADVENTURE MAP (UPDATED)                          */
/* -------------------------------------------------------------------------- */
interface AdventureMapProps {
    levels: Level[];
    onSelectLevel: (index: number) => void;
    onBackToModeSelect: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
    levels,
    onSelectLevel,
    onBackToModeSelect,
}) => {
    // We store which level has "keyboard focus."
    const [focusedIndex, setFocusedIndex] = useState<number | null>(() => {
        // Default to the first unlocked level, or null if all locked
        const firstUnlocked = levels.findIndex((l) => !l.locked);
        return firstUnlocked >= 0 ? firstUnlocked : null;
    });

    // -------- NEW KEYBOARD NAVIGATION HOOK --------
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (focusedIndex === null) return;

            const currentLevel = levels[focusedIndex];

            // Decide which direction we want to move (if any)
            let direction: "UP" | "DOWN" | "LEFT" | "RIGHT" | null = null;

            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    direction = "UP";
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    direction = "DOWN";
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    direction = "LEFT";
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    direction = "RIGHT";
                    break;
                case "Enter":
                    // Pressing Enter selects the level if it’s unlocked
                    if (!currentLevel.locked) {
                        onSelectLevel(focusedIndex);
                    }
                    break;
                default:
                    break;
            }

            if (!direction) return;

            // Get the actual neighbor level objects
            // For example, adjacency: [0, 2] => neighbors are levels[0], levels[2]
            const neighbors = currentLevel.adjacency.map((idx) => levels[idx]);

            // We'll find the best neighbor in the direction requested
            let bestNeighbor: Level | null = null;
            let minDistance = Infinity;

            for (const neighbor of neighbors) {
                const dx = neighbor.x - currentLevel.x;
                const dy = neighbor.y - currentLevel.y;

                if (direction === "UP" && neighbor.y < currentLevel.y) {
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestNeighbor = neighbor;
                    }
                } else if (direction === "DOWN" && neighbor.y > currentLevel.y) {
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestNeighbor = neighbor;
                    }
                } else if (direction === "LEFT" && neighbor.x < currentLevel.x) {
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestNeighbor = neighbor;
                    }
                } else if (direction === "RIGHT" && neighbor.x > currentLevel.x) {
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestNeighbor = neighbor;
                    }
                }
            }

            // If we found a valid neighbor in that direction, focus it
            if (bestNeighbor) {
                const newIndex = levels.findIndex((l) => l.id === bestNeighbor!.id);
                setFocusedIndex(newIndex);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [focusedIndex, levels, onSelectLevel]);
    // -----------------------------------------------

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            <div className="relative w-[800px] h-[600px] bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-lg overflow-hidden">
                {/* Some background effects, seaweed, etc. omitted for brevity... */}

                <h1 className="relative z-10 text-3xl font-bold text-white text-center pt-6 font-pixel">
                    Underwater Adventure Map
                </h1>

                {/* Path connections (lines) */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                    {levels.map((level) =>
                        level.adjacency.map((adjIdx) => {
                            const neighbor = levels[adjIdx];
                            // only draw line one way (avoid double lines if you prefer)
                            if (neighbor.id <= level.id) return null;
                            return (
                                <motion.line
                                    key={`line-${level.id}-${neighbor.id}`}
                                    x1={level.x}
                                    y1={level.y}
                                    x2={neighbor.x}
                                    y2={neighbor.y}
                                    stroke="#2dd4bf"
                                    strokeWidth="4"
                                    strokeOpacity="0.4"
                                    strokeDasharray="8 4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                            );
                        })
                    )}
                </svg>

                {/* Level nodes */}
                {levels.map((lvl, i) => {
                    const isActive = i === focusedIndex;
                    const statusClass = lvl.locked
                        ? "bg-gray-500/20 border-gray-400/20"
                        : lvl.isCompleted
                            ? "bg-emerald-500/20 border-emerald-400/20"
                            : "bg-cyan-500/20 border-cyan-400/20";

                    return (
                        <motion.button
                            key={lvl.id}
                            className={`
                absolute flex flex-col items-center justify-center p-4
                rounded-xl backdrop-blur-md border-2 transition-all duration-300
                ${statusClass}
                ${isActive ? "ring-4 ring-yellow-300/50 scale-110 z-30" : "z-20"}
                ${lvl.locked ? "cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
              `}
                            style={{
                                width: "120px",
                                height: "120px",
                                top: lvl.y,
                                left: lvl.x,
                                transform: "translate(-50%, -50%)",
                            }}
                            onClick={() => !lvl.locked && onSelectLevel(i)}
                            onFocus={() => setFocusedIndex(i)}
                            whileHover={!lvl.locked ? { scale: 1.1 } : {}}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <span className="text-2xl mb-2">
                                {lvl.isCompleted ? "🏆" : lvl.locked ? "🔒" : "🎯"}
                            </span>
                            <span className="text-white font-medium text-sm mb-1">{lvl.name}</span>
                            <span className="text-cyan-200/70 text-xs">Level {lvl.id}</span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={onBackToModeSelect}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 backdrop-blur-sm border border-cyan-300/20"
                >
                    Back to Mode Select
                </Button>
            </div>

            {/* Instructions */}
            <div className="text-center text-cyan-200/70 text-sm">
                Use arrow keys or WASD to navigate • Press Enter to select level
            </div>
        </div>
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
                {/* Adventure */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 shadow-lg"
                >
                    <h2 className="text-2xl font-bold mb-2 text-sky-700">Adventure Mode</h2>
                    <p className="text-gray-600 mb-4">
                        Explore a multi-level undersea map with increasing difficulty
                    </p>
                    <Button
                        onClick={() => onModeSelect(GAME_MODES.ADVENTURE)}
                        className="w-full"
                    >
                        Start Adventure
                    </Button>
                </motion.div>

                {/* Challenge */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 shadow-lg"
                >
                    <h2 className="text-2xl font-bold mb-2">Challenge Mode</h2>
                    <p className="text-gray-600 mb-4">
                        Score {WINNING_SCORE} points in {INITIAL_MOVES} moves
                    </p>
                    <Button
                        onClick={() => onModeSelect(GAME_MODES.CHALLENGE)}
                        className="w-full"
                    >
                        Start Challenge
                    </Button>
                </motion.div>

                {/* Free Play */}
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
                        Dive in and collect as many sea creatures as you can!
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
    const adventureLabel =
        gameMode === GAME_MODES.ADVENTURE && currentLevelName
            ? `Playing: ${currentLevelName} (Target: ${currentTargetScore} pts)`
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

            {adventureLabel && (
                <p className="text-sm text-sky-700 mb-2">{adventureLabel}</p>
            )}

            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                {(gameMode === GAME_MODES.CHALLENGE || gameMode === GAME_MODES.ADVENTURE) && (
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
                            <span className="font-bold text-blue-600">
                                {collectedCorals[coral] || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {gameMode === GAME_MODES.CHALLENGE && (
                <p className="text-gray-600">Score {WINNING_SCORE} points to win!</p>
            )}
            {gameMode === GAME_MODES.FREE && (
                <p className="text-gray-600">
                    Match corals to collect them!<br />
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
                                    {Object.entries(CORALS.special).map(([key, coral]) => {
                                        // e.g. key = "RAINBOW", coral = "🌈"
                                        const description = powerUpDescriptions[key] ?? "A mysterious power!";

                                        return (
                                            <div
                                                key={key}
                                                className="relative flex items-center gap-2 bg-blue-50 p-2 rounded-lg
                     group hover:cursor-help"
                                            >
                                                <span className="text-2xl">{coral}</span>
                                                <span className="text-sm text-gray-600">
                                                    {/* Convert "RAINBOW" => "Rainbow" text */}
                                                    {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                                                </span>

                                                {/* The tooltip on hover */}
                                                <div
                                                    className="absolute bottom-full left-1/2 transform -translate-x-1/2
                       bg-white text-gray-800 text-xs rounded-md px-2 py-1
                       opacity-0 group-hover:opacity-100 pointer-events-none
                       transition delay-75 shadow-md"
                                                    style={{ marginBottom: "0.5rem" }}
                                                >
                                                    {description}
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                        Complete each level by reaching its target score!<br />
                                        Use <strong>W/A/S/D</strong> or <strong>Arrows</strong> to move,
                                        <strong> Enter</strong> to select a level.
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
    isAdventure?: boolean;
    onNextLevel?: () => void;
    didWinAdventureLevel?: boolean;
    onViewMap?: () => void; // new button to go back to map
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
    onViewMap,
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
                                {/* Next level if we won in adventure */}
                                {isAdventure && didWinAdventureLevel && onNextLevel && (
                                    <Button
                                        onClick={onNextLevel}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Next Level
                                    </Button>
                                )}
                                {/*
                  If in adventure mode => "View Map"
                  This will let you go back to the map after finishing or losing the level
                */}
                                {isAdventure && onViewMap && (
                                    <Button
                                        onClick={onViewMap}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View Map
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
    matchedPositions?: Set<string> | null;  // highlight
}

export const GameBoard: React.FC<GameBoardProps> = ({
    grid,
    selectedCell,
    isAnimating,
    gameOver,
    onCellClick,
    matchedPositions,
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
                            const posKey = `${rowIndex},${colIndex}`;
                            const isMatched = matchedPositions?.has(posKey);

                            return (
                                <motion.button
                                    key={posKey}
                                    onClick={() => onCellClick(rowIndex, colIndex)}
                                    disabled={isAnimating || gameOver}
                                    className={`
                    w-14 h-14 flex items-center justify-center rounded-xl text-2xl
                    transition-all duration-300
                    ${isMatched
                                            ? "bg-yellow-200 animate-pulse ring-2 ring-red-400"
                                            : isSelected
                                                ? "bg-blue-300/20 scale-110"
                                                : "bg-blue-300/5 hover:bg-blue-300/10"
                                        }
                  `}
                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                    whileTap={{ scale: 0.9, rotate: -5 }}
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