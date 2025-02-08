// constants.ts

export const GRID_SIZE = 8;
export const MIN_MATCH = 3;
export const POINTS_PER_MATCH = 100;
export const WINNING_SCORE = 2000;
export const INITIAL_MOVES = 20;

export const GAME_MODES = {
  CHALLENGE: "challenge",
  FREE: "free",
} as const;

// Type for game mode (either "challenge" or "free")
export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

// constants.ts
export const CORALS = {
  regular: ["🪸", "🐠", "🐡", "🐙", "🦀", "🦐"],
  extended: ["🐟", "🐋", "🐳", "🐬", "🦑", "🐢"],
  special: {
    RAINBOW: "🌈",
    BOMB: "💫",
    LINE: "⚡️",
    STAR: "⭐️",
  },
} as const;
