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

// Helper to generate consistent colors from strings
const getAvatarColor = (name: string) => {
    const colors = [
        "bg-red-500/20 text-red-500 border-red-500/30",
        "bg-orange-500/20 text-orange-500 border-orange-500/30",
        "bg-amber-500/20 text-amber-500 border-amber-500/30",
        "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
        "bg-teal-500/20 text-teal-500 border-teal-500/30",
        "bg-cyan-500/20 text-cyan-500 border-cyan-500/30",
        "bg-blue-500/20 text-blue-500 border-blue-500/30",
        "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
        "bg-violet-500/20 text-violet-500 border-violet-500/30",
        "bg-purple-500/20 text-purple-500 border-purple-500/30",
        "bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30",
        "bg-pink-500/20 text-pink-500 border-pink-500/30",
        "bg-rose-500/20 text-rose-500 border-rose-500/30",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const TaskCard = ({ task, index, userMap, onEdit, onDelete }: TaskCardProps) => {
    const assignee = task.assigneeId ? userMap[task.assigneeId] : null;

    // 🚦 Priority Logic
    const getPriorityConfig = (priority: number) => {
        if (priority <= 3) return { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' };
        if (priority <= 7) return { label: 'Med', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' };
        return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' };
    };
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
                            ...provided.draggableProps.style,
                            zIndex: snapshot.isDragging ? 9999 : "auto",
                        }}
                        className={cn(
                            "group relative overflow-hidden flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md",
                            snapshot.isDragging
                                ? "rotate-2 scale-105 shadow-2xl ring-2 ring-primary/50 bg-gray-800/90 backdrop-blur-xl border-primary/50 cursor-grabbing z-[9999]"
                                : "bg-gray-800/40 backdrop-blur-sm border-white/5 hover:bg-gray-800/60 cursor-grab z-auto"
                        )}
                        id={`task-${task.id}`} // Added ID for Deep Linking
                        onPointerDown={(e) => {
                            // Store timestamp on element dataset or state? 
                            // Using e.target won't work easily if we click children.
                            // Let's use a ref or simple mutable variable in scope? 
                            // Actually, since we are in a map, we can't easily use refs for each.
                            // We'll trust the provided.dragHandleProps to handle drag, 
                            // but we need to intercept the onClick.
                            // A common hack:
                            (e.currentTarget as any).dataset.mouseDownTime = Date.now();
                        }}
                        onClick={(e) => {
                            const downTime = Number((e.currentTarget as any).dataset.mouseDownTime || 0);
                            const upTime = Date.now();
                            if (upTime - downTime > 200) return; // It was a drag
                            if (e.defaultPrevented) return;
                            onEdit(task);
                        }}
                    >
                        {/* Priority Bar */}
                        <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-60", pConfig.bar)} />

                        {/* Header: Priority Badge & Actions */}
                        <div className="flex justify-between items-start pl-3">
                            <div className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 uppercase tracking-wider", pConfig.bg, pConfig.color, pConfig.border)}>
                                <Flag className="h-3 w-3" />
                                {pConfig.label} {task.priority}
                            </div>

                            {/* Actions Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icons.more className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-panel border-white/10 text-gray-200 z-[9999]">
                                    <DropdownMenuItem onClick={() => onEdit(task)} className="focus:bg-white/10">Edit Task</DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-400 focus:bg-red-500/10 focus:text-red-300">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Title */}
                        <div className="space-y-1 pl-3">
                            <h4 className={cn("text-sm font-semibold leading-tight text-gray-200 transition-colors", task.status === 'Completed' && "line-through text-muted-foreground decoration-white/20")}>
                                {task.title}
                            </h4>
                            {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {task.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer: Date & Avatar */}
                        <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/5 pl-3">
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
                                            <div className="h-6 w-6 rounded-full ring-2 ring-black/50 overflow-hidden relative">
                                                {assignee.photoURL ? (
                                                    <Image
                                                        src={assignee.photoURL}
                                                        alt="User"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className={cn("h-full w-full flex items-center justify-center text-[8px] font-bold border", getAvatarColor(assignee.displayName || assignee.email || "?"))}>
                                                        {(assignee.displayName || assignee.email || "?").substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="bg-black/90 backdrop-blur-xl border-white/10 text-xs">{assignee.displayName || assignee.email}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10" title="Unassigned">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>
                );
            }}
        </Draggable>
    );
};