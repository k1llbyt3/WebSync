"use client";

import { useState } from "react";
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
  dueDate?: any; // Firestore Timestamp or Date
  userId: string;
  assigneeId?: string;
  userIds?: string[];
  createdAt?: any;
}

// Form schema
const formSchema = z.object({
  title: z.string().min(2, { message: "Required" }),
  description: z.string().optional(),
  status: z.string().default("Backlog"),
  priority: z.coerce.number().min(1).max(10),
  assigneeEmail: z.string().optional(),
  tags: z.string().optional(),
  dueDate: z.date().optional(),
});

export type AddTaskFormValues = z.infer<typeof formSchema>;

interface AddTaskFormProps {
  onTaskSubmit: (data: AddTaskFormValues & { assigneeId?: string }) => Promise<void>;
  users: any[]; // kept for compatibility with parent, even if not used now
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
  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "Backlog",
      priority: initialData?.priority || 5,
      assigneeEmail: "",
      tags: initialData?.tags ? initialData.tags.join(", ") : "",
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate.seconds * 1000)
        : undefined,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AddTaskFormValues) => {
    setIsLoading(true);
    try {
      await onTaskSubmit(data);
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
        className="space-y-5 text-foreground"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
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
                    <SelectTrigger className="bg-white/5 border-white/10 backdrop-blur-md">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Backlog", "To-Do", "In Progress", "Review", "Completed"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
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
                  Assignee
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="email@work.com"
                      {...field}
                      className="pl-9 bg-white/5 border-white/10"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

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
                  className="resize-none min-h-[100px] bg-white/5 border-white/10 backdrop-blur-md"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-white/5 border-white/10",
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
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
                    className="bg-white/5 border-white/10"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Priority Pills */}
        <div className="space-y-2 pt-2">
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
                  "cursor-pointer px-3 py-1 hover:bg-red-500/20 transition-all",
                  currentPriority === p
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "border-white/10 text-muted-foreground"
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
                  "cursor-pointer px-3 py-1 hover:bg-amber-500/20 transition-all",
                  currentPriority === p
                    ? "bg-amber-500/20 border-amber-500 text-amber-500"
                    : "border-white/10 text-muted-foreground"
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
                  "cursor-pointer px-3 py-1 hover:bg-emerald-500/20 transition-all",
                  currentPriority === p
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                    : "border-white/10 text-muted-foreground"
                )}
              >
                Low {p}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 min-w-[120px]"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
