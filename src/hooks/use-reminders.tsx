"use client";

import { useEffect, useRef } from "react";
import { useFirebase, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Task } from "@/components/add-task-form";
import { useToast } from "@/hooks/use-toast";

export function useReminders() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const hasNotified = useRef(false);

    // Simple query: Tasks for this user
    const q = user ? query(collection(firestore, "tasks"), where("userIds", "array-contains", user.uid)) : null;
    const { data: tasks } = useCollection<Task>(q);

    useEffect(() => {
        if (!tasks || hasNotified.current) return;

        const urgentCount = tasks.filter(t => t.priority <= 2 && t.status !== "Completed").length;

        if (urgentCount > 0) {
            const lastNotified = localStorage.getItem("last_urgent_notify");
            const now = Date.now();

            // Notify only if never notified or > 1 hour ago
            if (!lastNotified || (now - parseInt(lastNotified)) > 60 * 60 * 1000) {
                setTimeout(() => {
                    toast({
                        title: "Urgent: Action Required",
                        description: `You have ${urgentCount} high-priority tasks pending!`,
                        variant: "destructive",
                        action: <div onClick={() => localStorage.setItem("last_urgent_notify", Date.now().toString())} />
                    });
                    // Set timestamp
                    localStorage.setItem("last_urgent_notify", now.toString());
                }, 3000);
            }
            hasNotified.current = true;
        }
    }, [tasks, toast]);
}
