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
import Image from "next/image";
import { Loader2, Sparkles, Command, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CoolLoading } from "@/components/cool-loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Clear error when user types
  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

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
    setError(null);

    // Basic Validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!auth) return;

    setIsLoading(true);

    // Artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);

      let description = "Invalid credentials. Please check your email and password.";
      if (error?.code === "auth/user-not-found") description = "No account found with this email.";
      if (error?.code === "auth/wrong-password") description = "Incorrect password.";
      if (error?.code === "auth/too-many-requests") description = "Too many failed attempts. Try again later.";

      setError(description);
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
      setError(err?.message || "Google sign-in failed.");
    }
  };

  // --- COOL LOADING UI ---
  if (isLoading) {
    return <CoolLoading />;
  }

  // --- MODERN LOGIN FORM ---
  return (
    <div className="w-full h-full flex items-center justify-center relative p-4">
      {/* No extra background divs needed here if Layout handles it */}

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-700">



        {/* Glass Card with Cool Borders */}
        <div className="relative group">
          {/* Animated Border Gradient */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-tilt"></div>

          <div className="relative rounded-3xl p-6 sm:p-8 border border-white/20 bg-black/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
            {/* Inner Header */}
            <div className="text-center mb-6 flex flex-col items-center">
              <Link href="/" className="inline-flex items-center justify-center mb-4 hover:scale-105 transition-transform duration-300">
                <Image
                  src="/s-logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Welcome Back</h1>
              <p className="text-white/60 mt-1 text-xs">Enter your details to access your workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="grid gap-5">

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-white text-sm py-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-white/70 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@work.com"
                  required
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-white/70">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="h-11 bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 rounded-xl mt-2 bg-gradient-to-r from-primary to-emerald-600 border-none">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="text-xs uppercase text-white/50 font-medium">Or continue with</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-white/10 hover:bg-white/5 text-white hover:text-white hover:border-white/20 transition-all rounded-xl bg-transparent"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Google
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}