"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!auth) {
      toast({
        title: "Login Failed",
        description: "Authentication not initialized yet. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let description = "An unexpected error occurred. Please try again.";
      
      // Show detailed error message
      if (error?.code === "auth/invalid-credential") {
        description = "Invalid email or password. Please create an account first at /signup";
      } else if (error?.code === "auth/wrong-password") {
        description = "Wrong password. Please try again.";
      } else if (error?.code === "auth/user-not-found") {
        description = "No account found. Please sign up first at /signup";
      } else if (error?.code === "auth/configuration-not-found") {
        description = "Firebase Email/Password auth is not enabled. Please enable it in Firebase Console.";
      } else if (error?.message) {
        description = error.message;
      }
      
      toast({
        title: "Login Failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in handler (works if you have google provider enabled in Firebase)
  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Login Failed",
        description: "Authentication not initialized yet. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in with Google", description: "Redirecting..." });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Google Sign-In Failed",
        description: err?.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="bg-background/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              className="bg-background/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.bot className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
          <Button variant="outline" className="w-full" disabled={isLoading} onClick={handleGoogleSignIn}>
            {isLoading ? <Icons.bot className="mr-2 h-4 w-4 animate-spin" /> : null}
            Login with Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
