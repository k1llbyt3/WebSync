"use client";

import { useEffect, useState } from "react";
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
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, firestore } from "@/firebase"; // ✅ fixed
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  // ---- All hooks must be declared unconditionally and in the same order every render ----
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordRequirements = {
    length: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const isPasswordValid = passwordRequirements.length && passwordRequirements.hasNumber && passwordRequirements.hasSpecial;

  // hydration guard state — declared like any other hook (important: declared before any early return)
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // run after mount to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  // only short-circuit the render AFTER all hooks have been declared
  if (!mounted) return null;

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: "Signup Failed",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (userCredential?.user) {
        await updateProfile(userCredential.user, { displayName: name });

        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name,
          email,
        });

        toast({
          title: "Account Created",
          description: "Redirecting to dashboard...",
        });

        router.push("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description:
          error?.code === "auth/email-already-in-use"
            ? "Email already in use."
            : "Could not create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <div className="text-xs space-y-1 mt-1">
              <p className="font-medium text-muted-foreground mb-1">Password must contain:</p>
              <div className="flex items-center gap-2">
                {passwordRequirements.length ? (
                  <Icons.check className="h-3 w-3 text-green-600" />
                ) : (
                  <Icons.close className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={passwordRequirements.length ? "text-green-600" : "text-muted-foreground"}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordRequirements.hasNumber ? (
                  <Icons.check className="h-3 w-3 text-green-600" />
                ) : (
                  <Icons.close className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={passwordRequirements.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                  At least one number (0-9)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordRequirements.hasSpecial ? (
                  <Icons.check className="h-3 w-3 text-green-600" />
                ) : (
                  <Icons.close className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={passwordRequirements.hasSpecial ? "text-green-600" : "text-muted-foreground"}>
                  At least one special character (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.bot className="mr-2 h-4 w-4 animate-spin" />}
            Create an account
          </Button>

          <Button variant="outline" className="w-full" disabled={isLoading}>
            Sign up with Google
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
