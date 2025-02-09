import React, { useState, useEffect, useCallback } from 'react';
import playerImage from './assets/player.png'
import enemyImage from './assets/plasticbag.png'
import backgroundImage from './assets/background.jpg'
import shootSound from './assets/shoot.mp3'
import {supabase} from "@/integrations/supabase/client.ts";
import {awardFishToUser} from "@/communication/awardFishToUser.ts";
import {FishType} from "@/types/fishe-types.ts";


const SharpshooterGame = async () => {
    // Game state
    const [playerHealth, setPlayerHealth] = useState(100);
    const [win, setWin] = useState(false); // New state for win condition
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [enemies, setEnemies] = useState([]);
    const [bullets, setBullets] = useState([]);
    const [isMoving, setIsMoving] = useState(false);
    const [canShoot, setCanShoot] = useState(true);
    const [facingLeft, setFacingLeft] = useState(false);
    const [audio] = useState(new Audio(shootSound));
    // Player position and movement state
    const [playerPos, setPlayerPos] = useState({x: window.innerWidth / 2, y: window.innerHeight / 2});
    const [keysPressed, setKeysPressed] = useState({});

    // Constants
    const PLAYER_SPEED = 2;
    const ENEMY_SPEED = 5;
    const BULLET_SPEED = 3;
    const PLAYER_SIZE = 120;
    const ENEMY_SIZE = 100;
    const BULLET_SIZE = 5;
    const SHOOT_COOLDOWN = 1000;

    // Find closest enemy
    const findClosestEnemy = useCallback(() => {
        if (enemies.length === 0) return null;

        return enemies.reduce((closest, enemy) => {
            const dx = enemy.x - playerPos.x;
            const dy = enemy.y - playerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!closest || distance < closest.distance) {
                return {...enemy, distance};
            }
            return closest;
        }, null);
    }, [enemies, playerPos]);

    // Handle shooting
    const handleShoot = useCallback(() => {
        if (gameOver || isMoving || !canShoot || win) return;

        const closestEnemy = findClosestEnemy();
        if (!closestEnemy) return;

        // Play sound effect
        audio.currentTime = 0; // Reset sound to start
        audio.play().catch(error => console.log('Audio play failed:', error));

        // Calculate bullet direction towards closest enemy
        const angle = Math.atan2(closestEnemy.y - playerPos.y, closestEnemy.x - playerPos.x);
        const velocity = {
            x: Math.cos(angle) * BULLET_SPEED,
            y: Math.sin(angle) * BULLET_SPEED
        };

        setBullets(prev => [...prev, {
            x: playerPos.x,
            y: playerPos.y,
            velocity
        }]);

        // Set cooldown
        setCanShoot(false);
        setTimeout(() => setCanShoot(true), SHOOT_COOLDOWN);
    }, [playerPos, gameOver, isMoving, canShoot, findClosestEnemy, audio]);

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            setKeysPressed(prev => ({...prev, [e.key]: true}));
        };

        const handleKeyUp = (e) => {
            setKeysPressed(prev => ({...prev, [e.key]: false}));
        };

        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleShoot();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keypress', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, [handleShoot]);

    // Spawn enemies
    useEffect(() => {
        if (gameOver || win) return;

        const spawnEnemy = () => {
            const side = Math.floor(Math.random() * 4);
            let x, y;

            switch (side) {
                case 0: // top
                    x = Math.random() * window.innerWidth;
                    y = -ENEMY_SIZE;
                    break;
                case 1: // right
                    x = window.innerWidth + ENEMY_SIZE;
                    y = Math.random() * window.innerHeight;
                    break;
                case 2: // bottom
                    x = Math.random() * window.innerWidth;
                    y = window.innerHeight + ENEMY_SIZE;
                    break;
                default: // left
                    x = -ENEMY_SIZE;
                    y = Math.random() * window.innerHeight;
            }

            setEnemies(prev => [...prev, {x, y}]);
        };

        const enemyInterval = setInterval(spawnEnemy, 1500);
        return () => clearInterval(enemyInterval);
    }, [gameOver]);

    // Game loop
    useEffect(() => {
        if (gameOver || win) return;

        const gameLoop = () => {
            // Update player position based on keyboard input
            let moving = false;
            setPlayerPos(prev => {
                let newX = prev.x;
                let newY = prev.y;

                if (keysPressed.ArrowLeft || keysPressed.a) {
                    newX -= PLAYER_SPEED;
                    moving = true;
                    setFacingLeft(true);
                }
                if (keysPressed.ArrowRight || keysPressed.d) {
                    newX += PLAYER_SPEED;
                    moving = true;
                    setFacingLeft(false);
                }
                if (keysPressed.ArrowUp || keysPressed.w) {
                    newY -= PLAYER_SPEED;
                    moving = true;
                }
                if (keysPressed.ArrowDown || keysPressed.s) {
                    newY += PLAYER_SPEED;
                    moving = true;
                }

                // Keep player within bounds
                newX = Math.max(PLAYER_SIZE / 2, Math.min(window.innerWidth - PLAYER_SIZE / 2, newX));
                newY = Math.max(PLAYER_SIZE / 2, Math.min(window.innerHeight - PLAYER_SIZE / 2, newY));

                return {x: newX, y: newY};
            });
            setIsMoving(moving);
            moving

            // Update enemy positions
            setEnemies(prev => prev.map(enemy => {
                const angle = Math.atan2(playerPos.y - enemy.y, playerPos.x - enemy.x);
                return {
                    x: enemy.x + Math.cos(angle) * ENEMY_SPEED,
                    y: enemy.y + Math.sin(angle) * ENEMY_SPEED
                };
            }));

            // Update bullet positions
            setBullets(prev => prev.map(bullet => ({
                ...bullet,
                x: bullet.x + bullet.velocity.x,
                y: bullet.y + bullet.velocity.y
            })).filter(bullet =>
                bullet.x > 0 &&
                bullet.x < window.innerWidth &&
                bullet.y > 0 &&
                bullet.y < window.innerHeight
            ));

            // Check collisions
            setEnemies(prev => {
                let newEnemies = [...prev];

                // Bullet-enemy collisions
                bullets.forEach(bullet => {
                    newEnemies = newEnemies.filter(enemy => {
                        const dx = bullet.x - enemy.x;
                        const dy = bullet.y - enemy.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < ENEMY_SIZE / 2 + BULLET_SIZE / 2) {
                            setScore(s => {
                                const newScore = s + 10;
                                if (newScore >= 200) setWin(true);
                                return newScore;
                            });
                            return false;
                        }
                        return true;
                    });
                });

                // Enemy-player collisions
                newEnemies.forEach(enemy => {
                    const dx = playerPos.x - enemy.x;
                    const dy = playerPos.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < PLAYER_SIZE / 2 + ENEMY_SIZE / 2) {
                        setPlayerHealth(prev => {
                            const newHealth = prev - 10;
                            if (newHealth <= 0) setGameOver(true);
                            return newHealth;
                        });
                    }
                });

                return newEnemies;
            });
        };

        const gameInterval = setInterval(gameLoop, 16);
        return () => clearInterval(gameInterval);
    }, [playerPos, bullets, gameOver, keysPressed]);

    if (win) {
        const userId = (await supabase.auth.getSession()).data.session.user.id;
        if (score >= 200) {
            awardFishToUser(userId, FishType.AdultHammerheadShark);
        }
        if (score > 50) {
            awardFishToUser(userId, FishType.BabyHammerheadShark);
        }
    }
    return (
        <div
            className="relative w-full h-screen overflow-hidden"
            style={{
                backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Score and Health */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
                <div>Health: {playerHealth}</div>
                <div>Score: {score}</div>
                <div className="mt-2 text-sm">
                    {isMoving ? "Moving (can't shoot)" : canShoot ? "Stopped (press SPACE to shoot)" : "Reloading..."}
                </div>
            </div>
            {/* Win Screen */}
            {win && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                        <h2 className="text-4xl mb-4">YOU WIN!</h2>
                        <p className="text-xl">Final Score: {score}</p>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                            onClick={() => window.location.reload()}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                        <h2 className="text-4xl mb-4">Game Over</h2>
                        <p className="text-xl">Final Score: {score}</p>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                            onClick={() => window.location.reload()}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Player */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                    left: playerPos.x,
                    top: playerPos.y,
                    width: PLAYER_SIZE,
                    height: PLAYER_SIZE,
                    backgroundImage: `url(${playerImage})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: isMoving ? 0.7 : 1,
                    transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`
                }}
            />

            {/* Enemies */}
            {enemies.map((enemy, index) => (
                <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: enemy.x,
                        top: enemy.y,
                        width: ENEMY_SIZE,
                        height: ENEMY_SIZE,
                        backgroundImage: `url(${enemyImage})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            ))}

            {/* Bullets */}
            {bullets.map((bullet, index) => (
                <div
                    key={index}
                    className="absolute w-2 h-2 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    style={{left: bullet.x, top: bullet.y}}
                />
            ))}
        </div>
    );
};

export default SharpshooterGame;