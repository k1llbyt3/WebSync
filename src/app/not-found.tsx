"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/components/gamification-provider";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
    const { checkTrigger } = useGamification();

    useEffect(() => {
        // Gamification Trigger: 404 Hunter
        // Clue: "Seek a path that does not exist."
        checkTrigger("404_hunter");
    }, [checkTrigger]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
            {/* Glitchy Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 left-0 w-full h-full bg-red-900/5 pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="h-16 w-16 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 font-mono">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-red-400">Page Not Found</h2>
                    <p className="text-muted-foreground max-w-[500px] text-lg">
                        The requested path has been lost in the void.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 font-bold px-8">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Return Home
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Decorative Binary Rain or similar if we wanted, but keep simple for error page */}
            <div className="absolute bottom-8 text-xs text-white/20 font-mono">
                ERR_ADDRESS_UNREACHABLE :: SYSTEM_VOID
            </div>
        </div>
    );
}
