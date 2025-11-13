

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

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
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="fixed inset-0 animated-gradient -z-10" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat -z-10 opacity-[0.05]" />
      
      <header className="container z-40">
        <div className="flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-1 font-bold text-xl">
            <Icons.logo />
            <span style={{ color: '#FF4F58' }}>WorkSync</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="transition-transform hover:scale-105 shadow-lg shadow-primary/20">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-16 md:py-24 animate-fade-in-up">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
              Achieve Ultimate Productivity with{" "}
              <span className="text-primary">
                WorkSync
              </span>
            </h1>
            <p className="max-w-[700px] text-lg text-foreground/80">
              Your intelligent partner for task management, meeting analysis,
              and code generation. Let AI handle the noise, so you can focus on
              the flow.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-sm items-center justify-center space-x-4 mt-6">
            <Button asChild size="lg" className="transition-transform hover:scale-105 shadow-lg shadow-primary/20">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        <section className="container my-20">
           <div className="relative">
             <div className="absolute top-1/2 left-1/2 w-[80%] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="mx-auto mb-12 flex max-w-[980px] flex-col items-center gap-2 text-center animate-fade-in-up">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                Features
              </h2>
              <p className="max-w-[700px] text-lg text-foreground/80">
                Everything you need to streamline your workflow and boost efficiency.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <Link href="/signup" key={feature.title} className="block group">
                  <Card className="h-full transition-all duration-300 group-hover:shadow-[0_0_20px_5px] group-hover:shadow-primary/50 group-hover:-translate-y-2">
                    <CardHeader className="flex flex-col items-center text-center">
                      {feature.icon}
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                      {feature.description}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
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

    