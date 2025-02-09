// File: src/pages/Social.tsx

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

const Social = () => {
  const friends = [
    { id: 1, name: "WaveRider", fish: 12, status: "online", emoji: "🐋" },
    { id: 2, name: "CoralKeeper", fish: 8, status: "offline", emoji: "🐠" },
    { id: 3, name: "TideHunter", fish: 15, status: "online", emoji: "🦈" },
    { id: 4, name: "SeaExplorer", fish: 10, status: "online", emoji: "🐡" },
    { id: 5, name: "OceanGuard", fish: 20, status: "offline", emoji: "🐳" },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm">
            Ocean Community
          </span>
          <h1 className="text-4xl font-bold text-white mb-4 font-pixel animate-float">
            Ocean Friends
          </h1>
          <p className="text-cyan-100 max-w-2xl mx-auto">
            Connect with other ocean protectors and share your aquatic discoveries
          </p>
        </div>

        <div className="grid gap-4">
          {friends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center text-2xl">
                  {friend.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-cyan-100">{friend.name}</h3>
                  <p className="text-cyan-200/80">Collected {friend.fish} sea creatures</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${friend.status === 'online'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-gray-500/20 text-gray-300'
                  }`}>
                  {friend.status}
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="mt-4 flex gap-2">
                {Array.from({ length: Math.min(3, Math.floor(friend.fish / 5)) }).map((_, i) => (
                  <div key={i} className="bg-cyan-500/10 p-1 rounded-full" title="Collection Milestone">
                    🏆
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Friend Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full py-4 bg-cyan-500/20 text-cyan-100 rounded-xl border border-cyan-300/20 backdrop-blur-sm hover:bg-cyan-500/30 transition-all duration-300"
        >
          Find More Ocean Friends
        </motion.button>
      </main>
    </div>
  );
};

export default Social;