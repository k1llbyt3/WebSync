"use client";
import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import Link from 'next/link';
import { useCollection, useFirebase } from "@/firebase";
import { collection, query, where } from 'firebase/firestore';
import { Task } from '@/components/add-task-form';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from "framer-motion";
import { ArrowUpRight, Zap, Target, Layout } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    if (value === 0) { setDisplayValue(0); return; }

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const myTasksQuery = useMemo(() => {
    if (!user) return null;
    const tasksCollection = collection(firestore, 'tasks');
    return query(tasksCollection, where('userIds', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(myTasksQuery);

  const stats = useMemo(() => {
    if (!tasks) return { active: 0, completed: 0, inbox: 0 };
    return {
      active: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Pending').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      inbox: tasks.filter(t => t.status === 'Pending').length,
    }
  }, [tasks]);

  const quickActions = [
    { label: "New Task", icon: Icons.plus, href: "/tasks", color: "text-blue-400" },
    { label: "Start Focus", icon: Target, href: "#", color: "text-purple-400" }, // Handled via global dialog usually
    { label: "Settings", icon: Icons.settings, href: "/settings", color: "text-gray-400" },
  ];

  return (
    <div className="flex h-full flex-col gap-10 p-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
          {greeting}, {user?.displayName?.split(' ')[0] || 'Member'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to conquer your day? Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Active Tasks", value: stats.active, icon: Zap, color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20", trend: "+2 this week" },
          { title: "Completed", value: stats.completed, icon: Icons.listChecks, color: "from-green-500/20 to-green-500/5", border: "border-green-500/20", trend: "+5 this week" },
          { title: "Inbox", value: stats.inbox, icon: Icons.inbox, color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20", trend: "3 new" },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <Card className={`relative overflow-hidden border ${stat.border} bg-gradient-to-br ${stat.color} backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <stat.icon className="h-24 w-24" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {isLoadingTasks ? <Skeleton className="h-10 w-20" /> : <AnimatedCounter value={stat.value} />}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" /> {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump back into your workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Tasks", icon: Icons.tasks, href: "/tasks", bg: "bg-blue-500/10 text-blue-400" },
              { title: "Meetings", icon: Icons.meetings, href: "/meetings", bg: "bg-purple-500/10 text-purple-400" },
              { title: "Dev Tools", icon: Icons.codegen, href: "/codegen", bg: "bg-pink-500/10 text-pink-400" },
              { title: "Reminders", icon: Icons.bell, href: "/reminders", bg: "bg-yellow-500/10 text-yellow-400" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="group flex flex-col items-center justify-center p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                <div className={`p-3 rounded-full mb-3 ${item.bg} group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-sm">{item.title}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Ambient Focus Promo */}
        <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-white/10 relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/30 blur-[50px] rounded-full group-hover:bg-purple-500/50 transition-colors" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Ambient Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Enhance your productivity with immersive soundscapes.
            </p>
            <Button variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/20 text-purple-300" asChild>
              <Link href="/settings">Configure Zen Zone</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
