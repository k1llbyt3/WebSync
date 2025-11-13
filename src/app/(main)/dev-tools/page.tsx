"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function DevToolsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskCount, setTaskCount] = useState<number | null>(null);

  const addSampleTasks = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add sample tasks",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const tasksRef = collection(firestore, 'tasks');
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const sampleTasks = [
        {
          title: "Design landing page",
          description: "Create a modern landing page with hero section and features",
          status: "To-Do",
          priority: 3,
          userId: user.uid,
          assigneeId: user.uid,
          userIds: [user.uid],
          tags: ["Design", "Frontend"],
          dueDate: nextWeek,
          createdAt: new Date(),
        },
        {
          title: "Setup authentication",
          description: "Implement Firebase authentication with email/password",
          status: "In Progress",
          priority: 2,
          userId: user.uid,
          assigneeId: user.uid,
          userIds: [user.uid],
          tags: ["Backend", "Security"],
          dueDate: tomorrow,
          createdAt: new Date(),
        },
        {
          title: "Write API documentation",
          description: "Document all API endpoints with examples",
          status: "Backlog",
          priority: 5,
          userId: user.uid,
          assigneeId: user.uid,
          userIds: [user.uid],
          tags: ["Documentation"],
          dueDate: nextWeek,
          createdAt: new Date(),
        },
        {
          title: "Code review PR #123",
          description: "Review and approve the new feature implementation",
          status: "Review",
          priority: 4,
          userId: user.uid,
          assigneeId: user.uid,
          userIds: [user.uid],
          tags: ["Code Review"],
          dueDate: today,
          createdAt: new Date(),
        },
        {
          title: "Deploy to production",
          description: "Deploy the latest version to production environment",
          status: "Completed",
          priority: 2,
          userId: user.uid,
          assigneeId: user.uid,
          userIds: [user.uid],
          tags: ["DevOps"],
          dueDate: today,
          createdAt: new Date(),
        },
      ];

      let addedCount = 0;
      for (const task of sampleTasks) {
        await addDoc(tasksRef, task);
        addedCount++;
      }

      toast({
        title: "Success!",
        description: `Added ${addedCount} sample tasks`,
      });
    } catch (error: any) {
      console.error("Error adding sample tasks:", error);
      toast({
        title: "Firebase Error",
        description: error.message || "Failed to add sample tasks. Check Firebase security rules.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const checkTasks = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      const tasksRef = collection(firestore, 'tasks');
      const snapshot = await getDocs(tasksRef);
      setTaskCount(snapshot.size);
      
      toast({
        title: "Tasks Found",
        description: `Found ${snapshot.size} tasks in database`,
      });
    } catch (error: any) {
      console.error("Error checking tasks:", error);
      toast({
        title: "Firebase Error",
        description: error.message || "Failed to check tasks. Check Firebase security rules.",
        variant: "destructive",
      });
    }
  };

  const clearAllTasks = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const tasksRef = collection(firestore, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      let deletedCount = 0;
      for (const taskDoc of snapshot.docs) {
        await deleteDoc(doc(firestore, 'tasks', taskDoc.id));
        deletedCount++;
      }

      setTaskCount(0);
      toast({
        title: "Success!",
        description: `Deleted ${deletedCount} tasks`,
      });
    } catch (error: any) {
      console.error("Error deleting tasks:", error);
      toast({
        title: "Firebase Error",
        description: error.message || "Failed to delete tasks.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Dev Tools</CardTitle>
            <CardDescription>Please log in to use developer tools</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Developer Tools</h1>
        <p className="text-muted-foreground">Test Firebase connectivity and add sample data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
            <CardDescription>Your Firebase authentication status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p className="text-green-600 flex items-center gap-2">
              <Icons.check className="h-4 w-4" />
              Authenticated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Test</CardTitle>
            <CardDescription>Check Firebase connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkTasks} variant="outline" className="w-full">
              <Icons.search className="mr-2 h-4 w-4" />
              Check Task Count
            </Button>
            {taskCount !== null && (
              <p className="text-sm text-center">Found {taskCount} tasks</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sample Data</CardTitle>
            <CardDescription>
              Add sample tasks to test the app (5 tasks across different statuses)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={addSampleTasks} 
              disabled={isAdding}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Icons.bot className="mr-2 h-4 w-4 animate-spin" />
                  Adding Sample Tasks...
                </>
              ) : (
                <>
                  <Icons.add className="mr-2 h-4 w-4" />
                  Add 5 Sample Tasks
                </>
              )}
            </Button>
            
            <Button 
              onClick={clearAllTasks} 
              disabled={isDeleting}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <Icons.bot className="mr-2 h-4 w-4 animate-spin" />
                  Deleting All Tasks...
                </>
              ) : (
                <>
                  <Icons.trash className="mr-2 h-4 w-4" />
                  Clear All Tasks
                </>
              )}
            </Button>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> If you see an error, your Firebase security rules might be blocking writes.
                Go to Firebase Console → Firestore Database → Rules and update to allow authenticated users to read/write.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
