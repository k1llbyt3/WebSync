"use client";

import { useState, useEffect } from "react";
import { MatrixRain } from "@/components/matrix-rain";
import { useToast } from "@/hooks/use-toast";

export function MatrixWrapper() {
    const [active, setActive] = useState(false);
    const { toast } = useToast();
    const buffer = useState<string>("");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Simple buffer based key detection
            // We'll just track the last 6 chars
            // Actually simpler: reset buffer on non-match? No, rolling window.
            // Let's use a simpler approach.
        };

        let keySequence = "";
        const secret = "matrix";

        const listener = (e: KeyboardEvent) => {
            if (!e.key) return;
            keySequence += e.key.toLowerCase();
            if (keySequence.length > secret.length) {
                keySequence = keySequence.slice(-secret.length);
            }

            if (keySequence === secret) {
                setActive(prev => {
                    const newState = !prev;
                    // The toast notification is the visual cue that is being hidden.
                    // Functionality (toggling the matrix rain) remains.
                    // toast({
                    //     title: newState ? "System Breach Detected" : "Matrix Connection Severed",
                    //     description: newState ? "Welcome to the real world." : "Returning to simulation.",
                    //     variant: newState ? "destructive" : "default",
                    //     className: newState ? "border-green-500 text-green-500 bg-black" : "",
                    // });
                    return newState;
                });
                keySequence = ""; // Reset
            }
        };

        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [toast]);

    if (!active) return null;

    return <MatrixRain />;
}
