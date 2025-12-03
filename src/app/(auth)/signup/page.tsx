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
import { Loader2, Sparkles, User, Mail, Lock, ArrowRight, Check, X, Command } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const router = useRouter();
  const { toast } = useToast();

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

    if (!name || !email || !password) {
      toast({ title: "Missing Fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    
    if (!isPasswordValid) {
      toast({ title: "Weak Password", description: "Please meet all password requirements.", variant: "destructive" });
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
      
      let description = "Could not create account.";
      if (error?.code === "auth/email-already-in-use") description = "This email is already registered.";
      if (error?.code === "auth/weak-password") description = "Password is too weak.";
      
      toast({ title: "Signup Failed", description, variant: "destructive" });
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
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
      toast({ title: "Google Sign-Up Failed", description: err?.message, variant: "destructive" });
    }
  };

  // --- LOADING STATE (The "Wait" Experience) ---
  if (isLoading) {
    const loadingTexts = ["Creating your profile...", "Setting up your workspace...", "Finalizing setup..."];
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full border-b-4 border-r-4 border-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingTexts[loadingStep]}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Welcome to the team!
          </p>
        </div>
      </div>
    );
  }

  // --- SIGNUP FORM ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
            <Command className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Start managing your tasks effectively.</p>
        </div>

        {/* Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSignup} className="grid gap-5">
            
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  required
                  className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* Modern Password Strength UI */}
              <div className="mt-2 space-y-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                
                <div className="grid grid-cols-1 gap-1.5">
                    <RequirementItem valid={passwordRequirements.length} text="At least 6 characters" />
                    <RequirementItem valid={passwordRequirements.hasNumber} text="Contains a number" />
                    <RequirementItem valid={passwordRequirements.hasSpecial} text="Contains special character" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 mt-2">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or join with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 border-muted-foreground/20 hover:bg-muted/50" onClick={handleGoogleSignUp}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Google
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
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
                <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-green-600" />
                </div>
            ) : (
                <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                </div>
            )}
            <span className={`text-xs transition-colors duration-300 ${valid ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {text}
            </span>
        </div>
    )
}