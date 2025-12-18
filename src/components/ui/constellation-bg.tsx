"use client";

import { useEffect, useRef } from "react";

interface ConstellationEffectProps {
    density?: number;
    mouseInteraction?: boolean;
}

export function ConstellationEffect({ density = 75, mouseInteraction = true }: ConstellationEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Reverting alpha: false because it breaks the transparent background requirement. 
        // We need the CSS gradient to show through.
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            colorBase: string;
            opacity: number;
            twinkling: boolean;
            twinkleSpeed: number;
            twinkleDir: number;
        }


        const stars: Particle[] = [];
        const mouse = { x: -1000, y: -1000, radius: 200 };

        // Initialize Stars
        for (let i = 0; i < density; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            // Sizes: Big range for "big small size"
            const size = Math.random() < 0.1 ? Math.random() * 4 + 3 : Math.random() * 2 + 0.5;

            // Randomly Colorful: "more randomly colourful"
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
            const lightness = Math.floor(Math.random() * 40) + 50; // 50-90%
            const colorBase = `hsla(${hue}, ${saturation}%, ${lightness}%, `;

            // Blinking/Glowing
            const twinkling = Math.random() > 0.3; // More stars twinkle
            const twinkleSpeed = 0.01 + Math.random() * 0.05;

            stars.push({
                x,
                y,
                size,
                vx: (Math.random() - 0.5) * 0.4, // Slower movement
                vy: (Math.random() - 0.5) * 0.4,
                colorBase,
                opacity: Math.random(),
                twinkleDir: 1,
                twinkling,
                twinkleSpeed
            });
        }

        let animationId: number;

        const animate = () => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            const mouseX = mouse.x;
            const mouseY = mouse.y;

            stars.forEach(star => {
                // Update Position with gentle float
                star.x += star.vx;
                star.y += star.vy;

                // Twinkle Logic
                if (star.twinkling) {
                    star.opacity += star.twinkleSpeed * star.twinkleDir;
                    if (star.opacity > 1 || star.opacity < 0.2) {
                        star.twinkleDir *= -1;
                    }
                }

                // Wrap around screen
                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
                if (star.y < 0) star.y = height;
                if (star.y > height) star.y = 0;

                // Mouse Interaction (Push away)
                if (mouseInteraction) {
                    const dx = mouseX - star.x;
                    const dy = mouseY - star.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = 200; // Increased range

                    if (distance < maxDistance) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * 1.5; // Stronger push
                        const directionY = forceDirectionY * force * 1.5;

                        star.x -= directionX;
                        star.y -= directionY;
                    }
                }

                // Draw Star
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = star.colorBase + star.opacity + ")";
                ctx.shadowBlur = star.size * 2; // Glow effect
                ctx.shadowColor = star.colorBase + "0.8)";
                ctx.fill();
                ctx.shadowBlur = 0; // Reset
            });

            // Connect stars
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 0.5;

            for (let i = 0; i < stars.length; i++) {
                // Optimization: Checked fewer neighbors
                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    if (Math.abs(dx) > 100 || Math.abs(dy) > 100) continue;

                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(stars[i].x, stars[i].y);
                        ctx.lineTo(stars[j].x, stars[j].y);
                        // Make lines colorful too based on star color
                        const grad = ctx.createLinearGradient(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
                        grad.addColorStop(0, stars[i].colorBase + "0.2)");
                        grad.addColorStop(1, stars[j].colorBase + "0.2)");
                        ctx.strokeStyle = grad;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Re-init on resize could be better but let's just update dims
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }

        window.addEventListener('resize', handleResize);
        if (mouseInteraction) window.addEventListener('mousemove', handleMouseMove);

        animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mouseInteraction) window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [density, mouseInteraction]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none -z-10 opacity-80 mix-blend-screen"
            style={{ position: 'fixed', top: 0, left: 0 }}
        />
    );
}
