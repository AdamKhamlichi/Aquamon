import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import turtleImg from "@/assets/baby_turtle.png";
import trashImg from "@/assets/trash_1.png";
import backgroundImage from "@/assets/tortoise_background.jpg";
import sadTurtleImg from '@/assets/baby_turtle_sad.png';

const TortoiseGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tortoiseYRef = useRef(200);
    const velocityRef = useRef(0);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);

    let animationFrameId: number;
    const gravity = 0.1;
    const jumpStrength = -5;
    const swimDownStrength = 2;
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
                    setGameOver(true);
                    cancelAnimationFrame(animationFrameId);
                    render(); // Render the game over screen
                    return;
                }
            }
        };

        const update = () => {
            if (gameOver) {

                render();
                // Draw white box for game over message
                const boxWidth = canvas.width * 0.8;
                const boxHeight = 100;
                const boxX = (canvas.width - boxWidth) / 2;
                const boxY = (canvas.height - boxHeight) / 2;

                ctx.fillStyle = "white";
                ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

                // Draw game over message
                ctx.fillStyle = "red";
                ctx.font = "36px Arial";
                ctx.textAlign = "center";
                ctx.fillText(
                    "You're one of the 1000 turtles that die from plastic waste every year",
                    canvas.width / 2,
                    canvas.height / 2 + 12 // Adjusted to center text within the box
                );

                return;
            }

            velocityRef.current += gravity;
            tortoiseYRef.current = Math.min(
                Math.max(tortoiseYRef.current + velocityRef.current, 0),
                canvas.height - tortoiseHeight
            );

            for (const obj of trash) {
                obj.x -= 8;
            }

            if (trash.length === 0 || trash[trash.length - 1].x < canvas.width - 100) {
                spawnTrash();
            }

            // Increase score when trash goes behind the tortoise
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

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            const background = new Image();
            background.src = backgroundImage;
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Overlay semi-transparent black
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw tortoise
            if(!gameOver){// ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
                ctx.beginPath();
                ctx.ellipse(
                    tortoiseX + tortoiseWidth / 2,
                    tortoiseYRef.current + tortoiseHeight / 2,
                    tortoiseWidth / 2,
                    tortoiseHeight / 2,
                    0,
                    0,
                    Math.PI * 2
                );
                // ctx.fill();
                

                const turtleImage = new Image();
                turtleImage.src = turtleImg;
                ctx.save();
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

            // Draw trash
            for (const obj of trash) {
                const trashImage = new Image();
                trashImage.src = trashImg;
                ctx.drawImage(trashImage, obj.x, obj.y, trashSize, trashSize);

                // ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                const adjustedTrashHeight = trashSize * 0.9;
                const upperBaseWidth = trashSize * 0.8;
                const topOffset = adjustedTrashHeight * 0.1;
                ctx.beginPath();
                ctx.moveTo(obj.x + (trashSize - upperBaseWidth) / 2, obj.y + topOffset);
                ctx.lineTo(obj.x + (trashSize + upperBaseWidth) / 2, obj.y + topOffset);
                ctx.lineTo(obj.x + trashSize - 20, obj.y + adjustedTrashHeight);
                ctx.lineTo(obj.x + 20, obj.y + adjustedTrashHeight);
                ctx.closePath();
                // ctx.fill();
            }

            // Draw game over message
            
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
            }
            if (event.key === "ArrowUp") {
                if(velocityRef.current > 0){
                    velocityRef.current =0;
                }
                velocityRef.current += jumpStrength;
            } else if (event.key === "ArrowDown") {
                if(velocityRef.current < 0){
                    velocityRef.current =0;
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
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
            <Navigation />
            <main className="max-w-screen-xl mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tortoise Survival</h1>
            <div className="flex justify-center items-center space-x-4">
                <p className="text-xl font-semibold text-gray-700">Score: {score}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                Restart Game
                </Button>
            </div>
            <div className="flex justify-center items-center mt-4">
                <canvas ref={canvasRef} className="border border-black w-[75vw] h-[70vh]" />
                <img src={gameOver ? sadTurtleImg : turtleImg} alt="Turtle" className="w-40 h-40 ml-4" />
            </div>
            </main>
        </div>
    );
};

export default TortoiseGame;
