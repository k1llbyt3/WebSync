"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, firestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { Loader2, Sparkles, User, Mail, Lock, ArrowRight, Check, X, Command, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CoolLoading } from "@/components/cool-loading";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Clear error on type
  useEffect(() => {
    if (error) setError(null);
  }, [name, email, password]);

  // Password Rules Logic
  const passwordRequirements = {
    length: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  // Cool Loading Sequence
  useEffect(() => {
    if (isLoading) {
      const texts = ["Creating your profile...", "Setting up your workspace...", "Finalizing setup..."];
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < texts.length - 1 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isLoading]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    setIsLoading(true);

    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential?.user) {
        // 2. Update Profile Name
        await updateProfile(userCredential.user, { displayName: name });

        // 3. Create Firestore Document
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name,
          email,
          createdAt: new Date(),
        });

        // 4. Redirect (No Toast)
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setIsLoading(false);

      let description = "Could not create account. Please try again.";
      if (error?.code === "auth/email-already-in-use") description = "This email is already registered.";
      if (error?.code === "auth/weak-password") description = "Password is too weak.";
      if (error?.code === "auth/invalid-email") description = "Invalid email address.";

      setError(description);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Ensure user doc exists even for Google Sign-in
      if (result.user) {
        await setDoc(doc(firestore, "users", result.user.uid), {
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          createdAt: new Date(),
        }, { merge: true }); // Merge prevents overwriting existing data if they log in again
      }

      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "Google sign-up failed.");
    }
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return <CoolLoading />;
  }

  // --- SIGNUP FORM ---
  return (
    <div className="w-full h-full flex items-center justify-center relative p-4">
      {/* Background Decor handled by layout */}

      <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in-95 duration-700">



        {/* Card with Cool Borders */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-tilt"></div>

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
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Create Account</h1>
              <p className="text-white/60 mt-1 text-xs">Start managing your tasks effectively.</p>
            </div>

            <form onSubmit={handleSignup} className="grid gap-5">

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-white text-sm py-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="full-name" className="text-xs font-medium uppercase tracking-wide text-white/70 ml-1">Full Name</Label>
                <div className="relative">
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    required
                    className="pl-3 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-white/70 ml-1">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="pl-3 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-white/70 ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-3 h-11 bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Modern Password Strength UI */}
                <div className="mt-2 space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Requirements</p>

                  <div className="grid grid-cols-1 gap-1.5">
                    <RequirementItem valid={passwordRequirements.length} text="At least 6 characters" />
                    <RequirementItem valid={passwordRequirements.hasNumber} text="Contains a number" />
                    <RequirementItem valid={passwordRequirements.hasSpecial} text="Contains special character" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 rounded-xl mt-2 bg-gradient-to-r from-purple-600 to-pink-600 border-none">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center gap-4 my-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs uppercase text-white/50 font-medium">Or join with</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-white/10 hover:bg-white/5 text-white hover:text-white hover:border-white/20 transition-all rounded-xl bg-transparent"
                onClick={handleGoogleSignUp}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Google
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-all">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Helper Component for Password Requirement
function RequirementItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {valid ? (
        <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
          <Check className="h-2.5 w-2.5 text-green-500" />
        </div>
      ) : (
        <div className="h-4 w-4 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
      )}
      <span className={`text-xs transition-colors duration-300 ${valid ? "text-white font-medium" : "text-white/50"}`}>
        {text}
      </span>
    </div>
  )
}