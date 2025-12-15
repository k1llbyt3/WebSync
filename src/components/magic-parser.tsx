"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Wand2, Check, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MagicParser() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [tasks, setTasks] = useState<{ title: string; priority: string }[]>([]);

    const handleMagic = () => {
        if (!input) return;
        setIsProcessing(true);
        // Simulate AI parsing
        setTimeout(() => {
            const lines = input.split('\n').filter(line => line.trim().length > 0);
            const parsed = lines.map(line => {
                let priority = "Normal";
                if (line.toLowerCase().includes("urgent") || line.includes("!")) priority = "High";
                return {
                    title: line.replace(/^(?:-|\*|1\.)\s*/, '').trim(), // Remove bullets
                    priority
                };
            });
            setTasks(parsed);
            setIsProcessing(false);
        }, 1500);
    };

    const handleCreateAll = () => {
        // In real app, call createTask for each
        setIsOpen(false);
        setTasks([]);
        setInput("");
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 group">
                    <Wand2 className="mr-2 h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span className="group-data-[state=collapsed]:hidden bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 font-bold">
                        Magic Parser
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-black/80 backdrop-blur-3xl border-purple-500/20 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Wand2 className="h-6 w-6 text-purple-400" />
                        Magic Task Parser
                    </DialogTitle>
                    <p className="text-white/50">Paste emails, Slack messages, or rough notes. We'll turn them into tasks.</p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <AnimatePresence mode="wait">
                        {!tasks.length ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                key="input"
                                className="space-y-4"
                            >
                                <Textarea
                                    placeholder="e.g., Need to fix the login bug ASAP, call Mom, and update the docs..."
                                    className="min-h-[200px] bg-white/5 border-white/10 focus-visible:ring-purple-500/50 resize-none text-lg"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                                    size="lg"
                                    onClick={handleMagic}
                                    disabled={isProcessing || !input}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Parse Tasks
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="results"
                                className="space-y-4"
                            >
                                <div className="grid gap-2 max-h-[300px] overflow-auto pr-2">
                                    {tasks.map((task, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i}
                                        >
                                            <Card className="bg-white/5 border-white/10">
                                                <CardContent className="p-3 flex items-center justify-between">
                                                    <span className="font-medium">{task.title}</span>
                                                    <span className={task.priority === "High" ? "text-red-400 text-xs px-2 py-1 bg-red-400/10 rounded-full" : "text-blue-400 text-xs px-2 py-1 bg-blue-400/10 rounded-full"}>
                                                        {task.priority}
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="flex-1" onClick={() => setTasks([])}>Back</Button>
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleCreateAll}>
                                        <Check className="mr-2 h-4 w-4" />
                                        Import {tasks.length} Tasks
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
