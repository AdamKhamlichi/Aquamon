// File: src/components/AudioInitializer.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/use-audio';

const AudioInitializer = () => {
    const [showPrompt, setShowPrompt] = useState(true);
    const { initializeAudio } = useAudio();

    const handleInitialize = () => {
        initializeAudio();
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
                >
                    <button
                        onClick={handleInitialize}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 backdrop-blur-sm border border-cyan-300/20 px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
                    >
                        <span className="text-xl">🎵</span>
                        Click to enable ambient sounds
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AudioInitializer;