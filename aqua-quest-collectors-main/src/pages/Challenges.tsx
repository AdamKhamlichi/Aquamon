
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

const Challenges = () => {
  const challenges = [
    {
      id: 1,
      title: "Beach Cleanup",
      description: "Collect virtual trash to save pixel fish",
      reward: "Rare Digital Dolphin",
      difficulty: "Easy",
    },
    {
      id: 2,
      title: "Ocean Quiz",
      description: "Test your knowledge about marine life",
      reward: "Epic Binary Barracuda",
      difficulty: "Medium",
    },
    {
      id: 3,
      title: "Coral Restoration",
      description: "Help rebuild pixel coral reefs",
      reward: "Legendary Pixel Shark",
      difficulty: "Hard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-[pixel] animate-float">
            Ocean Challenges
          </h1>
          <p className="text-gray-600">Complete challenges to collect rare sea creatures</p>
        </div>

        <div className="grid gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{challenge.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  challenge.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary">Reward: {challenge.reward}</span>
                <Button variant="outline">Start Challenge</Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Challenges;
