// File: src/pages/Pokedex.tsx

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { fishData, FishInfo } from "@/types/fishe-types";
import { useInteractionSound } from "@/hooks/use-interaction-sound";



interface DBSpeciesRow {
  id: number;
  species_id: number;
  marine_species: {
    id: number;
    name: string;
  };
}

const Pokedex = () => {
  const [ownedFish, setOwnedFish] = useState<FishInfo[]>([]);
  const [selectedFish, setSelectedFish] = useState<FishInfo | null>(null);

  useEffect(() => {
    const fetchUserFish = async () => {
      try {
        // 1) Get user session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          console.log("No user logged in. Owned fish will be empty.");
          return;
        }

        // 2) Query user_marine_species with 1-to-1 relationship
        const { data, error } = await supabase
          .from("user_marine_species")
          .select(`
            id,
            species_id,
            marine_species (
              id,
              name
            )
          `)
          .eq("user_id", session.user.id);

        console.log("Fetched user_marine_species:", data);

        if (error) throw error;
        if (!data) {
          setOwnedFish([]);
          return;
        }

        const rows = data as unknown as DBSpeciesRow[];

        // 3) Convert the DB species row to local FishInfo
        const userFish: Array<FishInfo | null> = rows.map((row) => {
          const speciesObj = row.marine_species; // SINGLE object
          if (!speciesObj) {
            return null;
          }
          // Find in fishData by name
          const foundFish = fishData.find((f) => f.name === speciesObj.name);
          return foundFish || null;
        });

        // Filter out any null
        const filteredFish = userFish.filter(Boolean) as FishInfo[];
        setOwnedFish(filteredFish);

      } catch (err) {
        console.error("Error fetching user fish:", err);
      }
    };

    fetchUserFish();
  }, []);

  const handleFishClick = (fish: FishInfo) => setSelectedFish(fish);
  const handleCloseModal = () => setSelectedFish(null);
  const { handlers } = useInteractionSound();

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

        {ownedFish.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedFish.map((fish) => (
              <motion.div
                key={fish.id}
                {...handlers}
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
                <p className="text-cyan-200/80 text-sm mb-2">
                  {fish.description}
                </p>

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
                <div className="text-sm text-cyan-200/60">
                  Habitat: {fish.habitat}
                </div>

                {/* Example progress bar for levels */}
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
        ) : (
          <div className="text-center text-cyan-200 mt-8">
            You haven't collected any sea creatures yet!
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-center text-cyan-200">
            <span className="text-4xl mb-2 block">+</span>
            <p>Discover More Sea Creatures</p>
          </div>
        </motion.div>

        <AnimatePresence>
          {selectedFish && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleCloseModal}
              />
              <motion.div
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                className="relative w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg z-10"
              >
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-pixel text-cyan-100 flex items-center justify-center gap-2">
                    <span>{selectedFish.emoji}</span> {selectedFish.name}
                  </h2>
                  <p className="text-sm text-cyan-200/70">
                    Level {selectedFish.level} · {selectedFish.rarity}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-cyan-100">
                  <div className="p-4 bg-white/5 rounded-xl shadow-inner">
                    <h3 className="text-lg mb-2 font-semibold">General Info</h3>
                    <p className="text-sm text-cyan-200/80 mb-2">
                      <strong>Description:</strong>{" "}
                      {selectedFish.description}
                    </p>
                    <p className="text-sm text-cyan-200/80 mb-2">
                      <strong>Habitat:</strong> {selectedFish.habitat}
                    </p>
                  </div>
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
