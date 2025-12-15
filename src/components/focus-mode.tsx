"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FocusModeDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [time, setTime] = useState(25 * 60); // 25 minutes
    const [mode, setMode] = useState<"focus" | "break">("focus");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime((prev) => prev - 1);
            }, 1000);
        } else if (time === 0) {
            setIsActive(false);
            // Play sound or notification here
        }
        return () => clearInterval(interval);
    }, [isActive, time]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTime(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 group">
                    <Icons.target className="mr-2 h-5 w-5" />
                    <span className="group-data-[state=collapsed]:hidden">Focus Mode</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-black/80 backdrop-blur-3xl border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {mode === "focus" ? "Focus Session" : "Short Break"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-8 space-y-8">
                    {/* Timer Display */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full animate-pulse" />
                        <div className="relative text-8xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-2xl">
                            {formatTime(time)}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            variant="outline"
                            className={cn(
                                "h-16 w-16 rounded-full border-2 border-white/20 hover:scale-105 transition-all text-black",
                                isActive ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-green-500/20 text-green-400 border-green-500/50"
                            )}
                            onClick={toggleTimer}
                        >
                            {isActive ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current" />}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-12 w-12 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                            onClick={resetTimer}
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setMode("focus"); setTime(25 * 60); setIsActive(false); }}
                            className={cn("rounded-lg", mode === "focus" && "bg-blue-500/20 text-blue-300")}
                        >
                            Focus
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setMode("break"); setTime(5 * 60); setIsActive(false); }}
                            className={cn("rounded-lg", mode === "break" && "bg-green-500/20 text-green-300")}
                        >
                            Break
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
