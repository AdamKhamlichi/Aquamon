// File: src/pages/Index.tsx

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm">
            Featured Fish
          </span>
          <h1 className="text-4xl font-bold text-white mb-4 font-pixel animate-float">
            Welcome to AquaQuest
          </h1>
          <p className="text-cyan-100 max-w-2xl mx-auto">
            Discover and collect amazing sea creatures while learning about ocean conservation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Fish Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
          >
            <div className="aspect-square rounded-xl bg-cyan-500/10 mb-4 flex items-center justify-center">
              <span className="text-6xl">🐠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-100">Rainbow Fish</h3>
            <p className="text-cyan-200/80 text-sm mb-4">
              A beautiful specimen known for its vibrant colors
            </p>
            <Button variant="outline" className="w-full border-cyan-300/20 text-cyan-100 hover:bg-cyan-500/20">
              Learn More
            </Button>
          </motion.div>

          {/* Quick Actions */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
              >
                <Button
                  variant="outline"
                  className="h-32 w-full rounded-xl border-cyan-300/20 text-cyan-100 hover:bg-cyan-500/20"
                  onClick={() => window.location.href = '/challenges'}
                >
                  Start New Challenge
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
              >
                <Button
                  variant="outline"
                  className="h-32 w-full rounded-xl border-cyan-300/20 text-cyan-100 hover:bg-cyan-500/20"
                  onClick={() => window.location.href = '/pokedex'}
                >
                  View Collection
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;