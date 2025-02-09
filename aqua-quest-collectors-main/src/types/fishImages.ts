// File: src/utils/fishImages.ts

export const fishImageMap: Record<string, string> = {
  // Normal variants (stored in /images/common/)
  "Pixel Puffer": "/images/common/pixel_puffer_animal.png",
  "Baby Hammerhead Shark": "/images/common/baby_hammerhead.png",
  "Middle Hammerhead Shark": "/images/common/hammerhead.png",
  "Adult Hammerhead Shark": "/images/common/hammerhead.png",
  "Baby Goldfish": "/images/common/baby_goldfish_animal.png",
  "Normal Goldfish": "/images/common/normal_goldfish_animal.png",
  "Goldfish Koi Fish": "/images/common/goldfish_koi_fish_animal.png",
  "Baby Turtle": "/images/common/baby_turtle.png",
  "Evolved Turtle": "/images/common/turtle.png",
  "Baby Pufferfish": "/images/common/baby_pufferfish_animal.png",
  "Evolved Pufferfish": "/images/common/evolved_pufferfish_animal.png",
  "Baby Dolphin": "/images/common/baby_dolphin.png",
  "Adult Dolphin": "/images/common/dolphin.png",
  "Baby Great White Shark": "/images/common/baby_shark.png",
  "Evolved Great White Shark": "/images/common/shark.png",
  "Baby Whale": "/images/common/baby_whale.png",
  "Evolved Baby Whale": "/images/common/whale.png",

  // Shiny variants (stored in /images/shiney/)
  "Shiny Pixel Puffer": "/images/shiney/pixel_puffer_animal.png",
  "Shiny Baby Hammerhead Shark": "/images/shiney/baby_hammerhead_gold.png",
  "Shiny Middle Hammerhead Shark": "/images/shiney/hammerhead_gold.png",
  "Shiny Adult Hammerhead Shark": "/images/shiney/hammerhead_gold.png",
  "Shiny Baby Goldfish": "/images/shiney/baby_goldfish_animal.png",
  "Shiny Normal Goldfish": "/images/shiney/normal_goldfish_animal.png",
  "Shiny Goldfish Koi Fish": "/images/shiney/goldfish_koi_fish_animal.png",
  "Shiny Baby Turtle": "/images/shiney/baby_turtle_gold.png",
  "Shiny Evolved Turtle": "/images/shiney/turtle_gold.png",
  "Shiny Baby Pufferfish": "/images/shiney/baby_pufferfish_animal.png",
  "Shiny Evolved Pufferfish": "/images/shiney/evolved_pufferfish_animal.png",
  "Shiny Baby Dolphin": "/images/shiney/baby_dolphin_gold.png",
  "Shiny Adult Dolphin": "/images/shiney/dolphin_gold.png",
  "Shiny Baby Great White Shark": "/images/shiney/baby_shark_gold.png",
  "Shiny Evolved Great White Shark": "/images/shiney/shark_gold.png",
  "Shiny Baby Whale": "/images/shiney/baby_whale_animal.png",
  "Shiny Evolved Baby Whale": "/images/shiney/whale.png",
};

export function getFishImageSrc(fish: { name: string }): string {
  // Return the mapped path, or a default if not found.
  return fishImageMap[fish.name] || "/images/common/default.png";
}
