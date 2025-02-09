// File: src/hooks/useAudio.ts

import { useContext } from "react";
import { AudioContext } from "../contexts/AudioContext"; // Import from your context file

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
