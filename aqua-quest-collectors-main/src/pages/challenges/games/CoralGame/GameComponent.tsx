// GameComponents.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Timer, Shell } from 'lucide-react';
import {
    GAME_MODES,
    GameMode,
    WINNING_SCORE,
    INITIAL_MOVES,
    CORALS,
} from './constant';

/* -------------------------------------------------------------------------- */
/*                               MODE SELECTION                               */
/* -------------------------------------------------------------------------- */
interface ModeSelectionProps {
    onModeSelect: (mode: GameMode) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 font-pixel animate-float">
                Select Game Mode
            </h1>
            <div className="grid gap-6 max-w-md mx-auto">
                {/* Challenge Mode */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 shadow-lg"
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
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 shadow-lg"
                >
                    <h2 className="text-2xl font-bold mb-2">Free Play Mode</h2>
                    <p className="text-gray-600 mb-4">
                        Collect as many sea creatures as you can!
                    </p>
                    <Button
                        onClick={() => onModeSelect(GAME_MODES.FREE)}
                        className="w-full"
                        variant="outline"
                    >
                        Start Free Play
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                                 STATS BOARD                                */
/* -------------------------------------------------------------------------- */
interface StatsBoardProps {
    gameMode: GameMode;
    score: number;
    moves: number;        // can be Infinity as well, but typed as number for simplicity
    totalCollected: number;
    collectedCorals: Record<string, number>;
}

export const StatsBoard: React.FC<StatsBoardProps> = ({
    gameMode,
    score,
    moves,
    totalCollected,
    collectedCorals,
}) => {
    return (
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-pixel animate-float">
                {gameMode === GAME_MODES.CHALLENGE ? 'Challenge Mode' : 'Free Play'}
            </h1>

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
                        <div key={coral} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="text-2xl">{coral}</span>
                            <span className="font-bold text-blue-600">{collectedCorals[coral] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Depending on the mode */}
            {gameMode === GAME_MODES.CHALLENGE ? (
                <p className="text-gray-600">Score {WINNING_SCORE} points to win!</p>
            ) : (
                <p className="text-gray-600">Match corals to collect them!</p>
            )}
        </div>
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
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
    show,
    score,
    totalCollected,
    collectedCorals,
    onPlayAgain,
    onChangeMode,
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
                            {score >= WINNING_SCORE ? 'Victory! 🎉' : 'Game Over'}
                        </h2>
                        <div className="space-y-4">
                            <p className="text-xl">Final Score: {score}</p>
                            <p className="text-lg">Corals Collected: {totalCollected}</p>
                            <div className="grid grid-cols-3 gap-2 my-4">
                                {CORALS.regular.map((coral) => (
                                    <div key={coral} className="text-center p-2 bg-blue-50 rounded-lg">
                                        <div className="text-2xl mb-1">{coral}</div>
                                        <div className="font-bold text-blue-600">
                                            {collectedCorals[coral] || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Button onClick={onPlayAgain} className="w-full">
                                    Play Again
                                </Button>
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
        <div className="flex justify-center">
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
                                    className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl
                    ${isSelected
                                            ? 'bg-blue-300/20 scale-110'
                                            : 'bg-blue-300/5 hover:bg-blue-300/10'
                                        }
                    transition-all duration-300
                  `}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    layout
                                >
                                    <motion.span
                                        className="pointer-events-none"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        {cell}
                                    </motion.span>
                                </motion.button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
