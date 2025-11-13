
"use client";
export const dynamic = "force-dynamic";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTaskForm, AddTaskFormValues, Task } from "@/components/add-task-form";
import { format, formatDistanceToNow } from "date-fns";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where, getDocs, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { prioritizeTasksFromDescription } from "@/ai/flows/prioritize-tasks-from-description";

const getPriorityBadgeVariant = (priority: number) => {
  if (priority <= 3) return "destructive";
  if (priority <= 7) return "secondary";
  return "outline";
};


const AiPrioritizeDialog = ({ onTaskCreate }: { onTaskCreate: (data: AddTaskFormValues) => void}) => {
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
            });
            setOpen(false); // Close dialog on success
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
                        placeholder="e.g., 'Fix the authentication bug on the login page that's blocking all new users from signing up.'"
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

export default function TasksPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const myTasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    const tasksCollection = collection(firestore, 'tasks');
    return query(tasksCollection, where('userIds', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: allTasks, isLoading: isLoadingTasks } = useCollection<Task>(myTasksQuery);
  
  const { data: users, isLoading: isLoadingUsers } = useCollection<any>(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));

  const [mounted, setMounted] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    "Backlog": true, "To-Do": true, "In Progress": true, "Review": true, "Completed": true,
  });
  const [priorityFilters, setPriorityFilters] = useState<Record<string, boolean>>({
    "High": true, "Medium": true, "Low": true,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [enableDragDrop, setEnableDragDrop] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Delay enabling drag-and-drop to ensure all droppable zones are ready
    const timer = setTimeout(() => {
      setEnableDragDrop(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
    useEffect(() => {
        const project = searchParams.get('project');
        if (project) {
            setProjectFilter(project);
        }
    }, [searchParams]);

  const { myTasks, assignedTasks } = useMemo(() => {
    if (!allTasks || !user) return { myTasks: [], assignedTasks: [] };
    const myTasks = allTasks.filter(task => task.status !== 'Pending' || task.userId === user.uid);
    const assignedTasks = allTasks.filter(task => task.status === 'Pending' && task.assigneeId === user.uid);
    return { myTasks, assignedTasks };
  }, [allTasks, user]);


  const { toast } = useToast();

  const onTaskSubmit = async (data: AddTaskFormValues) => {
    if (!user) return;
    const tasksCollectionRef = collection(firestore, 'tasks');
    const usersCollectionRef = collection(firestore, 'users');

    try {
      let assigneeId = data.assigneeId || user.uid;
      let userIds = [user.uid];

      if (data.assigneeEmail && data.assigneeEmail !== user.email) {
          const q = query(usersCollectionRef, where("email", "==", data.assigneeEmail));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const assignedUser = querySnapshot.docs[0];
              assigneeId = assignedUser.id;
              if (!userIds.includes(assigneeId)) {
                  userIds.push(assigneeId);
              }
          } else {
              toast({
                title: "Error",
                description: "Assignee email not found",
                variant: "destructive",
              });
              return;
          }
      } else {
         if (!userIds.includes(assigneeId)) {
              userIds.push(assigneeId);
          }
      }
      
      const taskData: any = {
          ...data,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
          userId: user.uid,
          assigneeId: assigneeId,
          userIds: userIds,
          status: assigneeId !== user.uid ? 'Pending' : (editingTask?.status || data.status || 'Backlog'),
      };
      
      // Remove undefined fields to avoid Firebase errors
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === undefined) {
          delete taskData[key];
        }
      });
      
      if (editingTask) {
          const taskDocRef = doc(tasksCollectionRef, editingTask.id);
          await updateDoc(taskDocRef, taskData);
          setEditingTask(null);
          toast({
            title: "Success!",
            description: "Task updated successfully",
          });
      } else {
          await addDoc(tasksCollectionRef, {...taskData, createdAt: new Date()});
          toast({
            title: "Success!",
            description: "Task created successfully",
          });
      }
      setOpenAddTask(false);
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save task. Check Firebase permissions in your Firebase Console.",
        variant: "destructive",
      });
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenAddTask(true);
  };
  
  const handleOpenAddTask = (isOpen: boolean) => {
    setOpenAddTask(isOpen);
    if (!isOpen) {
      setEditingTask(null);
    }
  }
  
  const handleAcceptTask = (task: Task) => {
    const taskDocRef = doc(collection(firestore, 'tasks'), task.id);
    updateDocumentNonBlocking(taskDocRef, { status: 'Backlog' });
  };

  const handleDeclineTask = (task: Task) => {
    if (!user) return;
    const taskDocRef = doc(collection(firestore, 'tasks'), task.id);
    updateDocumentNonBlocking(taskDocRef, { 
        assigneeId: task.userId, 
        status: 'Backlog',
        userIds: [task.userId]
    });
  };


  const deleteTask = (taskId: string) => {
    deleteDocumentNonBlocking(doc(collection(firestore, 'tasks'), taskId));
  };
  
  const handleStatusFilterChange = (status: string) => {
    setStatusFilters(prev => ({...prev, [status]: !prev[status]}));
  };

  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilters(prev => ({...prev, [priority]: !prev[priority]}));
  };

  const filteredTasks = useMemo(() => {
    return myTasks.filter(task => {
      const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const statusMatch = statusFilters[task.status];

      let priorityLabel = 'Low';
      if (task.priority <= 3) priorityLabel = 'High';
      else if (task.priority <= 7) priorityLabel = 'Medium';
      const priorityMatch = priorityFilters[priorityLabel];
      
      const projectMatch = projectFilter ? (task.tags || []).includes(projectFilter) : true;

      return searchMatch && statusMatch && priorityMatch && projectMatch;
    });
  }, [myTasks, searchQuery, statusFilters, priorityFilters, projectFilter]);
  
  const userMap = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
    }, {} as Record<string, any>);
  }, [users]);
  
  const columns = ["Backlog", "To-Do", "In Progress", "Review", "Completed"];
  
  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const task = allTasks?.find(t => t.id === draggableId);
    
    if (destination.droppableId === 'delete') {
      try {
        const taskDocRef = doc(firestore, 'tasks', draggableId);
        await deleteDoc(taskDocRef);
        toast({
          title: "Task Deleted!",
          description: `"${task?.title}" has been deleted`,
          variant: "destructive",
        });
      } catch (error: any) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete task",
          variant: "destructive",
        });
      }
      return;
    }
    
    if (task && task.status !== destination.droppableId) {
        try {
          const taskDocRef = doc(firestore, 'tasks', draggableId);
          await updateDoc(taskDocRef, { status: destination.droppableId });
          toast({
            title: "Task Moved!",
            description: `"${task.title}" moved to ${destination.droppableId}`,
          });
        } catch (error: any) {
          console.error("Error moving task:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to move task",
            variant: "destructive",
          });
        }
    }
  };


  const renderTaskCard = (task: Task, index: number) => {
    const assignee = task.assigneeId ? userMap[task.assigneeId] : null;
    const avatar = PlaceHolderImages.find((img) => img.id === 'avatar1');
    
    const getPriorityColor = (priority: number) => {
      if (priority <= 3) return 'border-red-500';
      if (priority <= 7) return 'border-yellow-500';
      return 'border-green-500';
    };
    
    const getPriorityAccent = (priority: number) => {
      if (priority <= 3) return 'from-red-500/10 to-transparent';
      if (priority <= 7) return 'from-yellow-500/10 to-transparent';
      return 'from-green-500/10 to-transparent';
    };
    
    return (
        <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
            >
                <Card className={`group cursor-grab active:cursor-grabbing transform transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border-2 hover:border-primary/40 ${getPriorityColor(task.priority)} border-l-4 ${snapshot.isDragging ? 'scale-105 shadow-2xl border-primary rotate-2 ring-4 ring-primary/20' : 'hover:scale-[1.02]'} overflow-hidden relative`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${getPriorityAccent(task.priority)} pointer-events-none`} />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                    
                    <CardContent className="p-4 space-y-3 relative">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold leading-snug pr-2 group-hover:text-primary transition-colors flex-1 border-b-2 border-transparent group-hover:border-primary/30 pb-1">
                          {task.title}
                        </h3>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:rotate-90 duration-300">
                            <Icons.more className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Icons.edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive flex items-center gap-2">
                                <Icons.trash className="h-4 w-4"/> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-2 border-l-2 border-muted/30">
                        {task.description}
                      </p>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors">
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-muted/20">
                        <Badge variant={getPriorityBadgeVariant(task.priority)} className="transition-all hover:scale-110 shadow-sm font-semibold">
                            P{task.priority}
                        </Badge>
                        {assignee && avatar && (
                            <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                <Image
                                        src={assignee.photoURL || avatar.imageUrl}
                                        alt={assignee.displayName || 'User avatar'}
                                        width={28}
                                        height={28}
                                        className="rounded-full hover:scale-125 transition-transform ring-2 ring-background hover:ring-primary shadow-md"
                                        data-ai-hint={avatar.imageHint}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                <p className="font-medium">{assignee.displayName || assignee.email || 'Assignee'}</p>
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    {task.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-md">
                            <Icons.calendar className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">
                                {format(new Date(task.dueDate.seconds * 1000), "MMM d, yyyy")}
                            </span>
                            <span className="text-[10px] opacity-70">
                                ({formatDistanceToNow(new Date(task.dueDate.seconds * 1000), { addSuffix: true })})
                            </span>
                    </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        )}
        </Draggable>
    )
  }
  
  const renderInboxTask = (task: Task) => {
    const creator = task.userId ? userMap[task.userId] : null;
    return (
        <Card key={task.id}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                        Assigned by {creator?.displayName || '...'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptTask(task)}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeclineTask(task)}>Decline</Button>
                </div>
            </CardContent>
        </Card>
    )
  }


  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Board</h1>
          <p className="text-muted-foreground">
            Manage your projects with drag-and-drop.
          </p>
        </div>
        <div className="flex gap-2">
         <AiPrioritizeDialog onTaskCreate={onTaskSubmit} />
         <Dialog open={openAddTask} onOpenChange={handleOpenAddTask}>
            <DialogTrigger asChild>
                <Button className="group transition-all hover:scale-105 active:scale-95 hover:shadow-lg">
                    <Icons.add className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Edit Task' : 'Add a new task'}</DialogTitle>
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

     <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">My Board</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox
            {assignedTasks && assignedTasks.length > 0 && (
                <Badge className="ml-2">{assignedTasks.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="pt-4">
             <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1 group">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search tasks..." 
                    className="pl-10 focus:ring-2 focus:ring-primary/20 transition-all" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                </div>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    Status <Icons.chevronLeft className="ml-2 h-4 w-4 rotate-[-90deg]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.keys(statusFilters).map(status => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilters[status]}
                        onCheckedChange={() => handleStatusFilterChange(status)}
                    >
                        {status}
                    </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    Priority <Icons.chevronLeft className="ml-2 h-4 w-4 rotate-[-90deg]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.keys(priorityFilters).map(priority => (
                    <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilters[priority]}
                        onCheckedChange={() => handlePriorityFilterChange(priority)}
                    >
                        {priority}
                    </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
                 {projectFilter && (
                    <Button variant="ghost" onClick={() => { setProjectFilter(null); router.push('/tasks'); }}>
                        Clear filter: {projectFilter} <Icons.close className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            {!mounted || !enableDragDrop ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
                    {columns.map((status) => (
                        <Card key={status} className="h-full bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-lg flex justify-between items-center">
                                    <span>{status}</span>
                                    <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                        <Icons.bot className="h-4 w-4 animate-spin"/>
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 min-h-[150px]">
                                <Skeleton className="h-24 w-full"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
                        {columns.map((status) => (
                        <Droppable droppableId={status} key={status} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                            {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="h-full">
                                <Card className={`h-full bg-card/50 transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-primary/10 ring-2 ring-primary scale-105' : ''}`}>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex justify-between items-center">
                                            <span>{status}</span>
                                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                                {isLoadingTasks ? <Icons.bot className="h-4 w-4 animate-spin"/> : filteredTasks.filter(t => t.status === status).length}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4 min-h-[150px]">
                                    {isLoadingTasks ? (
                                    Array.from({length: 2}).map((_, i) => (
                                        <Card key={i} className="p-4 space-y-3">
                                        <Skeleton className="h-5 w-3/4"/>
                                        <Skeleton className="h-4 w-full"/>
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-6 w-12"/>
                                            <Skeleton className="h-6 w-6 rounded-full"/>
                                        </div>
                                        </Card>
                                    ))
                                    ) : filteredTasks
                                        .filter((task) => task.status === status)
                                        .map((task, index) => renderTaskCard(task, index))}
                                        {provided.placeholder}
                                    </CardContent>
                                </Card>
                            </div>
                            )}
                        </Droppable>
                        ))}
                    </div>
                    
                    {isDragging && (
                      <Droppable droppableId="delete" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            className={`mt-6 p-8 border-4 border-dashed rounded-xl transition-all duration-300 flex items-center justify-center gap-4 ${
                              snapshot.isDraggingOver 
                                ? 'bg-destructive/20 border-destructive scale-105 shadow-xl' 
                                : 'bg-destructive/5 border-destructive/30 hover:border-destructive/50'
                            }`}
                          >
                            <Icons.trash className={`h-12 w-12 transition-all ${snapshot.isDraggingOver ? 'text-destructive animate-bounce' : 'text-destructive/50'}`} />
                            <div className="text-center">
                              <p className={`text-lg font-semibold transition-colors ${snapshot.isDraggingOver ? 'text-destructive' : 'text-destructive/70'}`}>
                                {snapshot.isDraggingOver ? 'Release to Delete' : 'Drag Here to Delete'}
                              </p>
                              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )}
                </DragDropContext>
                </div>
            )}
        </TabsContent>
        <TabsContent value="inbox" className="pt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Assigned to You</CardTitle>
                    <CardDescription>These are tasks that other users have assigned to you. Accept them to add them to your board.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingTasks ? (
                        Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : assignedTasks && assignedTasks.length > 0 ? (
                        assignedTasks.map(renderInboxTask)
                    ) : (
                        <p className="text-center text-muted-foreground py-8">Your inbox is empty.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
     </Tabs>
    </div>
  );
}

    