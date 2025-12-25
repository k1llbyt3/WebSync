"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { ConstellationEffect } from "@/components/ui/constellation-bg";

const features = [
  {
    icon: <Icons.bot className="h-8 w-8 text-cyan-400" />,
    title: "AI Prioritization",
    description: "Intelligent sorting of your workload. It knows what matters before you do.",
  },
  {
    icon: <Icons.meetings className="h-8 w-8 text-purple-400" />,
    title: "Meeting Analysis",
    description: "Transcripts, action items, and summaries synthesized in real-time.",
  },
  {
    icon: <Icons.cpu className="h-8 w-8 text-rose-400" />,
    title: "Regex Studio",
    description: "Visual debugging for complex patterns. A visual playground for code.",
  },
  {
    icon: <Icons.bot className="h-8 w-8 text-emerald-400" />,
    title: "Snippet Agent",
    description: "Your personal code librarian. Generates, stores, and fetches instantly.",
  },
  {
    icon: <Icons.focus className="h-8 w-8 text-amber-400" />,
    title: "Deep Focus",
    description: "Immersive isolation chambers for your mind. White noise and blockades deploy.",
  },
  {
    icon: <Icons.sparkles className="h-8 w-8 text-indigo-400" />,
    title: "Workflow Automations",
    description: "Chain reactions for your productivity. Trigger custom logic sequences.",
  },
  {
    icon: <Icons.users className="h-8 w-8 text-blue-400" />,
    title: "Team Sync",
    description: "Shared neural states for your team. Real-time collaboration without latency.",
  },
  {
    icon: <Icons.barChart className="h-8 w-8 text-pink-400" />,
    title: "Productivity Analytics",
    description: "Visual metrics of your output. Optimize your biological runtime.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden relative">
      <div className="fixed inset-0 animated-gradient -z-20" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat -z-10 opacity-[0.08] rotate-12 scale-150" />
      <ConstellationEffect mouseInteraction={true} />

      <header className="container z-40">
        <div className="flex h-24 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/worksync-logo.png"
              alt="WebSync"
              width={240}
              height={240}
              className="h-56 w-auto object-contain transition-all duration-300 hover:scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              priority
            />
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="transition-transform hover:scale-105 shadow-lg shadow-primary/20 bg-white text-black hover:bg-white/90 font-bold px-6 rounded-full">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-16 md:py-32 animate-fade-in-up min-h-[90vh]">
          <div className="mx-auto flex w-full flex-col items-center gap-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter">
              <span className="whitespace-nowrap">Achieve Ultimate Productivity</span> <br />
              with <span className="text-primary">WebSync</span>
            </h1>
            <p className="max-w-[700px] text-xl text-foreground/80 mt-6 leading-relaxed">
              Experience the future of work with our intelligent task management and
              code generation suite.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-sm items-center justify-center space-x-4 mt-8">
            <Button asChild size="lg" className="h-14 px-8 text-lg transition-transform hover:scale-105 shadow-lg shadow-primary/20">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Features Bento Grid v3 - Interactive 3D */}
        <section className="container relative z-10 py-24 sm:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-20 animate-fade-in-up">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
              The <span className="text-primary">Neural Network</span>
            </h2>
            <p className="max-w-[700px] text-lg text-white/60">
              A complete suite of interconnected productivity modules. Hover to explore, click to activate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 max-w-7xl mx-auto perspective-1000">

            {/* 1. Central Dashboard (Spans 8 cols) */}
            <Link href="/signup" className="col-span-1 md:col-span-6 lg:col-span-8 group relative perspective-container">
              <div className="h-full w-full rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:border-blue-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex h-full flex-col lg:flex-row">
                  <div className="flex-1 p-8 flex flex-col justify-between relative z-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <Icons.dashboard className="h-3 w-3" /> Command Center
                      </div>
                      <h3 className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">Dashboard</h3>
                      <p className="text-gray-400 leading-relaxed group-hover:text-blue-100/70 transition-colors">
                        Your mission control. Visualize task velocity, focus metrics, and upcoming deadlines in one unified, real-time interface.
                      </p>
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Initialize System <Icons.chevronLeft className="rotate-180 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  {/* Dashboard Mockup */}
                  <div className="flex-[1.5] relative min-h-[300px] bg-[#0B1120] border-t lg:border-t-0 lg:border-l border-white/10 p-4 lg:p-6 overflow-hidden group-hover:bg-[#0f172a] transition-colors origin-bottom-right group-hover:rotate-1 transition-transform duration-500">
                    {/* Window Controls */}
                    <div className="flex gap-2 mb-4 opacity-50">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    {/* App Interface */}
                    <div className="flex gap-4 h-full">
                      {/* Sidebar */}
                      <div className="w-16 hidden sm:flex flex-col gap-3 border-r border-white/5 pr-4">
                        <div className="aspect-square rounded-lg bg-blue-500/20 border border-blue-500/30" />
                        <div className="aspect-square rounded-lg bg-white/5" />
                        <div className="aspect-square rounded-lg bg-white/5" />
                        <div className="aspect-square rounded-lg bg-white/5" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="h-24 w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/5 relative overflow-hidden group-hover:border-blue-500/30 transition-colors">
                          <div className="absolute inset-x-0 bottom-0 h-12 flex items-end justify-around px-2 pb-2">
                            {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                              <div key={i} className="w-1/12 bg-blue-400/30 rounded-t-sm group-hover:bg-blue-400/50 transition-colors" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1 h-32 bg-white/5 rounded-xl border border-white/5 p-3">
                            <div className="h-2 w-1/2 bg-white/20 rounded-full mb-2" />
                            <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                          </div>
                          <div className="flex-1 h-32 bg-white/5 rounded-xl border border-white/5 p-3">
                            <div className="h-16 w-16 mobile-graph-placeholder rounded-full border-4 border-purple-500/30 border-t-purple-400 mx-auto animate-spin-slow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. Intelligent Tasks (Spans 4 cols, Row Span 2) */}
            <Link href="/signup" className="col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-2 group relative perspective-container">
              <div className="h-full rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:border-purple-500/50 overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 pb-0">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 mb-4 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <Icons.tasks className="h-3 w-3" /> Management
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Tasks</h3>
                  <p className="text-gray-400 mb-8 group-hover:text-purple-100/70 transition-colors">AI-prioritized Kanban boards that adapt to your workflow.</p>
                </div>

                {/* Kanban Board Mockup */}
                <div className="flex-1 bg-[#0B1120] mx-4 mb-4 rounded-2xl border border-white/10 p-4 relative overflow-hidden flex gap-3 group-hover:bg-[#0f172a] transition-colors origin-bottom group-hover:rotate-1 transition-transform duration-500">
                  {/* Column 1 (To Do) */}
                  <div className="flex-1 flex flex-col gap-3 min-w-[100px]">
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">To Do</div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-move group-hover:translate-y-1 transition-transform">
                      <div className="h-1.5 w-12 bg-purple-400/50 rounded-full mb-2" />
                      <div className="h-2 w-full bg-white/20 rounded-full" />
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-move group-hover:translate-y-2 transition-transform delay-75">
                      <div className="h-1.5 w-8 bg-blue-400/50 rounded-full mb-2" />
                      <div className="h-2 w-3/4 bg-white/20 rounded-full" />
                    </div>
                  </div>
                  {/* Column 2 (In Progress) */}
                  <div className="flex-1 flex flex-col gap-3 min-w-[100px] bg-white/5 rounded-xl p-2 border border-white/5">
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider text-center">In Progress</div>
                    <div className="bg-purple-600/20 p-3 rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] transform scale-105 group-hover:scale-110 transition-transform duration-300">
                      <div className="h-1.5 w-10 bg-purple-400 rounded-full mb-2" />
                      <div className="h-2 w-full bg-white/40 rounded-full" />
                      <div className="mt-2 flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-400 ring-2 ring-black" />
                        <div className="w-4 h-4 rounded-full bg-purple-400 ring-2 ring-black" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 3. Snippet Agent (Spans 4 cols) */}
            <Link href="/signup" className="col-span-1 md:col-span-3 lg:col-span-4 group relative perspective-container">
              <div className="h-full rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-4 border border-emerald-500/20">
                    <Icons.bot className="h-3 w-3" /> AI Storage
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-300 transition-colors">Snippet Agent</h3>
                  {/* Code Mockup */}
                  <div className="bg-[#0f172a] rounded-lg border border-white/10 p-4 font-mono text-[10px] relative group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                    <p className="text-pink-400">async function <span className="text-blue-400">saveSnippet</span>() {'{'}</p>
                    <p className="pl-4 text-gray-400">await <span className="text-yellow-300">db</span>.insert(code);</p>
                    <p className="pl-4 text-emerald-400 group-hover:text-emerald-300 transition-colors animate-pulse">// AI Optimized</p>
                    <p className="text-pink-400">{'}'}</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* 4. Regex Studio (Spans 4 cols) */}
            <Link href="/signup" className="col-span-1 md:col-span-3 lg:col-span-4 group relative perspective-container">
              <div className="h-full rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:border-rose-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-rose-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 mb-4 border border-rose-500/20">
                    <Icons.cpu className="h-3 w-3" /> Engineering
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-rose-300 transition-colors">Regex Studio</h3>
                  {/* Regex Mockup */}
                  <div className="bg-[#0f172a] rounded-lg border border-white/10 p-3 font-mono text-xs flex flex-col gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="bg-black/30 p-2 rounded border border-white/5 text-rose-300 truncate group-hover:text-rose-200 group-hover:border-rose-500/30 transition-colors">
                      {`/(?<id>\\d+)-(?<tag>\\w+)/g`}
                    </div>
                    <div className="flex gap-1 text-[10px]">
                      <span className="bg-rose-500/20 text-white px-1 rounded">123</span>
                      <span className="text-gray-500">-</span>
                      <span className="bg-blue-500/20 text-white px-1 rounded">alpha</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 5. Reminders (Spans 4 cols) */}
            <Link href="/signup" className="col-span-1 md:col-span-3 lg:col-span-4 group relative perspective-container">
              <div className="h-full rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:border-pink-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-pink-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400 mb-4 border border-pink-500/20">
                    <Icons.bell className="h-3 w-3" /> Timeline
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">Reminder List</h3>
                  <div className="space-y-3 group-hover:space-y-4 transition-all duration-300">
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-1 h-8 bg-gray-600 rounded-full" />
                      <div className="flex-1 bg-white/5 h-8 rounded border border-white/5" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-10 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899] group-hover:h-12 transition-all" />
                      <div className="flex-1 bg-pink-500/10 h-10 rounded border border-pink-500/20 flex items-center px-3 group-hover:bg-pink-500/20 transition-colors">
                        <div className="h-2 w-1/2 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 6. DevKit (Spans 4 cols) */}
            <Link href="/signup" className="col-span-1 md:col-span-3 lg:col-span-4 group relative perspective-container">
              <div className="h-full rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:border-orange-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-orange-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4 border border-orange-500/20">
                    <Icons.gitBranch className="h-3 w-3" /> Tooling
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">DevKit</h3>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {['JSON', 'SQL', 'CRON'].map((tool, i) => (
                      <div key={tool} className={`aspect-square rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-300 hover:bg-orange-500/20 transition-colors group-hover:scale-105 transition-transform delay-${i * 100}`}>
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            {/* 7. Focus & Meetings (Spans 4 cols - Split) */}
            <div className="col-span-1 md:col-span-6 lg:col-span-4 grid grid-cols-2 gap-4">
              <Link href="/signup" className="group relative overflow-hidden rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 hover:border-amber-500/50 transition-all duration-500 shadow-xl flex flex-col items-center justify-center p-6 text-center hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div className="p-3 mb-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Icons.focus className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">Focus</h4>
              </Link>
              <Link href="/signup" className="group relative overflow-hidden rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl hover:bg-white/5 hover:border-indigo-500/50 transition-all duration-500 shadow-xl flex flex-col items-center justify-center p-6 text-center hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <div className="p-3 mb-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Icons.meetings className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Co-Pilot</h4>
              </Link>
            </div>

          </div>
        </section>

        <footer className="border-t border-border/20 py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by You. Powered by AI.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
