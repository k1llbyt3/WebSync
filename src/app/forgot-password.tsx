"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email.",
        variant: "destructive",
      });
      return;
    }
    if (!auth) {
      toast({
        title: "Error",
        description: "Auth not initialized yet.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset Sent",
        description: "Check your email for reset instructions.",
      });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not send reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your account email to receive reset instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReset} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
