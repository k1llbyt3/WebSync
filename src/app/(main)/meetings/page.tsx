
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { analyzeMeetingTranscript } from "@/ai/flows/analyze-meeting-transcript";
import { Skeleton } from "@/components/ui/skeleton";
import { useDropzone } from 'react-dropzone';
import { Badge } from "@/components/ui/badge";
import { useFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";

interface ExtractedInfo {
    summary: string;
    actionItems: string[];
    keywords: string[];
    dates: string[];
    times: string[];
}

export default function MeetingsPage() {
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [transcript, setTranscript] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result as string;
        if (file.type.startsWith('text/')) {
            setTranscript(binaryStr);
        } else {
             toast({
                title: "File type not supported",
                description: "For now, please use text-based files like .txt or .vtt.",
                variant: "destructive"
             })
             setTranscript(`File content for ${file.name} would be processed here.`);
        }
      }
      reader.readAsText(file);
    }
  }, [toast]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});


  const handleAnalyze = async () => {
    if (!transcript) {
        toast({ title: "Transcript is empty", description: "Please paste or upload a transcript to analyze.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setExtractedInfo(null);
    try {
        const result = await analyzeMeetingTranscript({ transcript });
        setExtractedInfo(result);
    } catch (error) {
        console.error(error);
        toast({ title: "Analysis Failed", description: "Could not analyze the transcript.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddTask = (item: string) => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to add tasks.", variant: "destructive" });
        return;
    }
    const tasksCollectionRef = collection(firestore, 'tasks');
    addDocumentNonBlocking(tasksCollectionRef, {
        title: item,
        description: "Generated from meeting transcript.",
        priority: 5, // Default priority
        status: "Backlog",
        userId: user.uid,
        assigneeId: user.uid, // Initially assigned to self
        userIds: [user.uid],
        createdAt: new Date(),
        dueDate: new Date(), // Consider making this adjustable
    });

    toast({
        title: "Task Added",
        description: `"${item}" added to your task board.`,
    })
  }

  const handleSetReminder = (item: string) => {
     if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to set reminders.", variant: "destructive" });
        return;
    }
    const remindersCollectionRef = collection(firestore, 'users', user.uid, 'reminders');
    addDocumentNonBlocking(remindersCollectionRef, {
        title: `Reminder: ${item}`,
        description: "From meeting transcript.",
        reminderDate: new Date(), // In a real app, you'd parse `item` to get a real date
        userId: user.uid,
        createdAt: new Date(),
    });

    toast({
        title: "Reminder Set",
        description: `Reminder for "${item}" has been saved.`,
    })
  }


  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold">Meeting Co-Pilot</h1>
        <p className="text-muted-foreground">
          Upload recordings, paste transcripts, and let AI do the heavy lifting.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Meeting Input</CardTitle>
            <CardDescription>Paste a transcript or upload a file.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <input {...getInputProps()} />
                <Icons.upload className="w-10 h-10 text-muted-foreground" />
                {isDragActive ?
                    <p className="mt-2 text-sm text-muted-foreground">Drop the files here ...</p> :
                    <p className="mt-2 text-sm text-muted-foreground">Drag 'n' drop files here, or click to select</p>
                }
                {fileName && <p className="text-xs text-primary mt-2">File: {fileName}</p>}
            </div>

            <Textarea
              placeholder="Or paste your meeting transcript here...&#10;[00:00:01] Speaker A: Hello everyone, let's get started..."
              className="min-h-[200px] flex-1 resize-y"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? (
                  <Icons.bot className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Transcript
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>AI-Generated Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[80%]" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[75%]" />
                        </div>
                    ) : extractedInfo?.summary ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{extractedInfo.summary}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">AI-generated summary will appear here.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Key Information</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-8 w-[90%]" />
                            <Skeleton className="h-8 w-[70%]" />
                        </div>
                    ) : extractedInfo && (extractedInfo.keywords?.length > 0 || extractedInfo.dates?.length > 0 || extractedInfo.times?.length > 0) ? (
                        <div className="space-y-4">
                            {extractedInfo.keywords?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Keywords & Topics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {extractedInfo.keywords.map((kw, i) => <Badge key={i} variant="secondary">{kw}</Badge>)}
                                    </div>
                                </div>
                            )}
                             {(extractedInfo.dates?.length > 0 || extractedInfo.times?.length > 0) && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Dates & Times</h4>
                                    <ul className="space-y-2">
                                    {(extractedInfo.dates || []).concat(extractedInfo.times || []).map((item, index) => (
                                        <li key={index} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="text-muted-foreground">{item}</span>
                                            <Button size="sm" variant="ghost" onClick={() => handleSetReminder(item)}>
                                                <Icons.bell className="h-4 w-4 mr-2" />
                                                Set Reminder
                                            </Button>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                             )}
                        </div>
                    ) : !isLoading ? (
                         <p className="text-sm text-muted-foreground">Keywords, dates, and times will be extracted here.</p>
                    ): null}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-[70%]" />
                            <Skeleton className="h-4 w-[80%]" />
                        </div>
                    ) : extractedInfo?.actionItems.length ?? 0 > 0 ? (
                        <ul className="space-y-3">
                            {extractedInfo?.actionItems.map((item, index) => (
                                <li key={index} className="flex items-center justify-between gap-2 text-sm">
                                    <span className="text-muted-foreground">{item}</span>
                                    <Button size="sm" variant="ghost" onClick={() => handleAddTask(item)}>
                                        <Icons.add className="h-4 w-4 mr-2" />
                                        Add Task
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-sm text-muted-foreground">Extracted action items will appear here.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
