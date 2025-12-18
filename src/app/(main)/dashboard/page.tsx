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
import { ArrowUpRight, Zap, Target, Layout, PieChart as PieIcon, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

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

// Mock Data for Charts
const activityData = [
  { name: 'Mon', tasks: 4 },
  { name: 'Tue', tasks: 3 },
  { name: 'Wed', tasks: 7 },
  { name: 'Thu', tasks: 2 },
  { name: 'Fri', tasks: 6 },
  { name: 'Sat', tasks: 3 },
  { name: 'Sun', tasks: 4 },
];

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7'];

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
  }, [firestore, user?.uid]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(myTasksQuery);

  const stats = useMemo(() => {
    if (!tasks) return { active: 0, completed: 0, inbox: 0, high: 0, med: 0, low: 0 };
    return {
      active: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Pending').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      inbox: tasks.filter(t => t.status === 'Pending').length,
      high: tasks.filter(t => t.priority <= 3).length,
      med: tasks.filter(t => t.priority > 3 && t.priority <= 7).length,
      low: tasks.filter(t => t.priority > 7).length,
    }
  }, [tasks]);

  const pieData = [
    { name: 'High Priority', value: stats.high },
    { name: 'Medium Priority', value: stats.med },
    { name: 'Low Priority', value: stats.low },
    { name: 'Completed', value: stats.completed },
  ].filter(d => d.value > 0);

  return (
    <div className="flex h-full flex-col gap-8 p-6 text-white overflow-x-hidden relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
          {greeting}, {user?.displayName?.split(' ')[0] || 'Member'}!
        </h1>
        <p className="text-gray-300 text-lg font-medium">
          Dashboard Overview
        </p>
      </div>

      {/* Dev Tools Priority Hero Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01, rotateX: 1, rotateY: 1 }}
          className="lg:col-span-2 group relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 hover:bg-blue-900/30 transition-all shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Icons.codegen className="h-64 w-64 text-blue-400 rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                  <Icons.codegen className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-blue-100">DevStudio Pro</h2>
              </div>
              <p className="text-blue-200/60 max-w-lg text-lg">
                Access your AI-powered development environment. Architect features, generate tests, and manage snippets.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/codegen">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20">
                  Launch Dev Tools <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" size="lg" className="bg-white/5 border-white/10 hover:bg-white/10 text-blue-200">
                  View Tasks
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Column */}
        <div className="flex flex-col gap-4">
          {[
            { title: "Active Tasks", value: stats.active, icon: Zap, color: "from-blue-600/30 to-blue-900/10", border: "border-blue-400/30", trend: "Current Load" },
            { title: "Inbox", value: stats.inbox, icon: Icons.inbox, color: "from-orange-600/30 to-orange-900/10", border: "border-orange-400/30", trend: "Pending Triage" },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, translateX: -5 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex-1"
            >
              <Card className={`h-full relative overflow-hidden border ${stat.border} bg-gradient-to-br ${stat.color} backdrop-blur-md shadow-lg flex flex-col justify-center`}>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <stat.icon className="h-16 w-16 text-white" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-white/80 uppercase tracking-widest">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold tracking-tighter text-white drop-shadow-sm">
                    {isLoadingTasks ? <Skeleton className="h-8 w-16 bg-white/20" /> : <AnimatedCounter value={stat.value} />}
                  </div>
                  <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1 font-semibold">
                    <ArrowUpRight className="h-3 w-3 text-white" /> {stat.trend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="col-span-2 bg-gray-900/50 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-blue-400" /> Weekly Velocity
            </CardTitle>
            <CardDescription className="text-gray-400">Task completion rate over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#60a5fa' }}
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                  isAnimationActive={true}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="bg-gray-900/50 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PieIcon className="h-5 w-5 text-purple-400" /> Compliance
            </CardTitle>
            <CardDescription className="text-gray-400">Task Priority Distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
                <div className="p-3 rounded-full bg-white/5">
                  <PieIcon className="h-6 w-6 opacity-50" />
                </div>
                <span>No data available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Actions */}
      <h3 className="text-lg font-semibold text-gray-400 mt-2">Quick Shortcuts</h3>
      <div className="grid gap-4 md:grid-cols-4 relative z-20">
        {[
          { title: "Plan Meeting", icon: Icons.meetings, href: "/meetings", bg: "bg-cyan-500", text: "Co-Pilot" },
          { title: "Focus Mode", icon: Target, href: "/focus", bg: "bg-emerald-500", text: "Flow State" },
          { title: "Settings", icon: Icons.settings, href: "/settings", bg: "bg-gray-500", text: "Configure" },
          { title: "Log Out", icon: Icons.logout, href: "#", bg: "bg-red-500", text: "Sign Out", action: () => { } }, // Handled by sidebar usually, but added for completeness if needed or replace with something else.
        ].filter(i => i.title !== "Log Out").map((item, i) => (
          <Link key={i} href={item.href} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/40 p-5 hover:bg-gray-800/60 transition-all hover:scale-[1.02] hover:shadow-lg">
            <div className={`absolute top-0 left-0 w-1 h-full ${item.bg}`} />
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${item.bg}/20 text-white`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{item.text}</div>
                <div className="font-semibold text-white/90">{item.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
