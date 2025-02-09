// File: src/pages/Pokedex.tsx

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";

interface FishInfo {
  id: number;
  name: string;
  rarity: string;
  level: number;
  emoji: string;
  description: string;
  habitat: string;
  population?: string;      // extended info
  conservationStatus?: string; // extended info
}

const fishData: FishInfo[] = [
  {
    id: 1,
    name: "Pixel Puffer",
    rarity: "Common",
    level: 5,
    emoji: "🐡",
    description: "A spiky friend with attitude",
    habitat: "Coral Reefs",
    population: "Stable in most reefs",
    conservationStatus: "Not currently threatened",
  },
  {
    id: 2,
    name: "Digital Dolphin",
    rarity: "Rare",
    level: 12,
    emoji: "🐬",
    description: "Playful and intelligent",
    habitat: "Open Ocean",
    population: "Reduced by pollution",
    conservationStatus: "Vulnerable",
  },
  {
    id: 3,
    name: "Binary Barracuda",
    rarity: "Epic",
    level: 8,
    emoji: "🐟",
    description: "Swift and precise",
    habitat: "Deep Waters",
    population: "Unknown due to habitat inaccessibility",
    conservationStatus: "Data Deficient",
  },
  {
    id: 4,
    name: "Quantum Shark",
    rarity: "Legendary",
    level: 15,
    emoji: "🦈",
    description: "Master of the digital depths",
    habitat: "Abyssal Zone",
    population: "Declining due to overfishing",
    conservationStatus: "Endangered",
  },
  {
    id: 5,
    name: "Cyber Seahorse",
    rarity: "Rare",
    level: 7,
    emoji: "🐠",
    description: "Graceful data swimmer",
    habitat: "Kelp Forests",
    population: "Threatened by habitat loss",
    conservationStatus: "Threatened",
  },
];

const Pokedex = () => {
  const [selectedFish, setSelectedFish] = useState<FishInfo | null>(null);

  // Open modal on fish card click
  const handleFishClick = (fish: FishInfo) => {
    setSelectedFish(fish);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedFish(null);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8 relative">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm">
            Digital Aquarium
          </span>
          <h1 className="text-4xl font-bold text-white mb-4 font-pixel animate-float">
            Your Sea Collection
          </h1>
          <p className="text-cyan-100 max-w-2xl mx-auto">
            Discover and nurture your digital aquatic companions
          </p>
        </div>

        {/* Grid of Fish Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fishData.map((fish) => (
            <motion.div
              key={fish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer"
              onClick={() => handleFishClick(fish)}
            >
              <div className="aspect-square rounded-xl bg-cyan-500/10 mb-4 flex items-center justify-center animate-float">
                <span className="text-6xl">{fish.emoji}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-100">
                {fish.name}
              </h3>
              <p className="text-cyan-200/80 text-sm mb-2">{fish.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${fish.rarity === "Epic"
                    ? "bg-purple-500/20 text-purple-200"
                    : fish.rarity === "Rare"
                      ? "bg-blue-500/20 text-blue-200"
                      : fish.rarity === "Legendary"
                        ? "bg-yellow-500/20 text-yellow-200"
                        : "bg-green-500/20 text-green-200"
                    }`}
                >
                  {fish.rarity}
                </span>
                <span className="text-cyan-100">Level {fish.level}</span>
              </div>
              <div className="text-sm text-cyan-200/60">Habitat: {fish.habitat}</div>

              {/* Progress to next level */}
              <div className="mt-4">
                <div className="h-2 bg-cyan-950/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400/50 rounded-full"
                    style={{ width: `${(fish.level % 5) * 20}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* "Discover More" Slot */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-center text-cyan-200">
            <span className="text-4xl mb-2 block">+</span>
            <p>Discover More Sea Creatures</p>
          </div>
        </motion.div>

        {/* Book-Style Modal */}
        <AnimatePresence>
          {selectedFish && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Overlay (click to close) */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleCloseModal}
              />

              {/* Book Container */}
              <motion.div
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                className="relative w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg z-10"
              >
                {/* "Book" content */}
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-pixel text-cyan-100 flex items-center justify-center gap-2">
                    <span>{selectedFish.emoji}</span> {selectedFish.name}
                  </h2>
                  <p className="text-sm text-cyan-200/70">
                    Level {selectedFish.level} · {selectedFish.rarity}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-cyan-100">
                  {/* Left Page (Basic Info) */}
                  <div className="p-4 bg-white/5 rounded-xl shadow-inner">
                    <h3 className="text-lg mb-2 font-semibold">General Info</h3>
                    <p className="text-sm text-cyan-200/80 mb-2">
                      <strong>Description:</strong> {selectedFish.description}
                    </p>
                    <p className="text-sm text-cyan-200/80 mb-2">
                      <strong>Habitat:</strong> {selectedFish.habitat}
                    </p>
                  </div>

                  {/* Right Page (Environmental Focus) */}
                  <div className="p-4 bg-white/5 rounded-xl shadow-inner">
                    <h3 className="text-lg mb-2 font-semibold">
                      Environmental Spotlight
                    </h3>
                    <p className="text-sm text-cyan-200/80 mb-2">
                      <strong>Population:</strong>{" "}
                      {selectedFish.population || "Unknown"}
                    </p>
                    <p className="text-sm text-cyan-200/80 mb-2">
                      <strong>Conservation Status:</strong>{" "}
                      {selectedFish.conservationStatus || "Data Missing"}
                    </p>
                    <p className="text-xs text-cyan-300/60 italic">
                      Protecting marine life helps preserve Earth’s delicate
                      ecosystems.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  className="mt-6 block w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 backdrop-blur-sm border border-cyan-300/20 py-2 rounded-lg"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Pokedex;
