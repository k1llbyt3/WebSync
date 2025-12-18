"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { Filter, Flame, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirebase } from "@/firebase";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DragDropContext,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd";
import { StrictModeDroppable } from "@/components/strict-mode-droppable";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { AddTaskForm, AddTaskFormValues, Task } from "@/components/add-task-form";
// import { AiPrioritizeDialog } from "@/app/(main)/tasks/ai-prioritize-dialog"; // Removed
import { InboxTask } from "@/app/(main)/tasks/inbox-task";
import { BoardColumn } from "@/app/(main)/tasks/board-column";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  // Fetch Tasks where logged-in user is a member
  const myTasksQuery = useMemo(() => {
    if (!user) return null;
    const tasksCollection = collection(firestore, "tasks");
    return query(tasksCollection, where("userIds", "array-contains", user.uid));
  }, [firestore, user?.uid]);

  const { data: allTasks, isLoading: isLoadingTasks } =
    useCollection<Task>(myTasksQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<any>(
    useMemo(() => collection(firestore, "users"), [firestore])
  );

  // UI State
  const [mounted, setMounted] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);

  // Multi-select filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "To-Do", "In Progress", "Review", "Completed"
  ]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    "High", "Medium", "Low"
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [focusHighPriority, setFocusHighPriority] = useState(false); // Can keep or remove, but user asked for "Filters" tab to handle things. We'll leave it but maybe hide UI if redundant. Actually, user asked "no need to make seperate tabs for priority put it under filters". So we will likely remove the separate button.

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const project = searchParams.get("project");
    if (project) setProjectFilter(project);

    const taskId = searchParams.get("taskId");
    if (taskId) {
      // Deep Link: Scroll and Highlight
      const checkExist = setInterval(() => {
        const element = document.getElementById(`task-${taskId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-primary', 'shadow-[0_0_50px_rgba(59,130,246,0.5)]');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-primary', 'shadow-[0_0_50px_rgba(59,130,246,0.5)]');
          }, 3000); // Highlight for 3s
          clearInterval(checkExist);
        }
      }, 500);

      // Timeout to stop looking
      setTimeout(() => clearInterval(checkExist), 5000);
    }
  }, [searchParams, allTasks]);

  // Separate Owned Tasks and Assigned Tasks
  const { myTasks, assignedTasks } = useMemo(() => {
    if (!allTasks || !user) return { myTasks: [], assignedTasks: [] };

    const mine = allTasks.filter(
      (task) => task.status !== "Pending" || task.userId === user.uid
    );
    const requestInbox = allTasks.filter(
      (task) => task.status === "Pending" && task.assigneeId === user.uid
    );

    return { myTasks: mine, assignedTasks: requestInbox };
  }, [allTasks, user]);

  const userMap = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc: any, u: any) => {
      acc[u.id] = u;
      return acc;
    }, {});
  }, [users]);

  const totalTasks = myTasks.length;
  const highPriorityCount = useMemo(
    () => myTasks.filter((t) => t.priority <= 3).length,
    [myTasks]
  );

  // Auto-update priority if due within 2 days
  useEffect(() => {
    if (!myTasks) return;

    myTasks.forEach(task => {
      if (!task.dueDate || task.status === 'Completed') return;

      const due = new Date(task.dueDate.seconds * 1000);
      const now = new Date();
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

      // If due within 48 hours and priority is not already "High" or Urgent (1-3)
      // We set it to 1 (Urgent)
      if (diffHours < 48 && diffHours > -24 && task.priority > 3) {
        updateDocumentNonBlocking(doc(firestore, "tasks", task.id), {
          priority: 1
        });
        // We don't toast here to avoid spamming the user on load
      }
    });
  }, [myTasks, firestore]);

  // CREATE / UPDATE Tasks
  const onTaskSubmit = async (data: AddTaskFormValues & { assigneeId?: string }) => {
    if (!user) return;
    try {
      let assigneeId = data.assigneeId || user.uid;
      let userIds = [user.uid];

      if (data.assigneeEmail && data.assigneeEmail !== user.email) {
        const q = query(
          collection(firestore, "users"),
          where("email", "==", data.assigneeEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          assigneeId = querySnapshot.docs[0].id;
          if (!userIds.includes(assigneeId)) userIds.push(assigneeId);
        } else {
          toast({
            title: "Error",
            description: "Assignee email not found",
            variant: "destructive",
          });
          return;
        }
      } else {
        if (!userIds.includes(assigneeId)) userIds.push(assigneeId);
      }

      const taskData: any = {
        ...data,
        tags: data.tags
          ? typeof data.tags === "string"
            ? data.tags.split(",").map((t) => t.trim())
            : data.tags
          : [],
        userId: user.uid,
        assigneeId,
        userIds,
        status:
          assigneeId !== user.uid
            ? "Pending"
            : editingTask?.status || data.status || "Backlog",
        dueDate: data.dueDate || null,
      };

      if (editingTask) {
        await updateDoc(doc(firestore, "tasks", editingTask.id), taskData);
        toast({ title: "Updated", description: "Task updated successfully" });
      } else {
        await addDoc(collection(firestore, "tasks"), {
          ...taskData,
          createdAt: new Date(),
        });
        toast({ title: "Created", description: "Task created successfully" });
      }

      setEditingTask(null);
      setOpenAddTask(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTask = (taskId: string) =>
    deleteDocumentNonBlocking(doc(collection(firestore, "tasks"), taskId));

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenAddTask(true);
  };

  const handleOpenAddTask = (v: boolean) => {
    setOpenAddTask(v);
    if (!v) setEditingTask(null);
  };

  // Helpers for Filters
  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
    );
  };

  const togglePriority = (p: string) => {
    setSelectedPriorities(prev =>
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    );
  };

  const handleAcceptTask = (task: Task) =>
    updateDocumentNonBlocking(doc(collection(firestore, "tasks"), task.id), {
      status: "Backlog",
    });

  const handleDeclineTask = (task: Task) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(collection(firestore, "tasks"), task.id), {
      assigneeId: task.userId,
      status: "Backlog",
      userIds: [task.userId],
    });
  };

  // Filter Logic
  const baseFilteredTasks = useMemo(() => {
    if (!myTasks) return [];
    const result = myTasks.filter((task) => {
      const searchMatch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = selectedStatuses.includes(task.status);
      const projectMatch = projectFilter
        ? (task.tags || []).includes(projectFilter)
        : true;

      // Priority Match
      let priorityLevel = "Low";
      if (task.priority <= 3) priorityLevel = "High";
      else if (task.priority <= 7) priorityLevel = "Medium";

      const priorityMatch = selectedPriorities.includes(priorityLevel);

      return searchMatch && statusMatch && projectMatch && priorityMatch;
    });

    return result.sort((a, b) => a.priority - b.priority);
  }, [myTasks, searchQuery, selectedStatuses, projectFilter, selectedPriorities]);

  // Apply "Focus: High Priority" filter
  const filteredTasks = useMemo(
    () =>
      focusHighPriority
        ? baseFilteredTasks.filter((t) => t.priority <= 3)
        : baseFilteredTasks,
    [baseFilteredTasks, focusHighPriority]
  );

  // Columns
  const columns = ["To-Do", "In Progress", "Review", "Completed"];

  const onDragStart = () => setIsDragging(true);

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    if (destination.droppableId === "delete") {
      await deleteDoc(doc(firestore, "tasks", draggableId));
      playSound("delete");
      toast({ title: "Deleted", description: "Task removed" });
      return;
    }

    const task = allTasks?.find((t) => t.id === draggableId);
    if (task && task.status !== destination.droppableId) {
      if (destination.droppableId === 'Completed') playSound("success");
      else playSound("click");
      await updateDoc(doc(firestore, "tasks", draggableId), {
        status: destination.droppableId,
      });
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 relative z-10 p-0">
      {/* Header */}
      <div className="glass-panel rounded-3xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-black/20 border-white/5 bg-gray-900/40 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Task Board</h1>
            {highPriorityCount > 0 && (
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1.5 px-3 py-1 text-xs">
                <Flame className="h-3.5 w-3.5" />
                {highPriorityCount} High Priority
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Manage, track, and collaborate on your tasks.</p>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-col gap-3 w-full sm:w-auto items-stretch sm:items-end">
          <div className="flex items-center gap-3">
            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full bg-gray-800/50 border-white/5 hover:bg-gray-700/50 transition-all backdrop-blur-md">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  Filters
                  {(selectedStatuses.length < 4 || selectedPriorities.length < 3) && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-[10px]">
                      {(4 - selectedStatuses.length) + (3 - selectedPriorities.length)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-5 bg-gray-900/90 border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
                <div className="space-y-5">
                  {/* Status Section */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {["To-Do", "In Progress", "Review", "Completed"].map(status => {
                        const isSelected = selectedStatuses.includes(status);
                        return (
                          <div
                            key={status}
                            onClick={() => toggleStatus(status)}
                            className={cn(
                              "cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all select-none flex items-center gap-2",
                              isSelected
                                ? "bg-primary/20 border-primary/30 text-primary"
                                : "bg-gray-800/50 border-white/5 text-muted-foreground hover:bg-gray-700/50"
                            )}
                          >
                            {status}
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Priority Section */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Priority</h4>
                    <div className="flex flex-wrap gap-2">
                      {["High", "Medium", "Low"].map(p => {
                        const isSelected = selectedPriorities.includes(p);
                        const colorClass = p === "High" ? "red" : p === "Medium" ? "amber" : "emerald";
                        return (
                          <div
                            key={p}
                            onClick={() => togglePriority(p)}
                            className={cn(
                              "cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all select-none flex items-center gap-2",
                              isSelected
                                ? `bg-${colorClass}-500/20 border-${colorClass}-500/30 text-${colorClass}-500`
                                : "bg-gray-800/50 border-white/5 text-muted-foreground hover:bg-gray-700/50"
                            )}
                          >
                            {p}
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={openAddTask} onOpenChange={handleOpenAddTask}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 rounded-full px-5 h-10 transition-all hover:scale-105 z-10">
                  <Icons.add className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-gray-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl z-[150]">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </DialogTitle>
                </DialogHeader>
                <AddTaskForm
                  onTaskSubmit={onTaskSubmit}
                  users={users || []}
                  userMap={userMap}
                  isLoadingUsers={isLoadingUsers}
                  initialData={editingTask}
                  onCancel={() => handleOpenAddTask(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Views */}
      <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0 relative z-0">
        <div className="flex items-center justify-between mb-6 px-1">
          <TabsList className="bg-transparent border border-white/10 rounded-full p-1 h-auto relative bg-black/20">
            <TabsTrigger
              value="board"
              className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              My Board
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              Inbox
              {!!assignedTasks?.length && (
                <Badge className="ml-2 bg-white/20 text-white border-none h-5 min-w-[1.2rem] px-1">
                  {assignedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-72">
            <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 z-10 pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              className="pl-11 rounded-full bg-gray-900/40 border-white/10 hover:bg-black/40 focus:bg-black/60 transition-all backdrop-blur-md h-10 text-sm focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Kanban Board - Fixed Grid Layout */}
        <TabsContent value="board" className="flex-1 min-h-0 pb-6 relative">
          {!mounted ? (
            <div className="grid grid-cols-4 gap-6 h-full">
              {columns.map((c) => (
                <div
                  key={c}
                  className="rounded-3xl bg-gray-900/20 border border-white/5 p-4 h-full"
                >
                  <Skeleton className="h-6 w-32 mb-6 rounded-full" />
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full rounded-3xl">
              <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full min-h-0 pb-4">
                  {columns.map((status) => (
                    <div key={status} className="h-full min-h-0">
                      <BoardColumn
                        id={status}
                        title={status}
                        tasks={filteredTasks.filter((t) => t.status === status)}
                        isDragging={isDragging}
                        userMap={userMap}
                        onEdit={handleEditTask}
                        onDelete={deleteTask}
                      />
                    </div>
                  ))}
                </div>

                {/* Delete Drop Zone */}
                <StrictModeDroppable droppableId="delete">
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-8 py-4 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300",
                        snapshot.isDraggingOver
                          ? "opacity-100 scale-110 bg-red-500 text-white border-red-400 shadow-red-500/40"
                          : isDragging
                            ? "opacity-100 scale-100 bg-black/80 border-white/10 text-white"
                            : "opacity-0 scale-90 pointer-events-none"
                      )}
                    >
                      <Icons.trash
                        className={cn(
                          "h-5 w-5",
                          snapshot.isDraggingOver && "animate-bounce"
                        )}
                      />
                      <span className="text-sm font-medium uppercase tracking-wide">
                        {snapshot.isDraggingOver ? "Drop to Delete" : "Drag Here to Delete"}
                      </span>
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </DragDropContext>
            </div>
          )}
        </TabsContent>

        {/* Inbox */}
        <TabsContent value="inbox" className="pt-4 max-w-3xl mx-auto w-full">
          <div className="flex flex-col gap-4">
            {isLoadingTasks ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl w-full" />
              ))
            ) : assignedTasks?.length ? (
              assignedTasks.map((task) => (
                <InboxTask
                  key={task.id}
                  task={task}
                  userMap={userMap}
                  onAccept={handleAcceptTask}
                  onDecline={handleDeclineTask}
                />
              ))
            ) : (
              <div className="bg-gray-900/40 rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center py-20">
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-white/5 mb-6">
                  <Icons.inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-bold text-xl mb-1">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No pending tasks assigned to you.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
