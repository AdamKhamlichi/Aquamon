export enum FishType {
  BabyHammerheadShark = "Baby Hammerhead Shark",
  MiddleHammerheadShark = "Middle Hammerhead Shark",
  AdultHammerheadShark = "Adult Hammerhead Shark",
  BabyGoldfish = "Baby Goldfish",
  NormalGoldfish = "Normal Goldfish",
  GoldfishKoiFish = "Goldfish Koi Fish",
  BabyTurtle = "Baby Turtle",
  EvolvedTurtle = "Evolved Turtle",
  BabyPufferfish = "Baby Pufferfish",
  EvolvedPufferfish = "Evolved Pufferfish",
  BabyDolphin = "Baby Dolphin",
  AdultDolphin = "Adult Dolphin",
  BabyGreatWhiteShark = "Baby Great White Shark",
  EvolvedGreatWhiteShark = "Evolved Great White Shark",
  BabyWhale = "Baby Whale",
  EvolvedBabyWhale = "Evolved Baby Whale",
}

export type FishInfo = {
  id: number;
  name: string;
  rarity: string;
  level: number;
  emoji: string;
  description: string;
  habitat: string;
  population?: string;
  conservationStatus?: string;
};

// Your fishData, including Baby Whale (ID=15).
export const fishData: FishInfo[] = [
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
  // ... other fish ...
  {
    id: 13,
    name: "Baby Great White Shark",
    rarity: "Legendary", // or whatever rarity
    level: 10, // or whatever default
    emoji: "🦈",
    description: "A fearsome but adorable apex predator",
    habitat: "Open Ocean",
    population: "Unknown",
    conservationStatus: "Data Missing",
  },
  {
    id: 15,
    name: "Baby Whale",
    rarity: "Rare",
    level: 1,
    emoji: "🐋",
    description: "A small yet mighty whale in training",
    habitat: "Deep Ocean",
    population: "Unknown",
    conservationStatus: "Data Missing",
  },
];
