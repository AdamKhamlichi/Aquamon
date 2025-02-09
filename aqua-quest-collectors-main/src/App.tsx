/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Social from "./pages/Social";
import Chat from "./pages/Chat";
import Pokedex from "./pages/Pokedex";
import { ChallengesList, ChallengeWrapper } from "./pages/Challenges";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { AudioProvider } from "./contexts/AudioContext";
import AudioInitializer from "./components/AudioInitializer";


const UnderwaterBackground = ({ children }) => {
  const [bubbles, setBubbles] = useState([]);
  const [fishes, setFishes] = useState([]);

  useEffect(() => {
    // Create initial bubbles - increased count
    const createBubble = () => ({
      id: Math.random(),
      left: `${Math.random() * 100}%`,
      size: Math.random() * 15 + 5,
      delay: Math.random() * 2,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.4 + 0.2
    });

    // More initial bubbles (40 instead of 25)
    setBubbles(Array.from({ length: 40 }, createBubble));

    // Create diverse fish with different emojis
    const createFish = () => {
      const fishTypes = ['🐠', '🐟', '🐡', '🦈', '🐳', '🐋', '🐬', '🦑', '🐙'];
      const fishSizes = {
        '🐠': { min: 5, max: 10 },
        '🐟': { min: 5, max: 10 },
        '🐡': { min: 5, max: 10 },
        '🦈': { min: 5, max: 10 },
        '🐳': { min: 5, max: 10 },
        '🐋': { min: 5, max: 10 },
        '🐬': { min: 5, max: 10 },
        '🦑': { min: 5, max: 10 },
        '🐙': { min: 5, max: 10 }
      };

      const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      const sizeRange = fishSizes[type];

      return {
        id: Math.random(),
        type,
        startX: -100,
        endX: window.innerWidth + 100,
        y: Math.random() * (window.innerHeight - 200) + 100,
        duration: Math.random() * 20 + 15,
        size: Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min,
        delay: Math.random() * 10,
        direction: Math.random() > 0.5 ? 'right' : 'left',
        wobble: Math.random() * 30 + 20 // Random wobble amount
      };
    };

    // More initial fish (12 instead of 8)
    setFishes(Array.from({ length: 5 }, createFish));

    // Add new bubbles more frequently
    const bubbleInterval = setInterval(() => {
      setBubbles(prev => [...prev.slice(-35), createBubble()]);
    }, 2500); // Every second instead of every 2 seconds

    // Add new fish more frequently
    const fishInterval = setInterval(() => {
      setFishes(prev => [...prev.slice(-12), createFish()]);
    }, 5000); // Every 3 seconds instead of 5

    return () => {
      clearInterval(bubbleInterval);
      clearInterval(fishInterval);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Deeper ocean gradient background */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#000c20] via-[#001440] via-[#002d6b] to-[#0056a8] z-0" />

      {/* More light rays */}
      <div className="fixed inset-0 opacity-30 z-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute w-1/6 h-screen bg-gradient-to-b from-cyan-200/10 to-transparent blur-lg transform -skew-x-12"
            style={{
              left: `${i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animation: 'ray-move 8s infinite ease-in-out'
            }}
          />
        ))}
      </div>

      {/* Enhanced ambient particles */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,rgba(255,255,255,0.08),transparent)] z-0" />

      {/* Bubbles with more variety */}
      <div className="fixed inset-0 z-0">
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            initial={{ y: '100vh', x: bubble.left, opacity: 0 }}
            animate={{
              y: '-100vh',
              x: [`${parseFloat(bubble.left)}%`, `${parseFloat(bubble.left) + (Math.random() * 10 - 5)}%`],
              opacity: bubble.opacity,
              transition: {
                duration: bubble.duration,
                delay: bubble.delay,
                ease: 'linear',
                repeat: Infinity,
                x: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "reverse"
                }
              }
            }}
            className="absolute rounded-full bg-white/40 backdrop-blur-sm"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.left
            }}
          />
        ))}
      </div>

      {/* Swimming fish with more natural movement */}
      <div className="fixed inset-0 z-0">
        {fishes.map(fish => (
          <motion.div
            key={fish.id}
            initial={{
              x: fish.direction === 'right' ? -100 : window.innerWidth + 100,
              y: fish.y,
              opacity: 0,
              scale: fish.direction === 'right' ? 1 : -1
            }}
            animate={{
              x: fish.direction === 'right' ? window.innerWidth + 100 : -100,
              y: [fish.y - fish.wobble, fish.y + fish.wobble, fish.y - fish.wobble],
              opacity: [0, 1, 1, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              x: { duration: fish.duration, ease: "linear" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              opacity: {
                duration: fish.duration,
                times: [0, 0.1, 0.9, 1],
                ease: "linear"
              }
            }}
            style={{
              position: 'absolute',
              fontSize: `${fish.size}px`
            }}
          >
            {fish.type}
          </motion.div>
        ))}
      </div>

      {/* Kelp forest effect */}
      <div className="fixed bottom-0 left-0 right-0 h-32 z-0 flex justify-around">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`kelp-${i}`}
            className="w-4 bg-gradient-to-t from-green-800/20 to-transparent"
            style={{ height: `${100 + Math.random() * 100}px` }}
            animate={{
              height: [`${100 + Math.random() * 100}px`, `${150 + Math.random() * 100}px`],
              skewX: [-10, 10]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      <style>{`
        @keyframes ray-move {
          0%, 100% { transform: skew(-12deg) translateY(0); opacity: 0.3; }
          50% { transform: skew(-12deg) translateY(-30px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AudioInitializer />
            <UnderwaterBackground>
              <div className="min-h-screen pt-16">
                <Routes>
                  <Route
                    path="/login"
                    element={session ? <Navigate to="/" replace /> : <Login />}
                  />
                  <Route
                    path="/"
                    element={session ? <Index /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/social"
                    element={session ? <Social /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/chat"
                    element={session ? <Chat /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/pokedex"
                    element={session ? <Pokedex /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/settings"
                    element={session ? <Settings /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/challenges"
                    element={session ? <ChallengesList /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="/challenges/:challengeId"
                    element={session ? <ChallengeWrapper /> : <Navigate to="/login" replace />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </UnderwaterBackground>
          </BrowserRouter>
        </TooltipProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
};

export default App;