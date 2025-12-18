"use client";

import { useEffect } from "react";
import { useFirebase } from "@/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { differenceInHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function useAutoPriority() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;

        const checkAndUpgrade = async () => {
            try {
                const tasksRef = collection(firestore, "tasks");
                // Get tasks that are NOT completed and have a due date
                // We get all and filter client side for complex date logic or use simple query
                const q = query(
                    tasksRef,
                    where("userIds", "array-contains", user.uid),
                    where("status", "!=", "Completed")
                );

                const snapshot = await getDocs(q);
                const batch = writeBatch(firestore);
                let upgradeCount = 0;

                snapshot.docs.forEach((d) => {
                    const data = d.data();
                    if (!data.dueDate || !data.dueDate.seconds) return;

                    const dueDate = new Date(data.dueDate.seconds * 1000);
                    const now = new Date();
                    const hoursLeft = differenceInHours(dueDate, now);

                    // If due within 24 hours and priority > 1 (not highest), upgrade it to 1 (Highest)
                    if (hoursLeft <= 24 && hoursLeft > -24 && data.priority > 1) {
                        batch.update(doc(firestore, "tasks", d.id), { priority: 1 });
                        upgradeCount++;
                    }
                });

                if (upgradeCount > 0) {
                    await batch.commit();
                    toast({
                        title: "Auto-Priority Active",
                        description: `Upgraded ${upgradeCount} urgent tasks to High Priority.`,
                    });
                }
            } catch (error) {
                console.error("Auto-priority failed:", error);
            }
        };

        // Run once on mount
        checkAndUpgrade();
    }, [user, firestore, toast]);
}
