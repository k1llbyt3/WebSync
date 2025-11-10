
"use client"
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
import { collection, doc, query, where, getDocs, updateDoc } from "firebase/firestore";
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
                <Button variant="outline" className="transition-transform hover:scale-105 active:scale-95">
                    <Icons.sparkles className="mr-2 h-5 w-5" />
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


  const onTaskSubmit = async (data: AddTaskFormValues) => {
    if (!user) return;
    const tasksCollectionRef = collection(firestore, 'tasks');
    const usersCollectionRef = collection(firestore, 'users');

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
            console.error("Assignee email not found");
            return;
        }
    } else {
       if (!userIds.includes(assigneeId)) {
            userIds.push(assigneeId);
        }
    }
    
    const taskData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        userId: user.uid,
        assigneeId: assigneeId,
        userIds: userIds,
        status: assigneeId !== user.uid ? 'Pending' : (editingTask?.status || 'Backlog'),
    };
    
    if (editingTask) {
        const taskDocRef = doc(tasksCollectionRef, editingTask.id);
        updateDocumentNonBlocking(taskDocRef, taskData);
        setEditingTask(null);
    } else {
        addDocumentNonBlocking(tasksCollectionRef, {...taskData, createdAt: new Date()});
    }
    setOpenAddTask(false)
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
  
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const task = allTasks?.find(t => t.id === draggableId);
    if (task && task.status !== destination.droppableId) {
        const taskDocRef = doc(firestore, 'tasks', draggableId);
        updateDoc(taskDocRef, { status: destination.droppableId });
    }
  };


  const renderTaskCard = (task: Task, index: number) => {
    const assignee = task.assigneeId ? userMap[task.assigneeId] : null;
    const avatar = PlaceHolderImages.find((img) => img.id === 'avatar1');
    return (
        <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
            >
                <Card className={`transform transition-transform duration-300 hover:shadow-lg bg-background/80 ${snapshot.isDragging ? 'scale-105 shadow-xl' : 'hover:scale-105'}`}>
                    <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium pr-2">{task.title}</span>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                            <Icons.more className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive flex items-center gap-2">
                                <Icons.trash className="h-4 w-4"/> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}

                    <div className="flex justify-between items-center">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                            P{task.priority}
                        </Badge>
                        {assignee && avatar && (
                            <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                <Image
                                        src={assignee.photoURL || avatar.imageUrl}
                                        alt={assignee.displayName || 'User avatar'}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                        data-ai-hint={avatar.imageHint}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{assignee.displayName || assignee.email || 'Assignee'}</p>
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    {task.dueDate && (
                    <div className="flex items-center text-xs text-muted-foreground">
                            <Icons.calendar className="mr-1.5 h-3 w-3" />
                            <span>
                                {format(new Date(task.dueDate.seconds * 1000), "MMM d")}
                                {` (${formatDistanceToNow(new Date(task.dueDate.seconds * 1000), { addSuffix: true })})`}
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
                <Button className="transition-transform hover:scale-105 active:scale-95">
                    <Icons.add className="mr-2 h-5 w-5" />
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Edit Task' : 'Add a new task'}</DialogTitle>
                </DialogHeader>
                <AddTaskForm 
                    onTaskSubmit={onTaskSubmit} 
                    users={users || []}
                    userMap={userMap}
                    isLoadingUsers={isLoadingUsers}
                    initialData={editingTask} 
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
                <div className="relative flex-1">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search tasks..." 
                    className="pl-10" 
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
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
                    {columns.map((status) => (
                    <Droppable droppableId={status} key={status}>
                        {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="h-full">
                            <Card className={`h-full bg-card/50 transition-colors ${snapshot.isDraggingOver ? 'bg-accent/20' : ''}`}>
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
            </DragDropContext>
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

    