import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { prioritizeTasksFromDescription } from "@/ai/flows/prioritize-tasks-from-description";
import { AddTaskFormValues } from "@/components/add-task-form";

interface AiPrioritizeDialogProps {
    onTaskCreate: (data: AddTaskFormValues) => void;
}

export const AiPrioritizeDialog = ({ onTaskCreate }: AiPrioritizeDialogProps) => {
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handlePrioritizeAndCreate = async () => {
        if (!description) {
            toast({ title: "Description is empty", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const { priority, reason } = await prioritizeTasksFromDescription({ description });
            toast({
                title: "AI Prioritization Complete",
                description: `Task priority set to ${priority}. ${reason}`
            });
            onTaskCreate({
                title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
                description,
                priority,
                status: 'Backlog'
            });
            setOpen(false);
            setDescription("");
        } catch (error) {
            toast({ title: "AI Prioritization Failed", variant: "destructive"});
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="group transition-all hover:scale-105 active:scale-95 hover:border-primary/50 hover:shadow-md">
                    <Icons.sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Prioritize with AI
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Task with AI Priority</DialogTitle>
                    <CardDescription>Describe your task, and AI will assign a priority before creating it.</CardDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Textarea
                        placeholder="e.g., 'Fix the authentication bug on the login page that\'s blocking all new users from signing up.'"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px]"
                    />
                    <Button onClick={handlePrioritizeAndCreate} disabled={isLoading} className="w-full">
                        {isLoading ? <Icons.bot className="mr-2 h-4 w-4 animate-spin"/> : <Icons.sparkles className="mr-2 h-4 w-4" />}
                        Analyze and Create Task
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}