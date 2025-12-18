"use client";

import { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { ConstellationEffect } from "@/components/ui/constellation-bg";
import Image from "next/image";

export function CoolLoading() {
    // Custom Cursor Logic
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    // Cursor Trail
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY });

            // Add point to trail - Limit to last 20 points
            const newPoint = { x: e.clientX, y: e.clientY, id: Date.now() };
            setTrail(prev => {
                const newTrail = [...prev, newPoint];
                if (newTrail.length > 20) return newTrail.slice(newTrail.length - 20);
                return newTrail;
            });
        };

        const handleClick = (e: MouseEvent) => {
            const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
            setRipples(prev => [...prev, newRipple]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 1000);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
        };
    }, []);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black relative z-50 font-sans cursor-none select-none">

            {/* Cursor Trail */}
            {trail.map((point, i) => (
                <div
                    key={point.id}
                    className="fixed pointer-events-none rounded-full bg-cyan-500/40 blur-sm z-[90]"
                    style={{
                        left: point.x,
                        top: point.y,
                        width: Math.max(2, i * 2),
                        height: Math.max(2, i * 2),
                        opacity: i / trail.length,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            ))}

            {/* Custom Interactive Cursor */}
            <div
                className="fixed pointer-events-none z-[100] mix-blend-exclusion"
                style={{ top: cursorPos.y, left: cursorPos.x }}
            >
                {/* Rotating Crystal Core */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="relative -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="w-8 h-8 border-2 border-cyan-400 rotate-45 bg-cyan-900/30 backdrop-blur-sm" />
                    <div className="absolute inset-0 w-8 h-8 border border-white/50 rotate-45 scale-75" />
                    <div className="absolute inset-0 w-8 h-8 bg-white/80 rotate-45 scale-25 animate-pulse" />
                </motion.div>
            </div>

            {/* Click Ripples */}
            {ripples.map(r => (
                <motion.div
                    key={r.id}
                    initial={{ scale: 0, opacity: 0.8, borderWidth: '4px' }}
                    animate={{ scale: 4, opacity: 0, borderWidth: '0px' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="fixed border-cyan-400 rounded-full pointer-events-none z-[40]"
                    style={{
                        left: r.x,
                        top: r.y,
                        width: '50px',
                        height: '50px',
                        x: '-50%',
                        y: '-50%',
                        position: 'fixed'
                    }}
                />
            ))}

            {/* Original Animated Gradient Background - Full Opacity */}
            <div className="absolute inset-0 animated-gradient opacity-90" />

            {/* Interaction Layer */}
            <div className="absolute inset-0 z-0">
                <ConstellationEffect mouseInteraction={true} />
            </div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* Draggable Logo */}
                <motion.div
                    drag
                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                    dragElastic={0.2}
                    style={{ x, y }}
                    whileDrag={{ scale: 1.1, cursor: 'none' }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative group cursor-none active:cursor-none"
                    onDragStart={() => { }}
                    onDragEnd={() => { }}
                >
                    {/* Glow behind logo */}
                    <div className="absolute -inset-12 bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                    <Image
                        src="/worksync-logo.png"
                        alt="WorkSync"
                        width={240}
                        height={240}
                        className="h-48 w-auto object-contain relative z-10 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] pointer-events-none"
                        priority
                    />
                </motion.div>

                {/* Glitchy/Tech Loading Indicator */}
                <motion.div
                    className="flex gap-1.5 items-end h-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 bg-cyan-400/80 rounded-sm"
                            animate={{
                                height: [10, 32, 10],
                                backgroundColor: ["rgba(34, 211, 238, 0.5)", "rgba(255, 255, 255, 1)", "rgba(34, 211, 238, 0.5)"]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1,
                                repeatDelay: 0.2
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-12 text-white/30 text-[10px] tracking-[0.8em] font-mono uppercase"
            >
                &lt; SYSTEM_INITIALIZING /&gt;
            </motion.div>
        </div>
    );
}
