"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface SplitPaneProps {
    children: [React.ReactNode, React.ReactNode];
    className?: string;
    minSize?: number;
    defaultSplit?: number; // Percentage (0-100)
}

export function SplitPane({ children, className, minSize = 20, defaultSplit = 50 }: SplitPaneProps) {
    const [split, setSplit] = useState(defaultSplit);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const startDragging = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const stopDragging = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onDrag = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newSplit = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            if (newSplit > minSize && newSplit < 100 - minSize) {
                setSplit(newSplit);
            }
        },
        [isDragging, minSize]
    );

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", onDrag);
            window.addEventListener("mouseup", stopDragging);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        } else {
            window.removeEventListener("mousemove", onDrag);
            window.removeEventListener("mouseup", stopDragging);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        return () => {
            window.removeEventListener("mousemove", onDrag);
            window.removeEventListener("mouseup", stopDragging);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isDragging, onDrag, stopDragging]);

    return (
        <div
            ref={containerRef}
            className={cn("flex w-full h-full relative overflow-hidden", className)}
        >
            <div style={{ width: `${split}%` }} className="h-full overflow-hidden relative z-10">
                {children[0]}
            </div>

            <div
                className="w-1 bg-white/10 hover:bg-blue-500/50 cursor-col-resize flex items-center justify-center transition-colors z-20 group relative"
                onMouseDown={startDragging}
            >
                {/* Enhanced Handle Visuals */}
                <div className="absolute inset-y-0 -left-2 -right-2 z-30" /> {/* Larger touch target */}
                <div className={cn(
                    "w-1 h-8 rounded-full bg-white/30 group-hover:bg-blue-400 transition-all duration-300",
                    isDragging && "bg-blue-500 h-12"
                )} />
            </div>

            <div style={{ width: `${100 - split}%` }} className="h-full overflow-hidden relative z-10">
                {children[1]}
            </div>
        </div>
    );
}
