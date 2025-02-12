// File: src/pages/Challenges/ChallengeComponents.tsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useInteractionSound } from '@/hooks/use-interaction-sound';

// Import games
const CoralGame = React.lazy(() => import('./games/CoralGame/CoralGame'));
const PlasticGame = React.lazy(() => import('./games/PlasticHunter/PlasticHunter'));


const ChallengeWrapper = () => {
    const { challengeId } = useParams();
    const navigate = useNavigate();

    const challenges = {
        'coral-restoration': {
            title: "Coral Restoration",
            description: "Help rebuild pixel coral reefs",
            component: CoralGame,
            difficulty: "Hard",
            reward: "Legendary Pixel Shark"
        },
        'plastic-hunter': {
            title: "Plastic Hunter",
            description: "Help clean up the plastic from the ocean",
            component: PlasticGame,
            difficulty: "Medium",
            reward: "Pixel HammerHead"
        }
    };

    const challenge = challenges[challengeId];

    if (!challenge) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
                <Navigation />
                <div className="max-w-screen-xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Challenge Not Found</h1>
                    <Button onClick={() => navigate('/challenges')}>Back to Challenges</Button>
                </div>
            </div>
        );
    }

    const ChallengeComponent = challenge.component;

    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
                <Navigation />
                <div className="max-w-screen-xl mx-auto px-4 py-8 text-center">
                    <p className="text-xl">Loading challenge...</p>
                </div>
            </div>
        }>
            <ChallengeComponent />
        </React.Suspense>
    );
};

const ChallengesList = () => {
    const navigate = useNavigate();
    const { handlers } = useInteractionSound();

    const challenges = [
        {
            id: 'coral-restoration',
            title: "Coral Restoration",
            description: "Help rebuild pixel coral reefs",
            reward: "Legendary Pixel Shark",
            difficulty: "Hard",
        },
        {
            id: 'plastic-hunter',
            title: "Plastic Hunter",
            description: "Help clean up the plastic from the ocean",
            reward: "Pixel HammerHead",
            difficulty: "Medium",
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
            <Navigation />

            <main className="max-w-screen-xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 font-pixel animate-float">
                        Ocean Challenges
                    </h1>
                    <p className="text-gray-600">Complete challenges to collect rare sea creatures</p>
                </div>

                <div className="grid gap-6">
                    {challenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            {...handlers}
                            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold">{challenge.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${challenge.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                    challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {challenge.difficulty}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{challenge.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-primary">Reward: {challenge.reward}</span>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                                >
                                    Start Challenge
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export { ChallengeWrapper, ChallengesList };



//
// if (hasMatches) {
//     // Clear matches and update score
//     const newGrid = [...currentGrid];
//     matchPositions.forEach((pos) => {
//         const [row, col] = (pos as string).split(',').map(Number);
//         newGrid[row][col] = null;
//     });

//     setScore((prev) => prev + matchPositions.size * POINTS_PER_MATCH);
//     setCombo((prev) => prev + 1);
//     setGrid(newGrid);

//     // Trigger effects
//     triggerMatchEffects();

//     await new Promise((resolve) => setTimeout(resolve, 300));
//     await fillEmptyCells(newGrid);
// }