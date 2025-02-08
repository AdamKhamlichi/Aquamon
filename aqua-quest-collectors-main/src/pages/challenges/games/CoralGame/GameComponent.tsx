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
} from "./constant";

/* -------------------------------------------------------------------------- */
/*                                 LEVEL TYPE                                 */
/* -------------------------------------------------------------------------- */

/**
 * For Adventure Mode, each level has:
 *  - id, name, difficulty, moves, targetScore
 *  - isCompleted, locked
 *  - x, y => position on the map
 *  - adjacency => array of level indices that are connected to this node
 */
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
    adjacency: number[]; // <--- new: indexes of neighboring levels
}

/* -------------------------------------------------------------------------- */
/*                           ADVENTURE MAP (UPDATED)                          */
/* -------------------------------------------------------------------------- */

interface AdventureMapProps {
    levels: Level[];
    onSelectLevel: (index: number) => void;
}

/**
 * A more interactive map:
 * 1) You can click on a node to select it.
 * 2) You can move a "focus" cursor with W/A/S/D or arrow keys among connected nodes.
 * 3) Press Enter/Space to select the currently focused node.
 */
export const AdventureMap: React.FC<AdventureMapProps> = ({
    levels,
    onSelectLevel,
}) => {
    // Refs for hover/click sounds
    const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
    const selectSoundRef = useRef<HTMLAudioElement | null>(null);

    // The index of the node we're currently "focused" on for keyboard nav
    const [focusedIndex, setFocusedIndex] = useState<number | null>(() => {
        // Focus on the first unlocked node by default
        const firstUnlocked = levels.findIndex((lvl) => !lvl.locked);
        return firstUnlocked === -1 ? null : firstUnlocked;
    });

    useEffect(() => {
        hoverSoundRef.current = new Audio("/sounds/mapHover.mp3");
        selectSoundRef.current = new Audio("/sounds/mapSelect.mp3");

        if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.5;
        if (selectSoundRef.current) selectSoundRef.current.volume = 0.5;
    }, []);

    /**
     * Keydown listener:
     *  - Move focus with W/A/S/D or arrow keys
     *  - Press Enter/Space => select the focused level
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (focusedIndex === null) return;

            // Simple helper for checking key codes
            const code = e.code.toLowerCase(); // e.g. "arrowup", "keyw"

            if (["arrowup", "keyw"].includes(code)) {
                moveFocus("up");
            } else if (["arrowdown", "keys"].includes(code)) {
                moveFocus("down");
            } else if (["arrowleft", "keya"].includes(code)) {
                moveFocus("left");
            } else if (["arrowright", "keyd"].includes(code)) {
                moveFocus("right");
            } else if (["enter", "space"].includes(code)) {
                // If the level is not locked => select it
                const lvl = levels[focusedIndex];
                if (!lvl.locked) {
                    selectSoundRef.current?.play().catch(() => { });
                    onSelectLevel(focusedIndex);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [focusedIndex, levels, onSelectLevel]);

    /**
     * Move the focus to the neighbor that is *closest* in the given direction.
     * We'll examine all adjacency indexes, see if they're to the "left/up/down/right"
     * of the current node, then pick the one that is closest by straight-line distance.
     * If none is in that direction, do nothing.
     */
    function moveFocus(direction: "up" | "down" | "left" | "right") {
        if (focusedIndex === null) return;

        const current = levels[focusedIndex];
        const neighbors = current.adjacency.map((i) => levels[i]); // actual neighbor data

        // We'll define an arrow vector for each direction
        let dx = 0;
        let dy = 0;
        if (direction === "up") dy = -1;
        if (direction === "down") dy = +1;
        if (direction === "left") dx = -1;
        if (direction === "right") dx = +1;

        // Among neighbors, find the one with the largest "dot product" in that direction
        // but also we want to confirm that it's "strictly" in that direction
        // (e.g. x must be greater if pressing right, etc.)
        let bestIndex: number | null = null;
        let bestScore = -Infinity;

        neighbors.forEach((nbr) => {
            // Vector from current -> neighbor
            const vx = nbr.x - current.x;
            const vy = nbr.y - current.y;

            // If we want to ensure it's strictly in that direction,
            // e.g. pressing right => vx>0
            // pressing up => vy<0
            // We'll do a sign check:
            if (direction === "up" && vy >= 0) return;   // must be above
            if (direction === "down" && vy <= 0) return; // must be below
            if (direction === "left" && vx >= 0) return; // must be left
            if (direction === "right" && vx <= 0) return;// must be right

            // Dot product with our direction vector (dx, dy)
            // normalized direction vector is just (dx,dy)
            // but let's not overcomplicate: we can do (vx * dx + vy * dy)
            const dot = vx * dx + vy * dy;

            // We want to pick the neighbor with the biggest dot in that direction
            // i.e. the most "forward" in that direction
            if (dot > bestScore) {
                bestScore = dot;
                bestIndex = nbr.id; // store neighbor's ID or we can store the array index
            }
        });

        // Now we have bestIndex => that's the neighbor's "id"
        // but we need to map it back to the array index
        if (bestIndex !== null) {
            const neighborIdx = levels.findIndex((l) => l.id === bestIndex);
            if (neighborIdx !== -1) {
                // play hover sound
                hoverSoundRef.current?.play().catch(() => { });
                setFocusedIndex(neighborIdx);
            }
        }
    }

    /**
     * If the user *clicks* on a node with the mouse
     * => we set the "focus" to that node & potentially select if unlocked.
     */
    const handleNodeClick = (index: number) => {
        // Focus that node first
        setFocusedIndex(index);

        // If not locked, also attempt to select it
        const lvl = levels[index];
        if (!lvl.locked) {
            selectSoundRef.current?.play().catch(() => { });
            onSelectLevel(index);
        }
    };

    return (
        <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-blue-100 to-sky-200 p-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-pixel animate-float text-center">
                Adventure Mode
            </h1>
            <p className="text-center text-gray-600 mb-4">
                Use <strong>W/A/S/D</strong> or <strong>Arrows</strong> to move between levels,
                then press <strong>Enter</strong> to select!
            </p>

            {/* Lines connecting levels */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {levels.map((level, i) => {
                    return level.adjacency.map((adjIdx) => {
                        const neighbor = levels[adjIdx];
                        // We only want to draw each connection once.
                        // A simple approach: only draw a line if neighbor.id > level.id or i<adjIdx etc.
                        if (neighbor.id < level.id) return null;

                        return (
                            <line
                                key={`line-${level.id}-${neighbor.id}`}
                                x1={level.x}
                                y1={level.y}
                                x2={neighbor.x}
                                y2={neighbor.y}
                                stroke="#1e3a8a"
                                strokeWidth="3"
                                strokeOpacity="0.4"
                                strokeLinecap="round"
                            />
                        );
                    });
                })}
            </svg>

            {/* Level nodes */}
            {levels.map((lvl, i) => {
                let nodeClasses = "bg-blue-300";
                let label = "";

                if (lvl.locked) {
                    nodeClasses = "bg-gray-400 opacity-70";
                    label = "LOCKED";
                } else if (lvl.isCompleted) {
                    nodeClasses = "bg-green-300";
                    label = "DONE";
                }

                // If this node is currently "focused", we highlight it further
                const isFocused = i === focusedIndex;

                return (
                    <motion.button
                        key={lvl.id}
                        className={`
              absolute flex items-center justify-center rounded-full
              w-14 h-14 text-sm font-bold text-gray-800 border-2 border-white shadow-lg
              ${nodeClasses}
              ${isFocused ? "ring-4 ring-yellow-300 z-10" : ""}
            `}
                        style={{
                            top: lvl.y,
                            left: lvl.x,
                            transform: "translate(-50%, -50%)",
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => hoverSoundRef.current?.play().catch(() => { })}
                        onClick={() => handleNodeClick(i)}
                        disabled={!!lvl.locked}
                    >
                        {lvl.name.slice(0, 1).toUpperCase()}
                        {label && (
                            <span className="text-[10px] absolute bottom-[-12px] left-0 right-0 text-center text-gray-700">
                                {label}
                            </span>
                        )}
                    </motion.button>
                );
            })}
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
                    <Button
                        onClick={() => onModeSelect(GAME_MODES.CHALLENGE)}
                        className="w-full"
                    >
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
                        Dive in and collect as many sea creatures as possible! Adjust difficulty:
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
            ? `Playing: ${currentLevelName} (Target Score: ${currentTargetScore})`
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
                <p className="text-gray-600">
                    Score {WINNING_SCORE} points to win!
                </p>
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
                                            <span className="text-2xl">{coral as string}</span>
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
                                        Complete each level by reaching its target score
                                        within the allotted moves!
                                        <br />
                                        <strong>Use W/A/S/D or Arrow keys to navigate the map!</strong>
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
                                {/* If in adventure mode & user won => show next level */}
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
