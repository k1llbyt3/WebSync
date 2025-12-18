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
import { useUser, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { doc } from "firebase/firestore";
import { Icons } from "@/components/icons";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, CloudRain, Wind, Radio, Music, Volume1 } from "lucide-react";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { playAmbience, stopAmbience } = useSoundEffects();

  const avatar = PlaceHolderImages.find((img) => img.id === 'avatar1');

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState(avatar?.imageUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState<string | null>(null);

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
      await updateDocumentNonBlocking(userDocRef, {
        name: displayName,
        displayName,
        photoURL: photoURL
      });

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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoURL(event.target.result as string);
          toast({
            title: "Photo Updated",
            description: "Remember to save your profile to persist changes.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAmbience = (type: "rain" | "wind" | "white_noise") => {
    if (activeAmbience === type) {
      stopAmbience();
      setActiveAmbience(null);
    } else {
      playAmbience(type);
      setActiveAmbience(type);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  if (isUserLoading) {
    return (
      <div className="grid gap-8 p-6 max-w-6xl mx-auto">
        <div>
          <Skeleton className="h-12 w-48 mb-2 bg-white/10" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-white/5" />
          <Skeleton className="h-96 w-full bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 p-6 max-w-6xl mx-auto pb-20">

      {/* Header */}
      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 w-fit pb-1">
          Settings & Preferences
        </h1>
        <p className="text-gray-400 text-lg">
          Personalize your WorkSync experience.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full relative z-10">
        <div className="sticky top-0 z-50 pb-6 bg-black/50 backdrop-blur-xl -mx-6 px-6 pt-2">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-900/80 border border-white/10 p-1.5 h-12 rounded-full shadow-lg">
            <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all text-xs font-medium uppercase tracking-wide">
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all text-xs font-medium uppercase tracking-wide">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all text-xs font-medium uppercase tracking-wide">
              Alerts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Content */}
        <TabsContent value="profile" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Avatar */}
            <Card className="md:col-span-1 bg-gray-900/40 backdrop-blur-2xl border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-8 flex flex-col items-center gap-6 relative z-10">
                <div className="relative group/avatar cursor-pointer" onClick={triggerFileSelect}>
                  <div className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl font-bold text-white border-4 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-300 group-hover/avatar:scale-105 ${photoURL ? '' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                    {photoURL ? (
                      <Image
                        src={photoURL}
                        alt="User avatar"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Logic for consistent cool gradient avatar if no image
                      <div style={{ background: `linear-gradient(135deg, hsl(${(displayName?.charCodeAt(0) || 65) * 10}, 70%, 50%), hsl(${(displayName?.charCodeAt(0) || 65) * 10 + 40}, 70%, 40%))` }}
                        className="w-full h-full flex items-center justify-center">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-sm">
                    <Icons.upload className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{displayName || 'Anonymous User'}</h2>
                  <p className="text-sm text-blue-300 font-medium">{email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={triggerFileSelect} className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 px-6">
                  Upload New Photo
                </Button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
              </CardContent>
            </Card>

            {/* Right Column: Details */}
            <Card className="md:col-span-2 bg-gray-900/40 backdrop-blur-2xl border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">Account Details</CardTitle>
                <CardDescription className="text-gray-400">Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-300 font-medium ml-1">Display Name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-black/40 border-white/10 focus-visible:ring-blue-500/50 h-12 rounded-xl text-lg px-4"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium ml-1">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-black/20 border-white/5 opacity-60 h-12 rounded-xl px-4 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground ml-1">Email cannot be changed via settings.</p>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 text-white font-medium px-8 py-6 rounded-xl transition-all hover:scale-105 active:scale-95">
                    {isSaving && <Icons.bot className="mr-2 h-5 w-5 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Content */}
        <TabsContent value="preferences" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Zen Zone - Main Focus */}
            <Card className="xl:col-span-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-purple-500/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      <Icons.target className="h-6 w-6 text-purple-400" />
                      Zen Zone
                    </CardTitle>
                    <CardDescription className="text-purple-200/60 font-medium">
                      High-fidelity ambient soundscapes for deep focus.
                    </CardDescription>
                  </div>
                  {activeAmbience && (
                    <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold text-purple-300 animate-pulse">
                      <Volume2 className="h-3 w-3" /> Playing
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: "rain", label: "Heavy Rain", icon: CloudRain },
                    { id: "white_noise", label: "White Noise", icon: Radio },
                    { id: "wind", label: "Deep Wind", icon: Wind },
                  ].map((sound) => {
                    const isActive = activeAmbience === sound.id;
                    return (
                      <button
                        key={sound.id}
                        onClick={() => toggleAmbience(sound.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 group/btn relative overflow-hidden",
                          isActive
                            ? "bg-purple-500/30 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] scale-105"
                            : "bg-black/20 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-full transition-colors",
                          isActive ? "bg-white text-purple-900" : "bg-white/5 text-purple-300 group-hover/btn:bg-white/10"
                        )}>
                          <sound.icon className="h-6 w-6" />
                        </div>
                        <span className={cn("font-medium", isActive ? "text-white" : "text-gray-400 group-hover/btn:text-white")}>{sound.label}</span>
                        {isActive && (
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => { stopAmbience(); setActiveAmbience(null); }}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all group/stop"
                  >
                    <div className="p-3 rounded-full bg-red-500/10 text-red-400 group-hover/stop:bg-red-500/20 transition-colors">
                      <VolumeX className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-red-300/60 group-hover/stop:text-red-300">Stop Audio</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* General Toggles */}
            <div className="space-y-6">
              <Card className="bg-gray-900/40 backdrop-blur-2xl border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Visuals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Glassmorphism</div>
                      <div className="text-xs text-gray-400">Enable transparency blur.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Animations</div>
                      <div className="text-xs text-gray-400">Reduce motion for performance.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/40 backdrop-blur-2xl border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">UI Sounds</div>
                      <div className="text-xs text-gray-400">Clicks and hover effects.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Content - Keeping Simple but Glassy */}
        <TabsContent value="notifications" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <Card className="bg-gray-900/40 backdrop-blur-2xl border-white/10 shadow-xl max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-400">Control how and when you get pinged.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { title: "Task Assignments", desc: "When tasks are assigned to you." },
                  { title: "Due Date Reminders", desc: "24h before a task is due." },
                  { title: "Mentions", desc: "When someone @mentions you in comments." },
                  { title: "System Updates", desc: "New features and maintenance alerts." },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/30 transition-colors">
                    <div>
                      <h4 className="flex items-center gap-2 font-medium text-white">
                        <Icons.bell className="h-3.5 w-3.5 text-pink-400" />
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
