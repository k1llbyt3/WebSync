
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { useUser, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { doc } from "firebase/firestore";
import { Icons } from "@/components/icons";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const avatar = PlaceHolderImages.find((img) => img.id === 'avatar1');

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState(avatar?.imageUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || avatar?.imageUrl || "");
    }
  }, [user, avatar]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName });

      // Update Firestore user document
      const userDocRef = doc(firestore, "users", user.uid);
      updateDocumentNonBlocking(userDocRef, { name: displayName, displayName });

      toast({
        title: "Profile Saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app, you'd upload this file to Firebase Storage
      // and get a download URL to update the user's photoURL.
      // For now, we'll just simulate it.
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoURL(event.target.result as string);
          toast({
            title: "Photo Updated (Simulated)",
            description: "In a real app, this would be uploaded and saved.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  if (isUserLoading) {
    return (
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-4">
                {photoURL && <Image
                  src={photoURL}
                  alt="User avatar"
                  width={80}
                  height={80}
                  className="rounded-full"
                  data-ai-hint={avatar?.imageHint}
                />}
                <Button variant="outline" onClick={triggerFileSelect}>Change Photo</Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Icons.bot className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize the look, feel, and sound of your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-white/5">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Icons.moon className="h-4 w-4" /> Dark Mode
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle system dark mode preference.
                  </p>
                </div>
                <ThemeCustomizer />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-white/5">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Icons.sparkles className="h-4 w-4 text-purple-400" /> UI Animations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enable rich glassmorphism and motion effects.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-white/5">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Icons.bell className="h-4 w-4 text-blue-400" /> Sound Effects
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Play subtle sounds on task completion.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Ambient Focus Section */}
              <div className="rounded-lg border p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 text-purple-300">
                      <Icons.target className="h-4 w-4" /> Zen Zone (Ambient Focus)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Background soundscapes for deep work.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Rain', 'Cafe', 'White Noise'].map((sound) => (
                    <Button key={sound} variant="outline" size="sm" className="w-full text-xs">
                      {sound}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and summaries via email.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Task Mentions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone @mentions you in a task.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">New Assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you are assigned to a new task.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end">
                <Button>Save Notifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
