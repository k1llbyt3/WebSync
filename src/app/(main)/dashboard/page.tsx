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
    if (!tasks || !user) return { active: 0, completed: 0, inbox: 0, high: 0, med: 0, low: 0 };

    // Strict Ownership: Only tasks assigned TO me (assigneeId === user.uid)
    const myWorkload = tasks.filter(t => t.assigneeId === user.uid);

    return {
      active: myWorkload.filter(t => t.status !== 'Completed' && t.status !== 'Pending').length,
      completed: myWorkload.filter(t => t.status === 'Completed').length,
      inbox: myWorkload.filter(t => t.status === 'Pending').length,
      high: myWorkload.filter(t => t.priority <= 3 && t.status !== 'Completed').length, // Exclude completed
      med: myWorkload.filter(t => t.priority > 3 && t.priority <= 7 && t.status !== 'Completed').length,
      low: myWorkload.filter(t => t.priority > 7 && t.status !== 'Completed').length,
    }
  }, [tasks, user]);

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
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20" asChild>
                <Link href="/codegen">
                  Launch Dev Tools <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/5 border-white/10 hover:bg-white/10 text-blue-200" asChild>
                <Link href="/tasks">
                  View Tasks
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Column */}
        <div className="flex flex-col gap-4">
          {[
            { title: "Active Tasks", value: stats.active, icon: Zap, color: "from-blue-600/30 to-blue-900/10", border: "border-blue-400/30", trend: "Current Load", href: "/tasks" },
            { title: "Inbox", value: stats.inbox, icon: Icons.inbox, color: "from-orange-600/30 to-orange-900/10", border: "border-orange-400/30", trend: "Pending Triage", href: "/tasks?tab=inbox" },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, translateX: -5 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex-1 cursor-pointer"
            >
              <Link href={stat.href} className="block h-full">
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
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="col-span-2 bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 600 }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3b82f6"
                  strokeWidth={4}
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
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
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
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1500}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="stroke-background hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-2xl font-bold">
                    {stats.active}
                  </text>
                  <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-xs font-medium uppercase tracking-wider">
                    Active
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
                <div className="p-4 rounded-full bg-white/5 border border-white/5">
                  <PieIcon className="h-8 w-8 opacity-40" />
                </div>
                <span>No data available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Actions */}
      {/* Secondary Actions */}
      <h3 className="text-lg font-semibold text-gray-400 mt-2">Quick Shortcuts</h3>
      <div className="grid gap-4 md:grid-cols-4 relative z-20">
        {[
          { title: "Plan Meeting", icon: Icons.meetings, href: "/meetings", bg: "bg-cyan-500", text: "Co-Pilot" },
          { title: "Focus Mode", icon: Target, href: "/focus", bg: "bg-emerald-500", text: "Flow State" },
          { title: "Snippets", icon: Icons.bot, href: "/snippets", bg: "bg-purple-500", text: "Library" },
          { title: "Reminders", icon: Icons.bell, href: "/reminders", bg: "bg-pink-500", text: "Timeline" },
          { title: "Dev Kit", icon: Icons.gitBranch, href: "/devkit", bg: "bg-orange-500", text: "Utilities" },
          { title: "Settings", icon: Icons.settings, href: "/settings", bg: "bg-gray-500", text: "Configure" },
        ].map((item, i) => (
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
