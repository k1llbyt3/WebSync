

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { ConstellationEffect } from "@/components/ui/constellation-bg";

const features = [
  {
    icon: <Icons.bot className="h-8 w-8 text-primary" />,
    title: "AI-Powered Task Prioritization",
    description: "Automatically prioritize tasks using AI analysis to focus on what matters most.",
  },
  {
    icon: <Icons.meetings className="h-8 w-8 text-primary" />,
    title: "Meeting Analysis",
    description: "Extract action items, summaries, and key dates from meeting transcripts instantly.",
  },
  {
    icon: <Icons.codegen className="h-8 w-8 text-primary" />,
    title: "Developer Tools",
    description: "Generate code snippets, tests, and documentation based on task descriptions.",
  },
  {
    icon: <Icons.tasks className="h-8 w-8 text-primary" />,
    title: "Visual Project Boards",
    description: "Organize your workflow with intuitive drag-and-drop boards and real-time collaboration.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden relative">
      <div className="fixed inset-0 animated-gradient -z-20" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat -z-10 opacity-[0.05]" />
      <ConstellationEffect mouseInteraction={true} />

      <header className="container z-40">
        <div className="flex h-24 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/worksync-logo.png"
              alt="WorkSync"
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
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
              Achieve Ultimate Productivity with{" "}
              <span className="text-primary">
                WorkSync
              </span>
            </h1>
            <p className="max-w-[700px] text-xl text-foreground/80 mt-6 leading-relaxed">
              Your intelligent partner for task management, meeting analysis,
              and code generation. Let AI handle the noise, so you can focus on
              the flow.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-sm items-center justify-center space-x-4 mt-8">
            <Button asChild size="lg" className="h-14 px-8 text-lg transition-transform hover:scale-105 shadow-lg shadow-primary/20">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        {/* Deep Scroll Section: Space Modules */}
        <section className="container my-40 min-h-screen relative">


          <div className="mx-auto mb-20 flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl text-white">
              Mission Control Modules
            </h2>
            <p className="max-w-[700px] text-lg text-white/60">
              Deploying advanced tools to streamline your workflow.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 pb-40">
            {features.map((feature, i) => (
              <Link href="/signup" key={feature.title} className="block group">
                <Card className="h-full bg-black/40 backdrop-blur-xl border-white/10 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] group-hover:-translate-y-2 group-hover:border-purple-500/50">
                  <CardHeader className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-purple-500/10 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4 text-white group-hover:text-purple-300 transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-white/50 group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/20 py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by You. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

