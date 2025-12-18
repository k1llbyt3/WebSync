"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, CloudRain, Coffee, Wind, Speaker } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSoundEffects } from "@/hooks/use-sound-effects";

export default function FocusFlowPage() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const { playSound, playAmbience, stopAmbience } = useSoundEffects();
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");
    const [ambience, setAmbience] = useState<string | null>(null);

    // Initial Audio Stop
    useEffect(() => {
        return () => stopAmbience();
    }, [stopAmbience]);

    // Ambience Logic
    const toggleAmbience = (type: string) => {
        if (ambience === type) {
            setAmbience(null);
            stopAmbience();
        } else {
            setAmbience(type);
            // Map types to synthesis
            if (type === "rain") playAmbience("rain");
            if (type === "wind") playAmbience("wind");
            if (type === "white_noise") playAmbience("white_noise");
        }
    };

    // ... (rest of render)

    // In JSX:
    /*
        <Button onClick={() => toggleAmbience('rain')} ... > Rain </Button>
        <Button onClick={() => toggleAmbience('white_noise')} ... > White Noise </Button>
        <Button onClick={() => toggleAmbience('wind')} ... > Wind </Button>
    */

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            playSound("success"); // Verified sound effect
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex h-full flex-col p-6 gap-8 relative overflow-hidden items-center justify-center font-sans"
        >
            {/* Background gradients based on mode and ambience */}
            <div
                className={`absolute inset-0 transition-all duration-1000 z-[-20] ${mode === "focus"
                    ? "bg-gradient-to-br from-indigo-950 via-purple-950 to-black"
                    : "bg-gradient-to-br from-emerald-950 via-teal-950 to-black"
                    }`}
            />
            {ambience === "rain" && <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/t7Qb8655Z1Vf4mSFyO/giphy.gif')] opacity-5 mix-blend-overlay -z-10" />}

            {/* Zen Header */}
            <div className="text-center space-y-2">
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-thin tracking-[0.2em] text-white/90 uppercase"
                >
                    {mode === "focus" ? "Deep Focus" : "Mindful Break"}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/40 text-sm tracking-widest"
                >
                    {isActive ? "FLOW STATE ACTIVE" : "READY TO BEGIN"}
                </motion.p>
            </div>

            {/* Main Timer Circle */}
            <div className="relative">
                <motion.div
                    className="w-80 h-80 rounded-full border-4 border-white/5 flex items-center justify-center relative backdrop-blur-sm shadow-2xl"
                    animate={{
                        scale: isActive ? [1, 1.02, 1] : 1,
                        boxShadow: isActive ? "0 0 40px rgba(99, 102, 241, 0.2)" : "0 0 0px rgba(0,0,0,0)"
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Progress Ring (Simple SVG) */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="160" cy="160" r="156"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            className="text-white/5"
                        />
                        <circle
                            cx="160" cy="160" r="156"
                            fill="none" stroke="currentColor" strokeWidth="4"
                            strokeDasharray={980}
                            strokeDashoffset={980 - (980 * timeLeft) / (mode === "focus" ? 25 * 60 : 5 * 60)}
                            className={`${mode === "focus" ? "text-indigo-400" : "text-emerald-400"} transition-all duration-1000`}
                        />
                    </svg>

                    <div className="text-7xl font-light text-white tabular-nums tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-6 relative z-10"
            >
                <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full w-16 h-16 border border-white/10 hover:bg-white/10 hover:scale-110 transition-all"
                    onClick={toggleTimer}
                >
                    {isActive ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                </Button>
                <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full w-16 h-16 border border-white/10 hover:bg-white/10 hover:scale-110 transition-all"
                    onClick={resetTimer}
                >
                    <RotateCcw className="h-6 w-6" />
                </Button>
            </motion.div>

            {/* Ambience Selector */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 mt-8 bg-black/30 p-2 rounded-full border border-white/5 backdrop-blur-md"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${ambience === "rain" ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
                    onClick={() => toggleAmbience("rain")}
                >
                    <CloudRain className="h-4 w-4 mr-2" /> Rain
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${ambience === "white_noise" ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
                    onClick={() => toggleAmbience("white_noise")}
                >
                    <Coffee className="h-4 w-4 mr-2" /> White Noise
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${ambience === "wind" ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
                    onClick={() => toggleAmbience("wind")}
                >
                    <Wind className="h-4 w-4 mr-2" /> Wind
                </Button>
            </motion.div>

            {/* Hidden Audio Elements (Mock) */}
            <AnimatePresence>
                {ambience && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-white/30 animate-pulse"
                    >
                        <Speaker className="h-3 w-3" /> Audio Simulation Active: {ambience}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
