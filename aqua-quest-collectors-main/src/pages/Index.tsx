
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 inline-block">
            Featured Fish
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AquaQuest
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover and collect amazing sea creatures while learning about ocean conservation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Fish Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-float">
            <div className="aspect-square rounded-xl bg-primary/10 mb-4 flex items-center justify-center">
              <span className="text-6xl">🐠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rainbow Fish</h3>
            <p className="text-gray-600 text-sm mb-4">
              A beautiful specimen known for its vibrant colors
            </p>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 rounded-2xl border-2 hover:border-primary hover:text-primary transition-all duration-300"
                onClick={() => window.location.href = '/challenges'}
              >
                Start New Challenge
              </Button>
              <Button
                variant="outline"
                className="h-32 rounded-2xl border-2 hover:border-primary hover:text-primary transition-all duration-300"
                onClick={() => window.location.href = '/pokedex'}
              >
                View Collection
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
