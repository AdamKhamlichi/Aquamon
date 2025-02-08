
import Navigation from "@/components/Navigation";

const Social = () => {
  const friends = [
    { id: 1, name: "WaveRider", fish: 12, status: "online" },
    { id: 2, name: "CoralKeeper", fish: 8, status: "offline" },
    { id: 3, name: "TideHunter", fish: 15, status: "online" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-[pixel] animate-float">
            Ocean Friends
          </h1>
          <p className="text-gray-600">Connect with other ocean protectors</p>
        </div>

        <div className="grid gap-6">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-float"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🐟</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{friend.name}</h3>
                  <p className="text-gray-600">Collected {friend.fish} fish</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  friend.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {friend.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Social;
