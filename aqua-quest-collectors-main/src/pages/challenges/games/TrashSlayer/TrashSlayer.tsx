import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { awardFishToUser } from '@/communication/awardFishToUser';
import {supabase} from "@/integrations/supabase/client.ts";
import {FishType} from "@/types/fishe-types.ts";

// Constants
const TRASH_TYPES = ['plastic', 'nets', 'bottle', 'bag'];
const SEA_CREATURES = ['fish', 'crab', 'turtle'];
const INITIAL_SPAWN_INTERVAL = 2000;
const MIN_SPAWN_INTERVAL = 800;
const SPAWN_TIME_VARIATION = 500;
const INITIAL_MAX_OBJECTS = 4;
const MAX_OBJECTS_INCREASE_INTERVAL = 15000;
const INITIAL_FISH_RATIO = 0.3;
const RATIO_INCREASE = 0.05;
const MAX_FISH_RATIO = 0.5;
const ABSOLUTE_MAX_OBJECTS = 12;
const INITIAL_GAME_DURATION = 30;
const GRAVITY = 0.08;
const TIME_BONUS_ON_TRASH = 1;
const MAX_DIFFICULTY_TIME = 90;
const DIFFICULTY_INCREASE_RATE = 0.3;
const INITIAL_VELOCITY = -8;

const getHighScore = () => {
    const saved = localStorage.getItem('trashSlasher_highScore');
    return saved ? parseInt(saved) : 0;
};

// Types
interface GameObject {
    id: number;
    x: number;
    y: number;
    rotation: number;
    velocityX: number;
    velocityY: number;
    type: typeof TRASH_TYPES[number] | typeof SEA_CREATURES[number];
    sliced: boolean;
    sliceAngle?: number;
    scale?: number;
}

interface Point {
    x: number;
    y: number;
}

const TrashSlasher = () => {
    const [gameActive, setGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_GAME_DURATION);
    const [objects, setObjects] = useState<GameObject[]>([]);
    const [mouseTrail, setMouseTrail] = useState<Point[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [maxObjects, setMaxObjects] = useState(INITIAL_MAX_OBJECTS);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [spawnInterval, setSpawnInterval] = useState(INITIAL_SPAWN_INTERVAL);
    const [lastSliceTime, setLastSliceTime] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [highScore, setHighScore] = useState(getHighScore());

    const canvasRef = useRef<HTMLDivElement>(null);

    const startGame = () => {
        setGameActive(true);
        setScore(0);
        setTimeLeft(INITIAL_GAME_DURATION);
        setObjects([]);
        setDifficultyLevel(1);
        setSpawnInterval(INITIAL_SPAWN_INTERVAL);
        setMaxObjects(INITIAL_MAX_OBJECTS);
        setLastSliceTime(0);
        setComboCount(0);
    };

    const spawnObject = () => {
        if (!gameActive) return;
        if (objects.length >= maxObjects) return;

        const containerRect = canvasRef.current?.getBoundingClientRect() ||
            { width: window.innerWidth, height: window.innerHeight };

        const isTrash = Math.random() > INITIAL_FISH_RATIO;
        const newObject: GameObject = {
            id: Date.now() + Math.random(),
            x: Math.random() * (containerRect.width - 100),
            y: containerRect.height,
            rotation: Math.random() * 360,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: INITIAL_VELOCITY - Math.random() * 3,
            type: isTrash
                ? TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)]
                : SEA_CREATURES[Math.floor(Math.random() * SEA_CREATURES.length)],
            sliced: false,
            scale: containerRect.width / 800
        };

        setObjects(prev => [...prev, newObject]);
    };

    const updatePositions = () => {
        setObjects(prev =>
            prev.map(item => ({
                ...item,
                x: item.x + item.velocityX,
                y: item.y + item.velocityY,
                velocityY: item.velocityY + GRAVITY,
                rotation: item.rotation + 2
            })).filter(item => item.y < window.innerHeight + 100)
        );
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!gameActive) return;

        const newPoint = { x: e.clientX, y: e.clientY };
        setMouseTrail(prev => [...prev.slice(-10), newPoint]);

        setObjects(prev =>
            prev.map(item => {
                if (!item.sliced &&
                    Math.abs(e.clientX - item.x) < 50 &&
                    Math.abs(e.clientY - item.y) < 50) {

                    if (SEA_CREATURES.includes(item.type)) {
                        setGameActive(false);
                        toast.error(`Game Over! You hit a ${item.type}!`);
                        return item;
                    }


                    setTimeLeft(time => Math.min(time + TIME_BONUS_ON_TRASH, INITIAL_GAME_DURATION));
                    setScore(s => {
                        const newScore = s + 10;
                        if (newScore > highScore) {
                            setHighScore(newScore);
                            localStorage.setItem('trashSlasher_highScore', newScore.toString());
                        }
                        return newScore;
                    });
                    return { ...item, sliced: true };
                }
                return item;
            })
        );
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    // Timer Effect
    useEffect(() => {
        if (!gameActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameActive]);

    // Game Loop Effect
    useEffect(() => {
        if (!gameActive) return;

        const spawnTimer = setInterval(spawnObject, spawnInterval);
        const updateTimer = setInterval(updatePositions, 16);

        return () => {
            clearInterval(spawnTimer);
            clearInterval(updateTimer);
        };
    }, [gameActive, spawnInterval]);

    // Difficulty Effect
    useEffect(() => {
        if (!gameActive) return;

        const difficultyInterval = setInterval(() => {
            const timeElapsed = INITIAL_GAME_DURATION - timeLeft;
            const newDifficulty = Math.min(
                1 + (timeElapsed * DIFFICULTY_INCREASE_RATE),
                MAX_DIFFICULTY_TIME
            );

            setDifficultyLevel(newDifficulty);
            setSpawnInterval(prev => Math.max(prev * 0.93, MIN_SPAWN_INTERVAL));
            const newFishRatio = Math.min(
                INITIAL_FISH_RATIO + (timeElapsed * 0.005),
                MAX_FISH_RATIO
            );
            setMaxObjects(Math.min(INITIAL_MAX_OBJECTS + Math.floor(timeElapsed / 15), ABSOLUTE_MAX_OBJECTS));
        }, 1000);

        return () => clearInterval(difficultyInterval);
    }, [gameActive, timeLeft]);

    return (
        <div className="min-h-screen bg-transparent">
            <Navigation />
            <div className="h-[90vh] w-full flex flex-col">
                <div className="text-center mb-2 flex-shrink-0">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-white"
                    >
                        Ocean Cleanup Challenge
                    </motion.h1>
                </div>

                <div
                    ref={canvasRef}
                    className="relative flex-1 w-full glass rounded-lg overflow-hidden cursor-none"
                    onMouseMove={handleMouseMove}
                    onContextMenu={handleContextMenu}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 px-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2">
                                <span className="font-pixel">Score: {score}</span>
                            </div>
                            <div className="bg-yellow-400/80 backdrop-blur-sm rounded-full px-4 py-2">
                                <span className="font-pixel">Best: {highScore}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32">
                                <Progress value={(timeLeft / INITIAL_GAME_DURATION) * 100} className="h-3" />
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="font-pixel">{timeLeft}s</span>
                            </div>
                        </div>
                    </motion.div>

                    {objects.map(item => (
                        <motion.div
                            key={item.id}
                            className={`absolute ${typeof item.type === 'string' && SEA_CREATURES.includes(item.type) ? 'border-4 border-red-500/70 rounded-full p-2' : ''}`}
                            style={{
                                left: item.x,
                                top: item.y,
                                rotate: item.rotation,
                                transformOrigin: 'center',
                                scale: item.scale || 1.5,
                                backdropFilter: typeof item.type === 'string' && SEA_CREATURES.includes(item.type) ? 'blur(4px)' : 'none'
                            }}
                            animate={{
                                scale: item.sliced ? [item.scale || 1.5, 0] : item.scale || 1.5,
                                opacity: item.sliced ? [1, 0] : 1,
                                rotate: item.sliced ? [item.rotation, item.rotation + (item.sliceAngle || 0)] : item.rotation
                            }}
                            transition={{
                                duration: item.sliced ? 0.5 : 0,
                                ease: "easeOut"
                            }}
                        >
              <span className="text-6xl">
                {item.type === 'plastic' && '🥤'}
                  {item.type === 'nets' && '🕸️'}
                  {item.type === 'bottle' && '🍾'}
                  {item.type === 'bag' && '🛍️'}
                  {item.type === 'fish' && '🐠'}
                  {item.type === 'crab' && '🦀'}
                  {item.type === 'turtle' && '🐢'}
              </span>
                        </motion.div>
                    ))}

                    {mouseTrail.map((point, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-blue-400 rounded-full pointer-events-none"
                            style={{
                                left: point.x,
                                top: point.y,
                                opacity: i / mouseTrail.length
                            }}
                        />
                    ))}

                    {!gameActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                            <div className="text-center text-white mb-6">
                                <h2 className="text-3xl font-pixel mb-2">
                                    {score > 0 ? 'Game Over!' : 'Ready?'}
                                </h2>
                                {score > 0 && (
                                    <p className="font-pixel mb-2">Final Score: {score}</p>
                                )}
                            </div>
                            <Button
                                onClick={async () => {
                                    // Award fish based on score before starting a new game
                                    const session = await supabase.auth.getSession();
                                    const userId = session.data.session?.user.id;

                                    if (userId) {
                                        if (score > 200) {
                                            await awardFishToUser(userId, FishType.EvolvedBabyWhale);
                                        } else if (score > 50) {
                                            await awardFishToUser(userId, FishType.BabyWhale);
                                        }
                                    }

                                    // Start a new game
                                    startGame();
                                }}
                                className="text-xl px-8 py-4 font-pixel"
                            >
                                {score > 0 ? 'Play Again' : 'Start Cleaning!'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrashSlasher;