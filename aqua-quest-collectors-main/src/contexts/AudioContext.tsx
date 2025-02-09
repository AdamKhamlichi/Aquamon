// File: src/contexts/AudioContext.tsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
    volume: number;
    setVolume: (volume: number) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    playSound: (sound: string) => void;
    initializeAudio: () => void;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isInitialized = useRef(false);

    const setupAudio = () => {
        // Clean up existing audio if any
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.remove();
        }

        // Create new audio instance
        audioRef.current = new Audio('/sounds/ambient.mp3');
        audioRef.current.loop = true;

        // Set initial volume
        const effectiveVolume = isMuted ? 0 : volume / 100;
        audioRef.current.volume = effectiveVolume;

        // Play if should be playing
        if (isPlaying && !isMuted) {
            audioRef.current.play().catch(console.error);
        }
    };

    // Initialize audio
    const initializeAudio = () => {
        if (!isInitialized.current) {
            setupAudio();
            isInitialized.current = true;
        }
    };

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            const effectiveVolume = isMuted ? 0 : volume / 100;
            audioRef.current.volume = effectiveVolume;
        }
    }, [volume, isMuted]);

    // Handle mute state
    useEffect(() => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = 0;
            } else {
                audioRef.current.volume = volume / 100;
            }
        }
    }, [isMuted, volume]);

    // Handle play/pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying && !isMuted) {
                audioRef.current.play().catch(console.error);
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.remove();
            }
        };
    }, []);

    const playSound = (sound: string) => {
        if (!isMuted) {
            const audio = new Audio(sound);
            audio.volume = volume / 100;
            audio.play().catch(console.error);
        }
    };

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('audioSettings', JSON.stringify({
            volume,
            isMuted,
            isPlaying
        }));
    }, [volume, isMuted, isPlaying]);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('audioSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setVolume(settings.volume);
            setIsMuted(settings.isMuted);
            setIsPlaying(settings.isPlaying);
        }
    }, []);

    return (
        <AudioContext.Provider
            value={{
                volume,
                setVolume,
                isMuted,
                setIsMuted,
                isPlaying,
                setIsPlaying,
                playSound,
                initializeAudio
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};