import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StrictModeDroppable } from "@/components/strict-mode-droppable";
import { DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd";
import { Task } from "@/components/add-task-form";
import { TaskCard } from "./task-card";
import { Icons } from "@/components/icons";

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
    <div className="flex flex-col h-full min-h-[500px] w-[320px] min-w-[320px] rounded-xl bg-secondary/30 border border-border/40 shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/40 rounded-t-xl backdrop-blur-sm">
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
              className={`
                flex flex-col gap-3 min-h-[150px] h-full transition-colors rounded-lg
                ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''}
              `}
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