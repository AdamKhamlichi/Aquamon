/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
    Volume2,
    VolumeX,
    Music,
    Shell,
    User as UserIcon,
    Star,
    Trophy,
    Settings as SettingsIcon,
    Fish,
} from "lucide-react";

import { useAudio } from "@/hooks/use-audio";

const Settings = () => {
    // Audio states from AudioContext
    const { volume, setVolume, isMuted, setIsMuted, isPlaying, setIsPlaying } = useAudio();

    // Local state for user info
    const [user, setUser] = useState<User | null>(null);

    // Stats we fetch dynamically
    const [gamesPlayed, setGamesPlayed] = useState<number>(0);
    const [totalScore, setTotalScore] = useState<number>(0);
    const [highestLevel, setHighestLevel] = useState<number>(0);
    const [collectedNormal, setCollectedNormal] = useState<number>(0);
    const [collectedShiny, setCollectedShiny] = useState<number>(0);

    useEffect(() => {
        // 1) Load user
        const loadUser = async () => {
            const {
                data: { user: currentUser },
            } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                // 2) (Optional) Fetch additional stats from your DB if you have one

                // 3) Now fetch the user's owned species from user_marine_species
                const { data, error } = await supabase
                    .from("user_marine_species")
                    .select('marine_species ( id, name )')
                    .eq("user_id", currentUser.id);

                if (data && !error) {
                    let normalCount = 0;
                    let shinyCount = 0;

                    data.forEach((row: any) => {
                        // Assume that a shiny fish has a name that starts with "Shiny "
                        const fishName: string = row.marine_species?.name || "";
                        if (fishName.startsWith("Shiny ")) {
                            shinyCount++;
                        } else {
                            normalCount++;
                        }
                    });

                    setCollectedNormal(normalCount);
                    setCollectedShiny(shinyCount);
                }
            }
        };

        loadUser();
    }, []);

    // Handle volume slider
    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
        if (value[0] > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    // Toggle background music
    const handleMusicToggle = (checked: boolean) => {
        setIsPlaying(checked);
        if (checked && isMuted) {
            setIsMuted(false);
        }
    };

    const totalCollected = collectedNormal + collectedShiny;

    return (
        <div className="min-h-screen bg-transparent pb-20 md:pb-0 md:pt-20">
            <Navigation />

            <main className="relative z-10 max-w-screen-xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium backdrop-blur-sm">
                            Settings
                        </span>
                        <h1 className="text-4xl font-bold text-white mb-2 font-pixel flex items-center gap-3">
                            <SettingsIcon className="w-8 h-8" />
                            Player Settings
                        </h1>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg"
                    >
                        <h2 className="text-xl font-semibold text-cyan-100 mb-6 flex items-center gap-2">
                            <UserIcon className="w-5 h-5" />
                            Profile Information
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-300/20 flex items-center justify-center">
                                    <Shell className="w-12 h-12 text-cyan-200" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-cyan-100 font-medium">{user?.email}</p>
                                {user?.created_at && (
                                    <p className="text-cyan-200/70 text-sm">
                                        Player since {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {/* Collectible counts */}
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {/* Normal Count */}
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <Fish className="w-5 h-5 text-cyan-300 mx-auto mb-2" />
                                    <div className="text-lg font-semibold text-cyan-100">
                                        Normal: {collectedNormal} / 16
                                    </div>
                                    <div className="text-xs text-cyan-200/70">Common</div>
                                </div>

                                {/* Shiny Count */}
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <Fish className="w-5 h-5 text-yellow-300 mx-auto mb-2" />
                                    <div className="text-lg font-semibold text-cyan-100">
                                        Shiny: {collectedShiny} / 16
                                    </div>
                                    <div className="text-xs text-cyan-200/70">Shiny</div>
                                </div>

                                {/* Total Count */}
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <Fish className="w-5 h-5 text-cyan-300 mx-auto mb-2" />
                                    <div className="text-lg font-semibold text-cyan-100">
                                        Total: {totalCollected} / 32
                                    </div>
                                    <div className="text-xs text-cyan-200/70">All Collectibles</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Audio Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg"
                    >
                        <h2 className="text-xl font-semibold text-cyan-100 mb-6 flex items-center gap-2">
                            <Music className="w-5 h-5" />
                            Audio Settings
                        </h2>

                        <div className="space-y-8">
                            {/* Master Volume */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-cyan-100">Master Volume</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="text-cyan-200 hover:text-cyan-100"
                                    >
                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </Button>
                                </div>
                                <Slider
                                    value={[volume]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                    disabled={isMuted}
                                    className="w-full"
                                />
                                <div className="text-xs text-cyan-200/70 text-right">
                                    Volume: {volume}%
                                </div>
                            </div>

                            {/* Background Music */}
                            <div className="flex items-center justify-between">
                                <span className="text-cyan-100">Background Music</span>
                                <Switch checked={isPlaying} onCheckedChange={handleMusicToggle} />
                            </div>

                            {/* Mute All */}
                            <div className="flex items-center justify-between">
                                <span className="text-cyan-100">Mute All Sounds</span>
                                <Switch
                                    checked={isMuted}
                                    onCheckedChange={(checked) => setIsMuted(checked)}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                onClick={() => {
                                    // Optionally, save these settings to DB if needed
                                }}
                                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 backdrop-blur-sm border border-cyan-300/20"
                            >
                                Save Settings
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
