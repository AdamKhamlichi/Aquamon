// constants.ts

/**
 * Basic game constants
 */
export const GRID_SIZE = 8;
export const MIN_MATCH = 3;
export const POINTS_PER_MATCH = 100;
export const WINNING_SCORE = 2000;
export const INITIAL_MOVES = 20;

/**
 * Three game modes:
 *  - CHALLENGE: Must score 2000 in 20 moves
 *  - FREE: Infinite moves, user picks difficulty
 *  - ADVENTURE: Multiple levels with unique target, moves, difficulty
 */
export const GAME_MODES = {
  CHALLENGE: "challenge",
  FREE: "free",
  ADVENTURE: "adventure",
} as const;

/**
 * Type union for the three possible game modes
 */
export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

/**
 * Coral definitions
 *  - regular: the basic corals
 *  - extended: additional corals for higher difficulties
 *  - special: power-ups
 */
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
