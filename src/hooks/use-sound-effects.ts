"use client";

import { useCallback, useRef } from "react";

type SoundType = "click" | "success" | "error" | "complete" | "hover" | "delete" | "on" | "off";

export function useSoundEffects() {
    const playSound = useCallback((type: SoundType) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case "click":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case "hover":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(400, now);
                    gain.gain.setValueAtTime(0.02, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;

                case "success":
                    // Major Chord Arpeggio
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(440, now); // A4
                    osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
                    osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                    break;

                case "complete":
                    // Sci-fi "Task Done"
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;

                case "error":
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;

                case "delete":
                    osc.type = "square";
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;

                case "on":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case "off":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.linearRampToValueAtTime(400, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
            }
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, []);

    // Ambience State
    const ambienceNodes = useRef<{ [key: string]: { source: AudioBufferSourceNode, gain: GainNode, ctx: AudioContext } }>({});

    const stopAmbience = useCallback(() => {
        Object.values(ambienceNodes.current).forEach(node => {
            try {
                node.gain.gain.exponentialRampToValueAtTime(0.001, node.ctx.currentTime + 1);
                node.source.stop(node.ctx.currentTime + 1);
            } catch (e) { /* ignore */ }
        });
        ambienceNodes.current = {};
    }, []);

    const playAmbience = useCallback((type: "rain" | "wind" | "white_noise") => {
        try {
            stopAmbience(); // Stop others first

            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const bufferSize = 2 * ctx.sampleRate;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02; // Simple Brown/Pink noise approximation
                lastOut = output[i];
                output[i] *= 3.5;
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 2);

            // Filter for Wind/Rain distinction
            if (type === "wind") {
                const biquadFilter = ctx.createBiquadFilter();
                biquadFilter.type = "lowpass";
                biquadFilter.frequency.setValueAtTime(400, ctx.currentTime);
                source.connect(biquadFilter);
                biquadFilter.connect(gainNode);
            } else {
                source.connect(gainNode);
            }

            gainNode.connect(ctx.destination);
            source.start();

            ambienceNodes.current[type] = { source, gain: gainNode, ctx };

        } catch (e) {
            console.error("Ambience failed", e);
        }
    }, [stopAmbience]);

    return { playSound, playAmbience, stopAmbience };
}

let lastOut = 0;
