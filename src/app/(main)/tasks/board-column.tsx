import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StrictModeDroppable } from "@/components/strict-mode-droppable";
import { DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd";
import { Task } from "@/components/add-task-form";
import { TaskCard } from "./task-card";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

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

interface BoardColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  isDragging: boolean;
  userMap: Record<string, any>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const BoardColumn = ({ id, title, tasks, isDragging, userMap, onEdit, onDelete }: BoardColumnProps) => {
  return (
    <div className="flex flex-col h-full min-h-[500px] w-full rounded-xl shrink-0 shadow-2xl relative group">
      {/* Background Layer with Blur - Prevents Stacking Context Trap for Dragged Items */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl -z-10" />
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 rounded-t-xl">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <Badge variant="outline" className="bg-background text-xs font-mono">
          {tasks.length}
        </Badge>
      </div>

      {/* Droppable Area */}
      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
        <StrictModeDroppable droppableId={id}>
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex flex-col gap-3 min-h-[150px] h-full transition-colors rounded-lg",
                snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : ""
              )}
            >
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  userMap={userMap}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </div>
    </div>
  );
};