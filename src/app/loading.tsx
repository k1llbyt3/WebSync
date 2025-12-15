import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center animated-gradient z-[100] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo Container with Glass Effect */}
                <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-700">
                    {/* Logo - using the asset as requested */}
                    <div className="relative w-24 h-24 overflow-hidden rounded-xl">
                        <Image
                            src="/worksync-logo.png"
                            alt="WebSync Logo"
                            fill
                            className="object-contain drop-shadow-xl"
                            priority
                        />
                    </div>

                    {/* Spinning Ring */}
                    <div className="absolute inset-0 -m-1 rounded-3xl border-2 border-transparent border-t-primary/50 border-r-primary/30 animate-spin transition-all duration-1000" />
                </div>

                {/* Loading Text */}
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-white animate-pulse">
                        WebSync
                    </h2>
                    <p className="text-sm text-white/50 font-medium tracking-wide uppercase">
                        Loading Workspace...
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-primary animate-progress origin-left" />
                </div>
            </div>
        </div>
    );
}
