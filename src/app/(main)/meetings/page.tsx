
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
import { CheckCircle } from "lucide-react";

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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });


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
        <div className="grid gap-8 relative overflow-hidden p-2">
            {/* Blobs removed for performance and cleaner UI */}
            <div className="relative z-10">
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Meeting Co-Pilot</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Upload recordings, paste transcripts, and let AI do the heavy lifting.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border-cyan-500/10 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-blue-100">Meeting Input</CardTitle>
                        <CardDescription className="text-blue-200/50">Paste a transcript or upload a file.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div {...getRootProps()} className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-950/30'}`}>
                            <input {...getInputProps()} />
                            <Icons.upload className={`w-12 h-12 mb-4 ${isDragActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                            {isDragActive ?
                                <p className="text-sm text-cyan-400 font-medium">Drop the files here ...</p> :
                                <p className="text-sm text-slate-400">Drag 'n' drop files here, or click to select</p>
                            }
                            {fileName && <Badge variant="secondary" className="mt-4 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">{fileName}</Badge>}
                        </div>

                        <Textarea
                            placeholder="Or paste your meeting transcript here...&#10;[00:00:01] Speaker A: Hello everyone, let's get started..."
                            className="min-h-[200px] flex-1 resize-y bg-black/40 border-cyan-500/10 font-mono text-sm focus-visible:ring-cyan-500/50"
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20">
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
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-100">
                                <Icons.bot className="h-5 w-5 text-cyan-400" /> AI-Generated Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="min-h-[100px]">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[80%] bg-cyan-900/20" />
                                    <Skeleton className="h-4 w-[90%] bg-cyan-900/20" />
                                    <Skeleton className="h-4 w-[75%] bg-cyan-900/20" />
                                </div>
                            ) : extractedInfo?.summary ? (
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{extractedInfo.summary}</p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">AI-generated summary will appear here.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-100">
                                <Icons.search className="h-5 w-5 text-purple-400" /> Key Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-[90%] bg-cyan-900/20" />
                                    <Skeleton className="h-8 w-[70%] bg-cyan-900/20" />
                                </div>
                            ) : extractedInfo && (extractedInfo.keywords?.length > 0 || extractedInfo.dates?.length > 0 || extractedInfo.times?.length > 0) ? (
                                <div className="space-y-6">
                                    {extractedInfo.keywords?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-3">Keywords & Topics</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {extractedInfo.keywords.map((kw, i) => (
                                                    <Badge key={i} variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20">
                                                        {kw}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {(extractedInfo.dates?.length > 0 || extractedInfo.times?.length > 0) && (
                                        <div>
                                            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-3">Dates & Times</h4>
                                            <ul className="space-y-2">
                                                {(extractedInfo.dates || []).concat(extractedInfo.times || []).map((item, index) => (
                                                    <li key={index} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/10">
                                                        <span className="text-slate-300">{item}</span>
                                                        <Button size="sm" variant="ghost" onClick={() => handleSetReminder(item)} className="h-7 text-xs hover:bg-cyan-500/20 hover:text-cyan-200">
                                                            <Icons.bell className="h-3 w-3 mr-2" />
                                                            Set Reminder
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : !isLoading ? (
                                <p className="text-sm text-slate-500 italic">Keywords, dates, and times will be extracted here.</p>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-100">
                                <CheckCircle className="h-5 w-5 text-emerald-400" /> Action Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[70%] bg-emerald-900/20" />
                                    <Skeleton className="h-4 w-[80%] bg-emerald-900/20" />
                                </div>
                            ) : extractedInfo?.actionItems.length ?? 0 > 0 ? (
                                <ul className="space-y-3">
                                    {extractedInfo?.actionItems.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between gap-3 text-sm p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                                            <span className="text-slate-300">{item}</span>
                                            <Button size="sm" variant="ghost" onClick={() => handleAddTask(item)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300">
                                                <Icons.add className="h-3 w-3 mr-2" />
                                                Add Task
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Extracted action items will appear here.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
