"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

export function CoolLoading() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = 60; // Number of nodes

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(168, 85, 247, 0.5)"; // Purple dots
                ctx.fill();

                // Connect particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 * (1 - dist / 150)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-black/95 relative z-50">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />
            <motion.div
                className="z-10 flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin reverse" />
                    <div className="absolute inset-4 rounded-full border-b-2 border-pink-500 animate-spin" />
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
                    Initializing WorkSync...
                </h2>
            </motion.div>
        </div>
    );
}
