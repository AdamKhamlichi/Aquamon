/* eslint-disable @typescript-eslint/ban-ts-comment */
// File: src/pages/Social.tsx

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client"; // Adjust import path to your setup
import { motion } from "framer-motion";
import { fishData } from "@/types/fishe-types";
import { useInteractionSound } from "@/hooks/use-interaction-sound";
import { getFishImageSrc } from "@/types/fishImages";


// ---------- UTILS: Random Sea-Themed Emoji Picker -----------
const seaEmojis = [
  "🌊", "🐬", "🐠", "🐟", "🐡", "🦈", "🐳", "🐙", "🦑", "🦀", "🐚", "🐢", "🦭", "🐋"
];

// Simple hash function that sums char codes, then picks an emoji index
function getSeaEmojiForUser(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return seaEmojis[sum % seaEmojis.length];
}

// ---------- TYPES ----------
interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface UserFish {
  id: number;
  species_id: number;
  acquired_at: string;
}

interface MarineSpeciesRow {
  id: number;
  species_id: number;
  acquired_at: string;
  marine_species: {
    id: number;
    name: string;
  };
}


// ---------- MAIN COMPONENT ----------
const Social: React.FC = () => {
  // Search input
  const [searchTerm, setSearchTerm] = useState("");
  const { handlers } = useInteractionSound();

  // The list of matching user profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Track whether we’re currently fetching to show a spinner or placeholder
  const [loading, setLoading] = useState(false);

  // If user selects a profile, we display that user’s “aquarium”
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [userFish, setUserFish] = useState<UserFish[]>([]);
  const [fishLoading, setFishLoading] = useState(false);

  // Whenever searchTerm changes, fetch matching profiles
  useEffect(() => {
    if (!searchTerm) {
      setProfiles([]);
      setSelectedProfile(null);
      return;
    }

    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .ilike("username", `%${searchTerm}%`); // case-insensitive partial match

        if (!canceled) {
          if (error) {
            console.error("Error searching profiles:", error);
          } else if (data) {
            setProfiles(data);
          }
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [searchTerm]);

  // Fetch the selected user's fish from user_marine_species
  // Within the fetchUserFish function in Social.tsx
  const fetchUserFish = async (profile: Profile) => {
    setFishLoading(true);
    setSelectedProfile(profile);

    try {
      const { data, error } = await supabase
        .from("user_marine_species")
        .select(`
        id,
        species_id,
        acquired_at,
        marine_species (
          id,
          name
        )
      `)
        .eq("user_id", profile.id);

      if (error) throw error;

      console.log("Raw data from supabase:", data);

      // Process the fish data with proper typing
      const userFish = (data as unknown as MarineSpeciesRow[])?.map(item => {
        if (!item.marine_species) {
          console.log("No marine_species for item:", item);
          return null;
        }

        console.log("Looking for fish with name:", item.marine_species.name);
        console.log("All fish data IDs and names:", fishData.map(f => ({ id: f.id, name: f.name })));

        // Use species_id to find the fish in fishData
        const fishInfo = fishData.find(f => f.name === item.marine_species.name);
        console.log("Found fish info:", fishInfo);

        if (!fishInfo) {
          console.log("No fish info found for:", item.marine_species.name);
          return null;
        }

        return {
          id: item.id,
          species_id: item.marine_species.id, // Use the ID from marine_species
          acquired_at: item.acquired_at,
          ...fishInfo
        };
      }).filter(Boolean);

      console.log("Final processed userFish:", userFish);
      setUserFish(userFish || []);
    } catch (err) {
      console.error("Error fetching user fish:", err);
    } finally {
      setFishLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Intro / Title */}
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm">
            Ocean Community
          </span>
          <h1 className="text-4xl font-bold text-white mb-4 font-pixel animate-float">
            Ocean Friends
          </h1>
          <p className="text-cyan-100 max-w-2xl mx-auto">
            Connect with other ocean protectors and discover their aquatic collections
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <label className="block text-cyan-200 mb-2 font-medium" htmlFor="userSearch">
            Search by username
          </label>
          <input
            id="userSearch"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-cyan-300/20 bg-white/10 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Type a username..."
          />
        </div>

        {/* Search Results */}
        <div className="grid gap-4">
          {loading && <p className="text-cyan-200">Searching...</p>}

          {!loading && searchTerm && profiles.length === 0 && (
            <p className="text-cyan-200">No matching users found.</p>
          )}

          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              {...handlers}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer"
              onClick={() => fetchUserFish(profile)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar or fallback sea emoji */}
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center text-xl text-cyan-100">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    getSeaEmojiForUser(profile.id)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-cyan-100">{profile.username}</h3>
                  <p className="text-cyan-200/80">ID: {profile.id}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* If a user is selected, show that user's aquarium / fish list */}
        {selectedProfile && (
          <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-2xl font-bold text-cyan-100 mb-4">
              {selectedProfile.username}&apos;s Aquarium
            </h2>

            {fishLoading ? (
              <p className="text-cyan-200">Loading fish...</p>
            ) : (
              <>
                {userFish.length === 0 ? (
                  <p className="text-cyan-200">
                    {selectedProfile.username} hasn&apos;t collected any fish yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userFish.map((fish) => {
                      // Log the fish we're trying to display
                      console.log("Displaying fish:", fish);

                      // Find the fish info from fishData by name to ensure exact match
                      //@ts-expect-error
                      const fishDetail = fishData.find((f) => f.name === fish.name);
                      console.log("Found fish detail:", fishDetail);

                      // If we can't find a matching entry, show debug info
                      if (!fishDetail) {
                        return (
                          <div
                            key={fish.id}
                            className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-300/20 text-cyan-50"
                          >
                            <p>Debug Info:</p>
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(fish, null, 2)}
                            </pre>
                          </div>
                        );
                      }

                      return (
                        <motion.div
                          key={fish.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-300/20 text-cyan-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                              <img
                                src={getFishImageSrc(fishDetail)}
                                alt={fishDetail.name}
                                className="w-12 h-12 object-contain"
                              />
                              <span className="text-xs mt-1">ID: {fish.species_id}</span>
                            </div>
                            <span className="text-sm italic text-cyan-100/70">
                              Acquired: {new Date(fish.acquired_at).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold">{fishDetail.name}</h3>
                          <p className="text-cyan-100">
                            Rarity: <span className="font-bold">{fishDetail.rarity}</span>
                          </p>
                          <p className="text-cyan-100">
                            Level: <span className="font-bold">{fishDetail.level}</span>
                          </p>

                          <div className="mt-2 text-sm text-cyan-100/80">
                            <p className="mb-1 font-medium">{fishDetail.description}</p>
                            <p>Habitat: {fishDetail.habitat}</p>
                            {fishDetail.population && <p>Population: {fishDetail.population}</p>}
                            {fishDetail.conservationStatus && (
                              <p>Conservation: {fishDetail.conservationStatus}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Social;
