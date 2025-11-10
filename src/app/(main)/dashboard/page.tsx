
"use client";

import { useMemo } from "react";
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Icons } from "@/components/icons";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Task } from "@/components/add-task-form";
import { format, subMonths, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  created: {
    label: "Created",
    color: "hsl(var(--chart-2))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
};

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  
  const allTasksQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    const tasksCollection = collection(firestore, 'tasks');
    return query(tasksCollection, where('userIds', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(allTasksQuery);

  const taskCounts = useMemo(() => {
    if (!tasks) return { todo: 0, inProgress: 0, completed: 0, overdue: 0, totalProjects: 0 };
    const now = new Date();
    
    const counts = tasks.reduce((acc, task) => {
        if (task.status === 'Backlog' || task.status === 'To-Do') acc.todo++;
        if (task.status === 'In Progress') acc.inProgress++;
        if (task.status === 'Completed') acc.completed++;
        if (task.dueDate?.seconds * 1000 < now.getTime() && task.status !== 'Completed') acc.overdue++;
        if (task.tags) {
            task.tags.forEach(tag => acc.projects.add(tag));
        }
        return acc;
    }, { todo: 0, inProgress: 0, completed: 0, overdue: 0, projects: new Set<string>() });
    
    return { ...counts, totalProjects: counts.projects.size };
  }, [tasks]);

  const projects = useMemo(() => {
      if (!tasks) return [];
      const projectMap = new Map<string, {name: string, total: number, completed: number}>();
      tasks.forEach(task => {
          (task.tags && task.tags.length > 0 ? task.tags : ['General']).forEach(tag => {
              if (!projectMap.has(tag)) {
                  projectMap.set(tag, { name: tag, total: 0, completed: 0 });
              }
              const project = projectMap.get(tag)!;
              project.total++;
              if (task.status === 'Completed') {
                  project.completed++;
              }
          });
      });
      return Array.from(projectMap.values()).map(p => ({
          ...p,
          progress: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0,
          status: p.total > 0 && p.completed === p.total ? "Completed" : "In Progress"
      })).slice(0, 3); // Limit to 3 projects for overview
  }, [tasks]);

  const chartData = useMemo(() => {
    if (!tasks) return [];
    
    const sixMonthsAgo = subMonths(new Date(), 5);
    const monthStarts = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(new Date(), 5 - i)));

    const monthlyData = monthStarts.map(monthStart => ({
        date: format(monthStart, "MMM"),
        created: 0,
        completed: 0
    }));

    tasks.forEach(task => {
        const taskCreatedAt = new Date(task.createdAt.seconds * 1000);
        if (taskCreatedAt >= sixMonthsAgo) {
            const taskMonthStr = format(taskCreatedAt, "MMM");
            const monthData = monthlyData.find(d => d.date === taskMonthStr);
            if (monthData) {
                monthData.created++;
                if (task.status === 'Completed' && task.dueDate) {
                   const taskCompletedAt = new Date(task.dueDate.seconds * 1000);
                   const completedMonthStr = format(taskCompletedAt, "MMM");
                   const completedMonthData = monthlyData.find(d => d.date === completedMonthStr);
                   if (completedMonthData) {
                       completedMonthData.completed++;
                   }
                }
            }
        }
    });

    return monthlyData;
  }, [tasks]);

  const recentActivities = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      .slice(0, 4)
      .map(task => ({
        id: task.id,
        user: "You", // This would need a user map to be more accurate
        action: "created",
        task: task.title,
        time: format(new Date(task.createdAt.seconds * 1000), "dd MMM"),
      }));
  }, [tasks]);


  const renderStatCard = (title: string, value: number, description: string, icon: keyof typeof Icons, loading: boolean) => {
    const Icon = Icons[icon];
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-16"/> : <div className="text-2xl font-bold">{value}</div>}
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
  }
  
  const handleProjectClick = (projectName: string) => {
    router.push(`/tasks?project=${encodeURIComponent(projectName)}`);
  };


  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard("To-Do", taskCounts.todo, `${taskCounts.overdue} overdue`, 'tasks', isLoadingTasks)}
        {renderStatCard("In Progress", taskCounts.inProgress, `Across all projects`, 'bot', isLoadingTasks)}
        {renderStatCard("Completed", taskCounts.completed, `All time`, 'check', isLoadingTasks)}
        {renderStatCard("Active Projects", taskCounts.totalProjects, ``, 'logo', isLoadingTasks)}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Task Trends</CardTitle>
            <CardDescription>
              Tasks created vs. completed over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                {isLoadingTasks ? <div className="h-full w-full flex items-center justify-center"><Skeleton className="h-full w-full"/></div> : 
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20 }}>
                   <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend contentStyle={{ color: 'hsl(var(--muted-foreground))' }} />
                  <Area
                    dataKey="created"
                    type="monotone"
                    fill="url(#colorCreated)"
                    stroke="hsl(var(--chart-2))"
                    stackId="1"
                    name="Created"
                  />
                  <Area
                    dataKey="completed"
                    type="monotone"
                    fill="url(#colorCompleted)"
                    stroke="hsl(var(--chart-1))"
                    stackId="1"
                    name="Completed"
                  />
                </AreaChart>}
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              What's been happening across your projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoadingTasks ? Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[100px]" />
                    </div>
                </div>
            )) : recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Icons.users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">
                    {activity.user}{" "}
                    <span className="font-normal text-muted-foreground">
                      {activity.action} "{activity.task}"{" "}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>Current status of all active projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoadingTasks ? Array.from({length: 2}).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                )) : projects.length > 0 ? projects.map(project => (
                    <div key={project.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-muted-foreground">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} aria-label={`${project.name} progress`} />
                        <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">{project.status}</span>
                             <Button variant="link" className="h-auto p-0 text-xs" onClick={() => handleProjectClick(project.name)}>View Project</Button>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No projects found. Add tags to tasks to create projects.</p>
                )}
            </CardContent>
        </Card>
       <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-5 w-5 text-primary" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>
              Let our AI analyze your workflow and provide you with actionable insights for better efficiency.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
             <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Trending Task:</span> You've created 5 tasks related to "API" this week. Consider creating a dedicated project or tag.
             </p>
            <Button>Generate new insight</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    