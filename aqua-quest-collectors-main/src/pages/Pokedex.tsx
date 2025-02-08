// File: src/pages/Pokedex.tsx

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

const Pokedex = () => {
  const collectedFish = [
    {
      id: 1,
      name: "Pixel Puffer",
      rarity: "Common",
      level: 5,
      emoji: "🐡",
      description: "A spiky friend with attitude",
      habitat: "Coral Reefs"
    },
    {
      id: 2,
      name: "Digital Dolphin",
      rarity: "Rare",
      level: 12,
      emoji: "🐬",
      description: "Playful and intelligent",
      habitat: "Open Ocean"
    },
    {
      id: 3,
      name: "Binary Barracuda",
      rarity: "Epic",
      level: 8,
      emoji: "🐟",
      description: "Swift and precise",
      habitat: "Deep Waters"
    },
    {
      id: 4,
      name: "Quantum Shark",
      rarity: "Legendary",
      level: 15,
      emoji: "🦈",
      description: "Master of the digital depths",
      habitat: "Abyssal Zone"
    },
    {
      id: 5,
      name: "Cyber Seahorse",
      rarity: "Rare",
      level: 7,
      emoji: "🐠",
      description: "Graceful data swimmer",
      habitat: "Kelp Forests"
    },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectedFish.map((fish) => (
            <motion.div
              key={fish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="aspect-square rounded-xl bg-cyan-500/10 mb-4 flex items-center justify-center animate-float">
                <span className="text-6xl">{fish.emoji}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-100">{fish.name}</h3>
              <p className="text-cyan-200/80 text-sm mb-2">{fish.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded-full text-sm ${fish.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-200' :
                  fish.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-200' :
                    fish.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-200' :
                      'bg-green-500/20 text-green-200'
                  }`}>
                  {fish.rarity}
                </span>
                <span className="text-cyan-100">Level {fish.level}</span>
              </div>
              <div className="text-sm text-cyan-200/60">
                Habitat: {fish.habitat}
              </div>

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

        {/* Add New Slot */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-center text-cyan-200">
            <span className="text-4xl mb-2 block">+</span>
            <p>Discover More Sea Creatures</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Pokedex;