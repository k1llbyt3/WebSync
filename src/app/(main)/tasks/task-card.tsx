import { Task } from "@/components/add-task-form";
import { Draggable, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { User, Flag } from "lucide-react"; 
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
    index: number;
    userMap: Record<string, any>;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

// 🚦 Priority Logic: 1-3 (High), 4-7 (Medium), 8-10 (Low)
const getPriorityConfig = (priority: number) => {
    if (priority <= 3) return { label: 'High', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', bar: 'bg-red-500' };
    if (priority <= 7) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', bar: 'bg-emerald-500' };
};

export const TaskCard = ({ task, index, userMap, onEdit, onDelete }: TaskCardProps) => {
    const assignee = task.assigneeId ? userMap[task.assigneeId] : null;
    const pConfig = getPriorityConfig(task.priority);

    return (
        <Draggable draggableId={task.id} index={index}>
    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                            ...(provided.draggableProps.style as React.CSSProperties),
                            zIndex: snapshot.isDragging ? 9999 : undefined,
                          }}                         
                          
                        className={cn(
                            "group relative rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md",
                            snapshot.isDragging && "rotate-2 scale-105 shadow-xl ring-2 ring-primary/20 opacity-90"
                        )}
                    >
                        {/* Colored Left Bar for Priority */}
                        <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", pConfig.bar)} />

                        <div className="pl-3 flex flex-col gap-2">
                            {/* Header: Priority Badge & Actions */}
                            <div className="flex justify-between items-start">
                                <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", pConfig.bg, pConfig.color, pConfig.border)}>
                                    <Flag className="h-3 w-3" />
                                    {pConfig.label} (P{task.priority})
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground">
                                            <Icons.more className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(task)}>Edit Task</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-semibold leading-tight text-foreground/90">
                                {task.title}
                            </h4>

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {task.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Footer: Date & Avatar */}
                            <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Icons.calendar className="h-3.5 w-3.5" />
                                    <span>
                                        {task.dueDate ? format(new Date(task.dueDate.seconds * 1000), "MMM d") : "No Date"}
                                    </span>
                                </div>

                                {assignee ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Image
                                                    src={assignee.photoURL || PlaceHolderImages[0].imageUrl}
                                                    alt="User"
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full ring-2 ring-background shadow-sm"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>{assignee.displayName}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }}
        </Draggable>
    );
};