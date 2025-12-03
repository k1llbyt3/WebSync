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


const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800; // Animation duration in ms
    const steps = 30; // Number of steps
    const increment = value / steps;
    let current = 0;

    if (value === 0) {
        setDisplayValue(0);
        return;
    }

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

  const myTasksQuery = useMemo(() => {
    if (!user) return null;
    const tasksCollection = collection(firestore, 'tasks');
    return query(tasksCollection, where('userIds', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(myTasksQuery);

  const stats = useMemo(() => {
    if (!tasks) return {
      active: 0,
      completed: 0,
      inbox: 0,
    };
    return {
      active: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Pending').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      inbox: tasks.filter(t => t.status === 'Pending').length,
    }
  }, [tasks]);

  const features = [
    {
      title: "Task Management",
      description: "Organize, prioritize, and track your work with our intuitive task board.",
      icon: <Icons.tasks className="h-8 w-8 text-primary" />,
      link: "/tasks"
    },
    {
      title: "AI Meeting Co-Pilot",
      description: "Get automated summaries, action items, and insights from your meetings.",
      icon: <Icons.meetings className="h-8 w-8 text-primary" />,
      link: "/meetings"
    },
    {
      title: "Smart Reminders",
      description: "Set intelligent reminders that adapt to your workflow and priorities.",
      icon: <Icons.bell className="h-8 w-8 text-primary" />,
      link: "/reminders"
    },
    {
      title: "Developer Toolkit",
      description: "Supercharge your coding with AI-powered code generation and debugging.",
      icon: <Icons.codegen className="h-8 w-8 text-primary" />,
      link: "/codegen"
    },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s a summary of your workspace.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Icons.tasks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
                <Skeleton className="h-8 w-1/4 mt-1"/>
            ) : (
                <div className="text-3xl font-bold"><AnimatedCounter value={stats.active} /></div>
            )}
            <p className="text-xs text-muted-foreground">Tasks currently in progress or to-do</p>
          </CardContent>
        </Card>
         <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <Icons.listChecks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingTasks ? (
                <Skeleton className="h-8 w-1/4 mt-1"/>
            ) : (
                <div className="text-3xl font-bold"><AnimatedCounter value={stats.completed} /></div>
            )}
            <p className="text-xs text-muted-foreground">Tasks you have completed this week</p>
          </CardContent>
        </Card>
         <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Icons.inbox className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingTasks ? (
                <Skeleton className="h-8 w-1/4 mt-1"/>
            ) : (
                <div className="text-3xl font-bold"><AnimatedCounter value={stats.inbox} /></div>
            )}
            <p className="text-xs text-muted-foreground">New tasks assigned to you</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Explore Features</CardTitle>
          <CardDescription>Discover how WorkSync can streamline your team&apos;s productivity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Link href={feature.link} key={i} className="block group">
                 <Card className="h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/40">
                <CardHeader className="flex flex-col items-center text-center">
                  {feature.icon}
                  <CardTitle className="mt-4 text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
