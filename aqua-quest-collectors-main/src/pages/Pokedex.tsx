
import Navigation from "@/components/Navigation";

const Pokedex = () => {
  const collectedFish = [
    { id: 1, name: "Pixel Puffer", rarity: "Common", level: 5 },
    { id: 2, name: "Digital Dolphin", rarity: "Rare", level: 12 },
    { id: 3, name: "Binary Barracuda", rarity: "Epic", level: 8 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-[pixel] animate-float">
            Digital Aquarium
          </h1>
          <p className="text-gray-600">Your collected sea creatures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectedFish.map((fish) => (
            <div
              key={fish.id}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-float"
            >
              <div className="aspect-square rounded-xl bg-primary/10 mb-4 flex items-center justify-center">
                <span className="text-6xl">🐠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{fish.name}</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full ${
                    fish.rarity === 'Epic' ? 'bg-purple-100 text-purple-700' :
                        fish.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                }`}>
                  {fish.rarity}
                </span>
                <span className="font-numeric">Level {fish.level}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pokedex;
