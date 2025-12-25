"use client";

import { useMemo } from "react";
import { useAuth, useCollection, useFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Task } from "@/components/add-task-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Calendar, Bot } from "lucide-react";

import { useRouter } from "next/navigation";

export default function SmartBriefPage() {
    const { firestore, user } = useFirebase();
    const router = useRouter();

    const tasksQuery = useMemo(() => {
        if (!user) return null;
        return query(collection(firestore, "tasks"), where("userIds", "array-contains", user.uid));
    }, [firestore, user?.uid]);

    const { data: tasks } = useCollection<Task>(tasksQuery);

    const smartFocus = useMemo(() => {
        if (!tasks || !user) return { critical: [], today: [], upcoming: [] };

        // Strict Ownership: Only tasks assigned TO me
        const myTasks = tasks.filter(t => t.assigneeId === user.uid);

        const now = new Date();
        const todayStr = format(now, "yyyy-MM-dd");

        const critical = myTasks.filter(t => t.priority <= 3 && t.status !== "Completed");
        const today = myTasks.filter(t => t.dueDate && format(new Date(t.dueDate.seconds * 1000), "yyyy-MM-dd") === todayStr && t.status !== "Completed");
        const upcoming = myTasks.filter(t => (t.priority > 3 && t.priority <= 7) && t.status !== "Completed" && (!t.dueDate || format(new Date(t.dueDate.seconds * 1000), "yyyy-MM-dd") !== todayStr)).slice(0, 3);

        return { critical, today, upcoming };
    }, [tasks, user]);

    return (
        <div className="flex h-full flex-col p-6 gap-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] -z-10" />

            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                    Today's Critical Brief
                </h1>
                <p className="text-muted-foreground">Focus on what truly matters right now.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Critical Section */}
                <Card className="bg-red-950/20 border-red-500/20 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" /> Urgent Attention
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {smartFocus.critical.length === 0 && <p className="text-sm text-muted-foreground">No critical tasks. Breathe easy.</p>}
                        {smartFocus.critical.map(task => (
                            <div
                                key={task.id}
                                onClick={() => router.push(`/tasks?taskId=${task.id}`)}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-between cursor-pointer hover:bg-red-500/20 transition-colors active:scale-95"
                            >
                                <span className="font-medium text-sm truncate">{task.title}</span>
                                <span className="text-xs bg-red-500/20 px-2 py-1 rounded text-red-300">High</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Today Section */}
                <Card className="bg-blue-950/20 border-blue-500/20 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Calendar className="h-5 w-5" /> Due Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {smartFocus.today.length === 0 && <p className="text-sm text-muted-foreground">Clear schedule for today.</p>}
                        {smartFocus.today.map(task => (
                            <div
                                key={task.id}
                                onClick={() => router.push(`/tasks?taskId=${task.id}`)}
                                className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-between cursor-pointer hover:bg-blue-500/20 transition-colors active:scale-95"
                            >
                                <span className="font-medium text-sm truncate">{task.title}</span>
                                <span className="text-xs text-blue-300">
                                    {task.priority <= 3 ? "High" : task.priority <= 7 ? "Medium" : "Low"}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Upcoming/Suggested */}
                <Card className="bg-purple-950/20 border-purple-500/20 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-400">
                            <Bot className="h-5 w-5" /> AI Suggested
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {smartFocus.upcoming.map(task => (
                            <div
                                key={task.id}
                                onClick={() => router.push(`/tasks?taskId=${task.id}`)}
                                className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/10 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity cursor-pointer active:scale-95 transition-transform"
                            >
                                <span className="font-medium text-sm truncate">{task.title}</span>
                                <ArrowRight className="h-4 w-4 text-purple-400" />
                            </div>
                        ))}
                        {smartFocus.upcoming.length === 0 && <p className="text-sm text-muted-foreground">AI is analyzing your flow...</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Interactive "Clear" Button */}
            <motion.div
                className="mt-auto flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    onClick={() => router.push('/focus')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
                >
                    Start Focus Session
                </button>
            </motion.div>
        </div>
    );
}
