// File: src/pages/Challenges/Challenges.tsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { motion } from 'framer-motion';
import { Star, Timer, Trophy, Users } from 'lucide-react';
import TrashSlayer from "@/pages/challenges/games/TrashSlayer/TrashSlayer.tsx";
import { useInteractionSound } from '@/hooks/use-interaction-sound';


// Lazy load the CoralGame component
const CoralGame = React.lazy(() => import('./challenges/games/CoralGame/CoralGame'));
const TurtleGame = React.lazy(() => import('./challenges/games/TurtleGame/TurtleGame'));
const PlasticGame = React.lazy(() => import('./challenges/games/PlasticHunter/PlasticHunter.tsx'));

export const ChallengeWrapper = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  // Define our available challenges
  const challenges = {
    'coral-restoration': {
      title: "Coral Restoration",
      description: "Help rebuild pixel coral reefs",
      component: CoralGame,
      difficulty: "Hard",
      reward: "Legendary Pixel Shark"
    },
    'turtle-dash': {
      title: "Turtle Dash",
      description: "Try to survive the polluted oceans",
      component: TurtleGame,
      difficulty: "Hard",
      reward: "Speedy Turtle"
    }, 'plastic-cleanup': {
      title: "Plastic Cleanup",
      description: "Help clean up the plastic from the ocean",
      component: PlasticGame,
      difficulty: "Medium",
      reward: "Mad HammerHead"
    },
    'trash-slasher': {
      title: "Trash Slasher",
      description: "Help clean up the ocean by slicing through trash",
      component: TrashSlayer,
      difficulty: "Medium",
      reward: "Huge Whale",
      icon: "🗑️"
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

export const ChallengesList = () => {
  const navigate = useNavigate();
  const { handlers } = useInteractionSound();


  const challenges = [
    {
      id: "koi-raid",
      title: "Koi Fish Raid",
      description: "On February 14th, meet up with fellow AquaQuest players at your nearest raid to obtain the Legendary Koi Fish!",
      reward: "🐟 Legendary Koi Fish",
      difficulty: "Hard",
      activeUsers: 0,
      completionRate: 100,
      icon: "🐟"
    },
    {
      id: "coral-restoration",
      title: "Coral Restoration",
      description: "Match and collect corals to restore marine ecosystems",
      reward: "🦈 Legendary Pixel Shark",
      difficulty: "Hard",
      activeUsers: 1234,
      completionRate: 75,
      icon: "🪸"
    },
    {
      id: "turtle-dash",
      title: "Turtle Dash",
      description: "Try to survive the polluted oceans",
      reward: "🐢 Speedy Turtle",
      difficulty: "Normal, Hard",
      activeUsers: 2156,
      completionRate: 82,
      icon: "🐢"
    },
    {
      id: 'plastic-cleanup',
      title: "Plastic Cleanup",
      description: "Help clean up the plastic from the ocean",
      reward: "🔨 Mad HammerHead",
      difficulty: "Medium",
      activeUsers: 277,
      completionRate: 15,
      icon: "🦈"
    },
    {
      id: "trash-slasher",
      title: "Trash Slasher",
      description: "Help clean up the ocean by slicing through trash",
      reward: "🐋 Huge Whale",
      difficulty: "Medium",
      activeUsers: 1856,
      completionRate: 78,
      icon: "🗑️"
    }
  ];

  return (
      <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
        <Navigation />

        <main className="relative z-10 max-w-screen-xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
            >
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium backdrop-blur-sm">
              Ocean Missions
            </span>
              <h1 className="text-4xl font-bold text-white mb-2 font-pixel flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-300" />
                Ocean Challenges
              </h1>
              <p className="text-cyan-100 max-w-md">
                Complete challenges to earn rewards and help protect our oceans
              </p>
            </motion.div>
          </div>

          <div className="grid gap-6">
            {challenges.map((challenge, index) => (
                <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-5xl bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-cyan-100">{challenge.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${challenge.difficulty === 'Hard'
                            ? 'bg-red-500/20 text-red-200'
                            : 'bg-yellow-500/20 text-yellow-200'
                        }`}>
                      {challenge.difficulty}
                    </span>
                      </div>
                      <p className="text-cyan-200/80 mt-1">{challenge.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                      <Users className="w-5 h-5 text-cyan-300 mb-2" />
                      <div className="text-lg font-semibold text-cyan-100">
                        {challenge.activeUsers.toLocaleString()}
                      </div>
                      <div className="text-xs text-cyan-200/70">Active Players</div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                      <Timer className="w-5 h-5 text-cyan-300 mb-2" />
                      <div className="text-lg font-semibold text-cyan-100">
                        {challenge.completionRate}%
                      </div>
                      <div className="text-xs text-cyan-200/70">Completion Rate</div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                      <Star className="w-5 h-5 text-yellow-300 mb-2" />
                      <div className="text-lg font-semibold text-cyan-100">
                        {challenge.reward.split(' ')[0]}
                      </div>
                      <div className="text-xs text-cyan-200/70">Reward</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-cyan-200">
                      Reward: <span className="font-semibold">{challenge.reward}</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 border border-cyan-300/20"
                      disabled={challenge.id === 'koi-raid'}
                    >
                      {challenge.id === 'koi-raid' ? 'See you on Feb 14th!' : 'Start Challenge'}
                    </Button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.completionRate}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="h-full bg-cyan-400/50"
                    />
                  </div>
                </motion.div>
            ))}
          </div>
        </main>
      </div>
  );
};

export default ChallengesList;