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
import { Icons } from "@/components/icons";
import { Filter, Flame } from "lucide-react";
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
import { AddTaskForm, AddTaskFormValues, Task } from "@/components/add-task-form";
import { AiPrioritizeDialog } from "@/app/(main)/tasks/ai-prioritize-dialog";
import { InboxTask } from "@/app/(main)/tasks/inbox-task";
import { BoardColumn } from "@/app/(main)/tasks/board-column";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TasksPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Fetch Tasks where logged-in user is a member
  const myTasksQuery = useMemo(() => {
    if (!user) return null;
    const tasksCollection = collection(firestore, "tasks");
    return query(tasksCollection, where("userIds", "array-contains", user.uid));
  }, [firestore, user]);

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
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    Backlog: true,
    "To-Do": true,
    "In Progress": true,
    Review: true,
    Completed: true,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [focusHighPriority, setFocusHighPriority] = useState(false); // NEW

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const project = searchParams.get("project");
    if (project) setProjectFilter(project);
  }, [searchParams]);

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

  // Filter UI
  const baseFilteredTasks = useMemo(() => {
    if (!myTasks) return [];
    const result = myTasks.filter((task) => {
      const searchMatch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = statusFilters[task.status];
      const projectMatch = projectFilter
        ? (task.tags || []).includes(projectFilter)
        : true;

      return searchMatch && statusMatch && projectMatch;
    });

    return result.sort((a, b) => a.priority - b.priority);
  }, [myTasks, searchQuery, statusFilters, projectFilter]);

  // Apply "Focus: High Priority" filter
  const filteredTasks = useMemo(
    () =>
      focusHighPriority
        ? baseFilteredTasks.filter((t) => t.priority <= 3)
        : baseFilteredTasks,
    [baseFilteredTasks, focusHighPriority]
  );

  // Columns
  const columns = ["Backlog", "To-Do", "In Progress", "Review", "Completed"];

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
      toast({ title: "Deleted", description: "Task removed" });
      return;
    }

    const task = allTasks?.find((t) => t.id === draggableId);
    if (task && task.status !== destination.droppableId) {
      await updateDoc(doc(firestore, "tasks", draggableId), {
        status: destination.droppableId,
      });
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 relative">
      {/* Header */}
      <div className="glass-panel rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            {highPriorityCount > 0 && (
              <Badge className="bg-red-500/90 text-white flex items-center gap-1">
                <Flame className="h-3 w-3" />
                {highPriorityCount} High Priority
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-background/60 border border-border/60">
              Total: <span className="font-semibold">{totalTasks}</span>
            </span>
            <span className="px-2 py-1 rounded-full bg-background/60 border border-border/60">
              Visible:{" "}
              <span className="font-semibold">{filteredTasks.length}</span>
            </span>
            <div className="flex items-center gap-2 bg-muted/10 px-2 py-1 rounded-full border border-border/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Priority Guide
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-red-500 text-red-500 bg-red-500/10"
              >
                1–3 High
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500 text-amber-500 bg-amber-500/10"
              >
                4–7 Med
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500 text-emerald-500 bg-emerald-500/10"
              >
                8–10 Low
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-col gap-2 w-full sm:w-auto items-stretch sm:items-end">
          {/* Focus Toggle */}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant={focusHighPriority ? "default" : "outline"}
              size="sm"
              onClick={() => setFocusHighPriority((v) => !v)}
              className={`flex items-center gap-2 rounded-full px-3 h-9 ${
                focusHighPriority
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-background/70 backdrop-blur border-border/60"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {focusHighPriority ? "Focusing High Priority" : "Focus High Priority"}
              </span>
            </Button>
          </div>

          {/* Add Task Row */}
          <div className="flex gap-2 w-full sm:w-auto">
            <AiPrioritizeDialog onTaskCreate={onTaskSubmit} />

            <Dialog open={openAddTask} onOpenChange={handleOpenAddTask}>
              <DialogTrigger asChild>
                <Button className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-md rounded-full px-4">
                  <Icons.add className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto glass-panel rounded-2xl">
                <DialogHeader>
                  <DialogTitle>
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
      <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          {/* Tabs */}
          <TabsList className="bg-background/60 backdrop-blur border border-border/60 rounded-full px-1">
            <TabsTrigger
              value="board"
              className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              My Board
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Inbox
              {!!assignedTasks?.length && (
                <Badge className="ml-2 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/40 h-5 min-w-[1.5rem]">
                  {assignedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search + Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative sm:w-64 flex-1">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9 rounded-full bg-background/70 border-border/60 backdrop-blur"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background/70 border-border/60 backdrop-blur"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass-panel border-border/70 rounded-xl"
              >
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(statusFilters).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters[status]}
                    onCheckedChange={() =>
                      setStatusFilters((prev) => ({
                        ...prev,
                        [status]: !prev[status],
                      }))
                    }
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {projectFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setProjectFilter(null);
                  router.push("/tasks");
                }}
              >
                {projectFilter}
                <Icons.close className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <TabsContent value="board" className="flex-1 min-h-0 pb-6 relative">
          {!mounted ? (
            <div className="flex gap-6 overflow-x-auto h-full">
              {columns.map((c) => (
                <div
                  key={c}
                  className="w-[320px] p-4 rounded-2xl glass-panel border-dashed border-border/60"
                >
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full glass-panel rounded-2xl p-4">
              <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full overflow-x-auto pb-4 pr-4 custom-scrollbar">
                  {columns.map((status) => (
                    <BoardColumn
                      key={status}
                      id={status}
                      title={status}
                      tasks={filteredTasks.filter((t) => t.status === status)}
                      isDragging={isDragging}
                      userMap={userMap}
                      onEdit={handleEditTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>

                {/* Delete Drop Zone */}
                <StrictModeDroppable droppableId="delete">
                  {(
                    provided: DroppableProvided,
                    snapshot: DroppableStateSnapshot
                  ) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]
                        flex items-center gap-3 px-8 py-4 rounded-full border shadow-xl
                        backdrop-blur-xl transition-all duration-300
                        ${
                          snapshot.isDraggingOver
                            ? "opacity-100 scale-110 bg-red-500 text-white border-red-400 shadow-red-500/40"
                            : isDragging
                            ? "opacity-100 scale-100 bg-background/90 border-border text-muted-foreground"
                            : "opacity-0 scale-90 pointer-events-none"
                        }
                      `}
                    >
                      <Icons.trash
                        className={`h-5 w-5 ${
                          snapshot.isDraggingOver ? "animate-bounce" : ""
                        }`}
                      />
                      <span className="text-sm font-medium uppercase tracking-wide">
                        {snapshot.isDraggingOver
                          ? "Drop to Delete"
                          : "Drag Here to Delete"}
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
                <Skeleton key={i} className="h-24 rounded-xl w-full" />
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
              <div className="glass-panel rounded-2xl border-dashed flex flex-col items-center justify-center py-16">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-muted/40 mb-4">
                  <Icons.inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-lg">All caught up!</p>
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
