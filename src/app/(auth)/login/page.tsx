"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Loader2, Sparkles, Command, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // For the cool sequence
  
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Cool Loading Sequence Logic
  useEffect(() => {
    if (isLoading) {
      const texts = ["Verifying credentials...", "Syncing your workspace...", "Almost there..."];
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < texts.length - 1 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isLoading]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    if (!auth) return;

    setIsLoading(true);
    
    // Artificial delay (500ms) to let the user see the cool animation start 
    // (Optional: remove delay if you want instant speed, but this feels smoother)
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);
      
      let description = "Invalid credentials.";
      if (error?.code === "auth/user-not-found") description = "Account not found.";
      if (error?.code === "auth/wrong-password") description = "Incorrect password.";
      
      toast({ title: "Login Failed", description, variant: "destructive" });
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      toast({ title: "Google Login Failed", description: err?.message, variant: "destructive" });
    }
  };

  // --- COOL LOADING UI (The "Wait" Experience) ---
  if (isLoading) {
    const loadingTexts = ["Verifying credentials...", "Syncing workspace...", "Welcome back!"];
    
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground overflow-hidden relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Orbit */}
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full border-b-4 border-r-4 border-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>

          {/* Progressive Text */}
          <h2 className="text-2xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingTexts[loadingStep]}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Just a moment while we get things ready.
          </p>

          {/* Progress Steps */}
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${i <= loadingStep ? "bg-primary w-6" : "bg-muted w-1.5"}`} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MODERN LOGIN FORM ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
            <Command className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Enter your details to access your workspace.</p>
        </div>

        {/* Glass Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleLogin} className="grid gap-5">
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@work.com"
                required
                className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 border-muted-foreground/20 hover:bg-muted/50" onClick={handleGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}