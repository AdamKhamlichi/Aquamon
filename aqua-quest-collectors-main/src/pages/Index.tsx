// File: src/pages/Index.tsx

import React, { useContext } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { UnderwaterContext } from "@/App";

const Index = () => {
  const { bubbleCount, fishCount } = useContext(UnderwaterContext);

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm">
            AquaQuest Initiative
          </span>
          <h1 className="text-4xl font-bold text-white mb-4 font-pixel animate-float">
            Welcome to AquaQuest
          </h1>
          <p className="text-cyan-100 max-w-2xl mx-auto">
            AquaQuest is dedicated to spreading awareness about the wonders and
            struggles of marine life. By collecting virtual sea creatures,
            playing engaging games, and joining special events, you’ll discover
            how vital the underwater environment is—and learn ways you can help
            preserve it.
          </p>
        </div>

        <div className="text-center mb-8 flex flex-col items-center space-y-2">
          <p className="text-cyan-200 text-sm">
            Currently swimming around:
          </p>
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-cyan-100 font-bold text-xl"
            >
              {fishCount} fish
            </motion.span>
            <span className="text-cyan-200 text-sm">and</span>
            <motion.span
              key={bubbleCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-cyan-100 font-bold text-xl"
            >
              {bubbleCount} bubbles
            </motion.span>
            <span className="text-cyan-200 text-sm">!</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
