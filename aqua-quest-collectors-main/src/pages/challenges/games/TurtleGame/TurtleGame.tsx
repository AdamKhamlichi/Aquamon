// File: src/pages/TurtleGame.tsx

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import turtleImg from "@/assets/baby_turtle.png";
import trashImg from "@/assets/trash_1.png";
import backgroundImage from "@/assets/tortoise_background.jpg";
import sadTurtleImg from "@/assets/baby_turtle_sad.png";

// Import SFX assets (make sure these files exist)
import jumpSoundFile from "/sounds/jump.mp3";
import collisionSoundFile from "/sounds/collision.mp3";
import gameOverSoundFile from "/sounds/gameover.mp3";
import { supabase } from "@/integrations/supabase/client";
import { awardFishToUser } from "@/communication/awardFishToUser";
import { FishType } from "@/types/fishe-types";


const TurtleGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tortoiseYRef = useRef(200);
    const velocityRef = useRef(0);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);

    // Audio refs for SFX
    const jumpSoundRef = useRef<HTMLAudioElement>(new Audio(jumpSoundFile));
    const collisionSoundRef = useRef<HTMLAudioElement>(new Audio(collisionSoundFile));
    const gameOverSoundRef = useRef<HTMLAudioElement>(new Audio(gameOverSoundFile));


    let animationFrameId: number;
    const gravity = 0.1;
    const jumpStrength = -5;
    const swimDownStrength = 2;
    // Using a mutable array (outside state) for trash objects
    const trash: { x: number; y: number }[] = [];
    const tortoiseX = 50;
    const tortoiseWidth = 60;
    const tortoiseHeight = 40;
    const trashSize = 80;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions based on window size
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.7;

        const spawnTrash = () => {
            trash.push({ x: canvas.width, y: Math.random() * (canvas.height - trashSize) });
        };

        const checkCollision = () => {
            for (const obj of trash) {
                const adjustedTrashHeight = trashSize * 0.9;
                const upperBaseWidth = trashSize * 0.8;
                const topOffset = adjustedTrashHeight * 0.1;
                const trashCollisionX = obj.x + (trashSize - upperBaseWidth) / 2;
                const trashCollisionY = obj.y + topOffset;
                const trashCollisionWidth = upperBaseWidth;
                const trashCollisionHeight = adjustedTrashHeight - topOffset;

                if (
                    tortoiseX < trashCollisionX + trashCollisionWidth &&
                    tortoiseX + tortoiseWidth > trashCollisionX &&
                    tortoiseYRef.current < trashCollisionY + trashCollisionHeight &&
                    tortoiseYRef.current + tortoiseHeight > trashCollisionY
                ) {
                    // Play collision and game over sound effects
                    collisionSoundRef.current.play();
                    gameOverSoundRef.current.play();
                    setGameOver(true);
                    cancelAnimationFrame(animationFrameId);
                    render(); // Render the game over overlay
                    return;
                }
            }
        };

        const gameOverMessages = [
            "You're one of the 1000 turtles that die from plastic waste every year",
            "Plastic waste is deadly for marine life.",
            "Keep our oceans clean, save the turtles!",
            "Pollution is a major threat to sea creatures.",
            "Every piece of trash can be a turtle's last.",
            "Marine life is suffering due to our waste.",
            "Turtles need clean oceans to survive.",
            "Your actions can save or doom marine life.",
            "Plastic pollution is a growing problem.",
            "Help protect turtles by reducing waste."
        ];

        const update = async () => {
            if (gameOver) {
                render();
                // Draw a styled game over overlay
                const boxWidth = canvas.width * 0.8;
                const boxHeight = 100;
                const boxX = (canvas.width - boxWidth) / 2;
                const boxY = (canvas.height - boxHeight) / 2;

                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

                ctx.fillStyle = "red";
                ctx.font = "24px Arial";
                ctx.textAlign = "center";
                ctx.fillText(
                    gameOverMessages.sort(() => Math.random() - 0.5)[0],
                    canvas.width / 2,
                    canvas.height / 2 + 8
                );
                const userId = (await supabase.auth.getSession()).data.session.user.id;
                if(score > 100){
                    awardFishToUser(userId,FishType.EvolvedTurtle);
                    return;
                }
                if(score > 50){
                    awardFishToUser(userId,FishType.BabyTurtle);
                    return;
                }
                return;
            }

            // Update physics: gravity and movement
            velocityRef.current += gravity;
            tortoiseYRef.current = Math.min(
                Math.max(tortoiseYRef.current + velocityRef.current, 0),
                canvas.height - tortoiseHeight
            );

            // Move trash objects leftwards
            for (const obj of trash) {
                obj.x -= 8;
            }

            // Spawn trash if needed
            if (trash.length === 0 || trash[trash.length - 1].x < canvas.width - 100) {
                spawnTrash();
            }

            // Increase score when trash goes past the tortoise
            for (let i = trash.length - 1; i >= 0; i--) {
                if (trash[i].x + trashSize < tortoiseX) {
                    trash.splice(i, 1);
                    scoreRef.current += 1;
                    setScore(scoreRef.current);
                }
            }

            checkCollision();
            render();
            animationFrameId = requestAnimationFrame(update);
        };

        const render = () => {
            if (!ctx) return;
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background image
            const background = new Image();
            background.src = backgroundImage;
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Apply a semi-transparent overlay for mood
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the tortoise (if game is not over)
            if (!gameOver) {
                const turtleImage = new Image();
                turtleImage.src = turtleImg;
                ctx.save();
                // Flip the turtle horizontally for a natural look
                ctx.scale(-1, 1);
                ctx.drawImage(
                    turtleImage,
                    -tortoiseX - tortoiseWidth,
                    tortoiseYRef.current,
                    tortoiseWidth,
                    tortoiseHeight
                );
                ctx.restore();
            }

            // Draw each trash object with its image and a subtle outline (optional)
            for (const obj of trash) {
                const trashImage = new Image();
                trashImage.src = trashImg;
                ctx.drawImage(trashImage, obj.x, obj.y, trashSize, trashSize);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent default scrolling on arrow keys
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
            }
            if (event.key === "ArrowUp") {
                // Play jump sound on upward movement
                jumpSoundRef.current.currentTime = 0;
                jumpSoundRef.current.play();
                if (velocityRef.current > 0) {
                    velocityRef.current = 0;
                }
                velocityRef.current += jumpStrength;
            } else if (event.key === "ArrowDown") {
                if (velocityRef.current < 0) {
                    velocityRef.current = 0;
                }
                velocityRef.current += swimDownStrength;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        update();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameOver]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
            <Navigation />
            <main className="max-w-screen-xl mx-auto px-4 py-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-6">Turtle Dash</h1>
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
                    <p className="text-2xl text-white">Score: {score}</p>
                    
                    <Button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg"
                    >
                        Restart Game
                    </Button>
                    
                </div>
                <div className="mt-8 relative flex justify-center">
                    <canvas
                        ref={canvasRef}
                        className="rounded-lg shadow-2xl border border-gray-300"
                    /><img
                        src={gameOver ? sadTurtleImg : turtleImg}
                        alt="Turtle"
                        className="w-40 h-40 absolute right-4 top-4"
                    />
                    {/* Optionally overlay a turtle image outside of the canvas */}
                    
                </div>
            </main>
        </div>
    );
};

export default TurtleGame;
