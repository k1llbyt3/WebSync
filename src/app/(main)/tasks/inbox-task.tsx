import { Task } from "@/components/add-task-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InboxTaskProps {
    task: Task;
    userMap: Record<string, any>;
    onAccept: (task: Task) => void;
    onDecline: (task: Task) => void;
}

export const InboxTask = ({ task, userMap, onAccept, onDecline }: InboxTaskProps) => {
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
                    <Button size="sm" onClick={() => onAccept(task)}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => onDecline(task)}>Decline</Button>
                </div>
            </CardContent>
        </Card>
    )
}