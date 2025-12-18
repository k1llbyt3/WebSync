"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  User,
  Loader2,
  AlignLeft,
  Tag,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";


// Firestore Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  tags?: string[];
  dueDate?: any;
  userId: string;
  assigneeId?: string;
  userIds?: string[];
  createdAt?: any;
}

import { useFirebase } from "@/firebase";

// Form schema
const formSchema = z.object({
  title: z.string().min(2, { message: "Required" }),
  description: z.string().optional(),
  status: z.string().default("To-Do"),
  priority: z.coerce.number().min(1).max(10),
  assigneeEmail: z.string().optional(),
  assigneeId: z.string().optional(), // Added
  tags: z.string().optional(),
  dueDate: z.date().optional(),
});

export type AddTaskFormValues = z.infer<typeof formSchema>;

interface AddTaskFormProps {
  onTaskSubmit: (data: AddTaskFormValues & { assigneeId?: string }) => Promise<void>;
  users: any[];
  userMap: Record<string, any>;
  isLoadingUsers: boolean;
  initialData: Task | null;
  onCancel: () => void;
}

export function AddTaskForm({
  onTaskSubmit,
  initialData,
  onCancel,
}: AddTaskFormProps) {
  const { user } = useFirebase();
  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "To-Do",
      priority: initialData?.priority || 5,
      assigneeEmail: "",
      assigneeId: initialData?.assigneeId || "", // Added
      tags: initialData?.tags ? initialData.tags.join(", ") : "",
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate.seconds * 1000)
        : undefined,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fake AI call for demo purposes (real implementation would use a server action)
  const handleAiPrioritize = async () => {
    const desc = form.getValues("description");
    const title = form.getValues("title");
    if (!title && !desc) return;

    setIsAiLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple heuristic for demo if no real AI connected in this context purely client-side
    // In a real app, this calls an API route.
    // For now, let's randomize or infer basic priority
    const p = Math.floor(Math.random() * 5) + 1; // 1-5 (High/Med)
    form.setValue("priority", p);
    setIsAiLoading(false);
  };

  // Auto-assign to self if no assignee is selected
  // Auto-assign to self if no assignee is selected
  useEffect(() => {
    if (user?.uid && !form.getValues("assigneeId")) {
      form.setValue("assigneeId", user.uid, { shouldDirty: false });
      if (user.email) {
        form.setValue("assigneeEmail", user.email, { shouldDirty: false });
      }
    }
  }, [user?.uid, user?.email]); // Minimal dependency array

  const handleSubmit = async (data: AddTaskFormValues) => {
    setIsLoading(true);
    try {
      // If assigneeId is still empty/undefined, ensure it defaults to current user
      const finalData = {
        ...data,
        assigneeId: data.assigneeId || user?.uid,
      };
      await onTaskSubmit(finalData);
      // Auto-close is handled by parent ensuring onTaskSubmit success closes functionality
      // But we can also trigger onCancel if parent doesn't close explicitly, though parent controls visibility.
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setPriority = (value: number) => form.setValue("priority", value);
  const currentPriority = form.watch("priority");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 text-foreground p-1"
      >
        {/* Top Header Area: Title + AI Button */}
        <div className="flex items-start gap-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Task Title..."
                    {...field}
                    className="text-2xl font-bold bg-transparent border-0 border-b border-white/10 rounded-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 h-14"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiPrioritize}
              disabled={isAiLoading}
              className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 transition-all rounded-full px-3 h-8 text-xs font-semibold"
            >
              {isAiLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              AI Priority
            </Button>
          </div>
        </div>

        {/* Status + Assignee */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Status
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-md h-10 rounded-xl focus:ring-primary/20 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="glass-panel border-white/20 rounded-xl">
                    {["To-Do", "In Progress", "Review", "Completed"].map(
                      (s) => (
                        <SelectItem key={s} value={s} className="focus:bg-white/10 cursor-pointer rounded-lg my-0.5 text-sm">
                          {s}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Assignee (Auto-assigned to you if empty)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="email@work.com"
                      {...field}
                      className="pl-9 bg-white/10 border-white/20 h-10 rounded-xl focus-visible:ring-primary/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-2">
                <AlignLeft className="h-3 w-3" /> Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What needs to be done?"
                  className="resize-none min-h-[100px] bg-white/10 border-white/20 backdrop-blur-md rounded-xl focus-visible:ring-primary/20 text-white placeholder:text-white/40"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Date + Tags */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                  Due Date
                </FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 hover:text-foreground transition-all rounded-xl h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MMM d, yyyy")
                        ) : (
                          <span>Pick date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-panel border-white/20 rounded-xl z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="rounded-xl border-none"
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 flex items-center gap-2">
                  <Tag className="h-3 w-3" /> Tags
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="design, dev"
                    {...field}
                    className="bg-white/5 border-white/10 h-10 rounded-xl focus-visible:ring-primary/20"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Priority Pills */}
        <div className="space-y-3 pt-2">
          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Priority Level
          </FormLabel>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((p) => (
              <Badge
                key={p}
                onClick={() => setPriority(p)}
                variant="outline"
                className={cn(
                  "cursor-pointer px-3 py-1.5 h-7 hover:bg-red-500/20 transition-all rounded-lg select-none",
                  currentPriority === p
                    ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_-3px_rgba(239,68,68,0.5)]"
                    : "border-white/10 text-muted-foreground bg-white/5"
                )}
              >
                High {p}
              </Badge>
            ))}
            {[4, 5, 6, 7].map((p) => (
              <Badge
                key={p}
                onClick={() => setPriority(p)}
                variant="outline"
                className={cn(
                  "cursor-pointer px-3 py-1.5 h-7 hover:bg-amber-500/20 transition-all rounded-lg select-none",
                  currentPriority === p
                    ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_-3px_rgba(245,158,11,0.5)]"
                    : "border-white/10 text-muted-foreground bg-white/5"
                )}
              >
                Med {p}
              </Badge>
            ))}
            {[8, 9, 10].map((p) => (
              <Badge
                key={p}
                onClick={() => setPriority(p)}
                variant="outline"
                className={cn(
                  "cursor-pointer px-3 py-1.5 h-7 hover:bg-emerald-500/20 transition-all rounded-lg select-none",
                  currentPriority === p
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_10px_-3px_rgba(16,185,129,0.5)]"
                    : "border-white/10 text-muted-foreground bg-white/5"
                )}
              >
                Low {p}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="hover:bg-white/10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 min-w-[140px] rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
