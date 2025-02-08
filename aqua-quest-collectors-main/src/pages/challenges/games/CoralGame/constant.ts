// constants.ts

export const GRID_SIZE = 8;
export const MIN_MATCH = 3;
export const POINTS_PER_MATCH = 100;
export const WINNING_SCORE = 2000;
export const INITIAL_MOVES = 20;

export const GAME_MODES = {
  CHALLENGE: "challenge",
  FREE: "free",
  ADVENTURE: "adventure",
} as const;

export const powerUpDescriptions: Record<string, string> = {
  RAINBOW: "Acts as a wildcard and can match with any coral.",
  BOMB: "Clears a 3x3 area around its position.",
  LINE: "Clears the entire row and column.",
  STAR: "A special star that might do something extra fancy.",
};

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

export const CORALS = {
  regular: ["🪸", "🐠", "🐡", "🐙", "🦀", "🦐"],
  extended: ["🐟", "🐋", "🐳", "🐬", "🦑", "🐢", "🦈", "🐊", "🐚", "🐌"],
  special: {
    RAINBOW: "🌈",
    BOMB: "💫",
    LINE: "⚡️",
    STAR: "⭐️",
  },
} as const;
