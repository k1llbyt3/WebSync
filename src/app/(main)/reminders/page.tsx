
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  deleteDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Reminder = {
  id: string;
  title: string;
  description: string;
  reminderDate: any; // Firestore timestamp
  userId: string;
};

const ReminderForm = ({ onSave, reminder, onOpenChange }: { onSave: (data: { title: string; reminderDate: Date }) => void, reminder?: Reminder | null, onOpenChange: (open: boolean) => void }) => {
    const [title, setTitle] = useState(reminder?.title || "");
    const [date, setDate] = useState<Date | undefined>(reminder ? new Date(reminder.reminderDate.seconds * 1000) : new Date());
    const [time, setTime] = useState(reminder ? format(new Date(reminder.reminderDate.seconds * 1000), "HH:mm") : "09:00");

    const handleSave = () => {
        if (!title || !date || !time) {
            alert("Please fill out all fields.");
            return;
        }
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDate = new Date(date);
        combinedDate.setHours(hours, minutes);

        onSave({ title, reminderDate: combinedDate });
        onOpenChange(false);
    }
    
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <Icons.calendar className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
            </div>
             <Button onClick={handleSave}>{reminder ? "Save Changes" : "Add Reminder"}</Button>
        </div>
    )
}

export default function RemindersPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const remindersCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, "users", user.uid, "reminders") : null),
    [firestore, user]
  );

  const { data: reminders, isLoading: isLoadingReminders } =
    useCollection<Reminder>(remindersCollectionRef);

  const sortedReminders = useMemo(() => {
    if (!reminders) return [];
    return [...reminders].sort(
      (a, b) => a.reminderDate.seconds - b.reminderDate.seconds
    );
  }, [reminders]);

  const handleDelete = (reminderId: string) => {
    if (!remindersCollectionRef) return;
    const reminderDocRef = doc(remindersCollectionRef, reminderId);
    deleteDocumentNonBlocking(reminderDocRef);
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been removed.",
    });
  };
  
  const handleSave = (data: { title: string; reminderDate: Date }) => {
     if (!remindersCollectionRef || !user) return;
     if (editingReminder) {
         // Update
         const reminderDocRef = doc(remindersCollectionRef, editingReminder.id);
         updateDocumentNonBlocking(reminderDocRef, data);
         toast({ title: "Reminder Updated" });
     } else {
         // Create
         addDocumentNonBlocking(remindersCollectionRef, { ...data, userId: user.uid });
         toast({ title: "Reminder Added" });
     }
     setEditingReminder(null);
  }
  
  const handleOpenDialog = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        setEditingReminder(null);
    }
  }

  const handleEditClick = (reminder: Reminder) => {
      setEditingReminder(reminder);
      setOpen(true);
  }

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Your Reminders</h1>
            <p className="text-muted-foreground">
            Never miss a deadline. Here are your upcoming reminders.
            </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
                <Button>
                    <Icons.add className="mr-2 h-4 w-4" /> Add Reminder
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
                </DialogHeader>
                <ReminderForm onSave={handleSave} reminder={editingReminder} onOpenChange={handleOpenDialog} />
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
          <CardDescription>
            You have {isLoadingReminders ? "..." : sortedReminders.length}{" "}
            reminder
            {sortedReminders.length !== 1 && "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingReminders && (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          )}
          {!isLoadingReminders && sortedReminders.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-muted/50 p-12 text-center">
              <Icons.bell className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Reminders Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Set reminders from your meetings or add them here.
              </p>
            </div>
          )}
          {!isLoadingReminders &&
            sortedReminders.map((reminder) => (
              <Card
                key={reminder.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icons.bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(reminder.reminderDate.seconds * 1000),
                        "PPP p"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(reminder)}
                    >
                    <Icons.edit className="h-5 w-5" />
                    <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reminder.id)}
                    >
                    <Icons.trash className="h-5 w-5 text-destructive" />
                    <span className="sr-only">Delete Reminder</span>
                    </Button>
                </div>
              </Card>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

    