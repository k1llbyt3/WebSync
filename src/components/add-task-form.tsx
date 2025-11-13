
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "./icons";
import { prioritizeTasksFromDescription } from "@/ai/flows/prioritize-tasks-from-description";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().default("Backlog"),
  priority: z.coerce.number().min(1).max(10),
  priorityReason: z.string().optional(),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
  assigneeEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  tags: z.string().optional(),
});

export type AddTaskFormValues = z.infer<typeof formSchema>;

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  userId: string; // The user who created the task
  assigneeId?: string; // The user the task is assigned to
  userIds: string[]; // For querying tasks involving the user
  dueDate: any; // Allow string or Date from Firestore
  createdAt: any;
  tags?: string[];
};

interface AddTaskFormProps {
  onTaskSubmit: (data: AddTaskFormValues) => void;
  users: any[];
  userMap: Record<string, any>;
  isLoadingUsers: boolean;
  initialData?: Task | null;
  onCancel?: () => void;
}

export function AddTaskForm({ onTaskSubmit, users, userMap, isLoadingUsers, initialData, onCancel }: AddTaskFormProps) {
  const { toast } = useToast();
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Backlog",
      priority: 5,
      assigneeEmail: "",
      tags: "",
    },
  });
  
  useEffect(() => {
    if (initialData) {
        const assignee = initialData.assigneeId ? userMap[initialData.assigneeId] : null;
      form.reset({
        title: initialData.title,
        description: initialData.description || '',
        status: initialData.status || 'Backlog',
        priority: initialData.priority,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate.seconds * 1000) : undefined,
        assigneeId: initialData.assigneeId,
        assigneeEmail: assignee?.email || '',
        tags: initialData.tags?.join(', ') || ''
      });
    } else {
        form.reset({
            title: "",
            description: "",
            status: "Backlog",
            priority: 5,
            priorityReason: "",
            dueDate: undefined,
            assigneeId: undefined,
            assigneeEmail: "",
            tags: "",
        });
    }
  }, [initialData, form, userMap]);

  const handlePrioritize = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please enter a description to prioritize with AI.",
        variant: "destructive",
      });
      return;
    }
    setIsPrioritizing(true);
    try {
      const result = await prioritizeTasksFromDescription({ description });
      form.setValue("priority", result.priority, { shouldValidate: true });
      form.setValue("priorityReason", result.reason);
      toast({
        title: "AI Prioritization Complete",
        description: `Task priority set to ${result.priority}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Prioritization Failed",
        description: "Could not get priority from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  const onSubmit = (data: AddTaskFormValues) => {
    onTaskSubmit(data);
    toast({
      title: initialData ? "Task Updated" : "Task Added",
      description: `"${data.title}" has been ${initialData ? 'updated' : 'added'}.`,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Design the new dashboard" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about the task..."
                  className="resize-none h-[70px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Backlog">📋 Backlog</SelectItem>
                      <SelectItem value="To-Do">📝 To-Do</SelectItem>
                      <SelectItem value="In Progress">⚙️ In Progress</SelectItem>
                      <SelectItem value="Review">👀 Review</SelectItem>
                      <SelectItem value="Completed">✅ Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
            control={form.control}
            name="assigneeEmail"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Assign to (Email)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., teammate@example.com" {...field} disabled={isLoadingUsers} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Project)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'Website V2', 'API', 'Marketing'" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated tags to organize your tasks into projects.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrioritize}
                disabled={isPrioritizing}
            >
                {isPrioritizing ? (
                <Icons.bot className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Icons.sparkles className="mr-2 h-4 w-4" />
                )}
                Prioritize with AI
            </Button>
            <FormDescription>
                Let AI analyze the description to suggest a priority.
            </FormDescription>
        </div>
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority (1-10)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="10" {...field} />
              </FormControl>
              <FormMessage />
              {form.watch('priorityReason') && (
                <FormDescription className="italic flex gap-2 items-start">
                  <Icons.bot className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{form.watch('priorityReason')}</span>
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{initialData ? 'Update Task' : 'Add Task'}</Button>
        </div>
      </form>
    </Form>
  );
}

    