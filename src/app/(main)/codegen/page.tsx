
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { generateCodeSnippet } from "@/ai/flows/generate-code-snippet";
import { generateTestCases } from "@/ai/flows/generate-test-cases";
import { generateDocumentation } from "@/ai/flows/generate-documentation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type GenerationMode = "code" | "docs" | "tests";

interface TestCase {
    title: string;
    description: string;
    input: any;
    expected_output: any;
    edge_case: boolean;
}

export default function CodeGenPage() {
  const { toast } = useToast();
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [testFramework, setTestFramework] = useState("jest");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("code");
  
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testCases, setTestCases] = useState<{ cases: TestCase[], summary: string } | null>(null);

  const handleGenerate = async () => {
    if (!userInput) {
      toast({
        title: "Input is empty",
        description: "Please describe or paste the code you want to work with.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedOutput("");
    setTestCases(null);

    try {
      let result;
      if (generationMode === "code") {
        result = await generateCodeSnippet({
          taskDescription: userInput,
          programmingLanguage: language,
        });
        setGeneratedOutput(result.codeSnippet);
      } else if (generationMode === "tests") {
        const rawResult = await generateTestCases({
          code: userInput,
          language: language,
          framework: testFramework,
        });
        // Attempt to parse the JSON string from the AI
        try {
            // A common issue is the AI returning a JSON block within a markdown code fence.
            const jsonString = rawResult.testCases.replace(/```json\n|```/g, '').trim();
            const jsonEndIndex = jsonString.lastIndexOf(']');
            const jsonPart = jsonString.substring(0, jsonEndIndex + 1);
            const summaryPart = jsonString.substring(jsonEndIndex + 1).trim();

            const parsedCases = JSON.parse(jsonPart);
            setTestCases({ cases: parsedCases, summary: summaryPart });
            setGeneratedOutput(rawResult.testCases); // keep raw for copy
        } catch (e) {
             console.error("Failed to parse test cases JSON:", e);
             toast({
                title: "Parsing Error",
                description: "AI returned a result, but it wasn't valid JSON. Displaying raw output.",
                variant: "destructive"
             })
            setGeneratedOutput(rawResult.testCases); // Fallback to raw output
        }
      } else if (generationMode === "docs") {
        result = await generateDocumentation({
          code: userInput,
          language: language,
        });
        setGeneratedOutput(result.documentation);
      }
    } catch (error) {
      console.error(error);
      const modeText = generationMode.charAt(0).toUpperCase() + generationMode.slice(1);
      toast({
        title: `${modeText} Generation Failed`,
        description: `Could not generate the ${generationMode}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to Clipboard!" });
  };
  
  const getPlaceholderText = () => {
    switch (generationMode) {
        case 'code':
            return "e.g., 'A React component that fetches and displays a list of users from Firestore...'";
        case 'docs':
            return "e.g., Paste your function or component code here to generate documentation for it.";
        case 'tests':
            return "e.g., Paste your function or component code here to generate test cases.";
        default:
            return "Enter your request or paste your code here...";
    }
  }

  const RenderOutput = () => {
     if (isLoading) {
       return (
        <div className="space-y-2 p-4 border rounded-2xl h-full bg-muted/50 min-h-[400px]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[50%]" />
        </div>
       )
     }

     if (!generatedOutput) {
       return (
        <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Your generated output will appear here.
          </p>
        </div>
       )
     }
     
     if (generationMode === 'tests' && testCases) {
        return (
             <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedOutput)} className="absolute top-0 right-0 z-10">
                    <Icons.copy className="h-4 w-4" />
                </Button>
                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {testCases.cases.map((tc, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <span>{tc.title}</span>
                                        {tc.edge_case && <Badge variant="outline">Edge Case</Badge>}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 text-sm">
                                        <p className="text-muted-foreground">{tc.description}</p>
                                        <div>
                                            <h4 className="font-semibold">Input:</h4>
                                            <pre className="bg-muted p-2 mt-1 rounded-md text-xs whitespace-pre-wrap">
                                                <code>{JSON.stringify(tc.input, null, 2)}</code>
                                            </pre>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Expected Output:</h4>
                                            <pre className="bg-muted p-2 mt-1 rounded-md text-xs whitespace-pre-wrap">
                                                <code>{JSON.stringify(tc.expected_output, null, 2)}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                     {testCases.summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Icons.bot className="h-5 w-5"/> AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{testCases.summary}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
             </div>
        )
     }

     return (
        <div className="relative h-full min-h-[400px]">
             <pre className="bg-muted p-4 rounded-2xl overflow-x-auto text-sm h-full w-full whitespace-pre-wrap">
                <code>{generatedOutput}</code>
            </pre>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedOutput)} className="absolute top-2 right-2">
                <Icons.copy className="h-4 w-4" />
            </Button>
        </div>
     )
  }


  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold">AI Dev Suite: Code, Docs & Tests</h1>
        <p className="text-muted-foreground">
          Future-proof development. Human-focused guidance.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-4 h-full">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>
              Provide a natural language description, existing code, or requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              placeholder={getPlaceholderText()}
              className="min-h-[200px] resize-y"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Tabs defaultValue="code" onValueChange={(value) => setGenerationMode(value as GenerationMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">Code Snippet</TabsTrigger>
                <TabsTrigger value="docs">Documentation</TabsTrigger>
                <TabsTrigger value="tests">Test Cases</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="space-y-4 pt-4">
                 <Select onValueChange={setLanguage} defaultValue={language}>
                    <SelectTrigger><SelectValue placeholder="Language"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="docs" className="space-y-4 pt-4">
                <Select onValueChange={setLanguage} defaultValue={language}>
                    <SelectTrigger><SelectValue placeholder="Language"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="tests" className="space-y-4 pt-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={setLanguage} defaultValue={language}>
                        <SelectTrigger><SelectValue placeholder="Language"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setTestFramework} defaultValue={testFramework}>
                        <SelectTrigger><SelectValue placeholder="Framework"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jest">Jest</SelectItem>
                            <SelectItem value="pytest">PyTest</SelectItem>
                            <SelectItem value="vitest">Vitest</SelectItem>
                            <SelectItem value="junit">JUnit</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </TabsContent>
            </Tabs>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? <Icons.bot className="mr-2 h-4 w-4 animate-spin" /> : <Icons.sparkles className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generated Output</CardTitle>
            <CardDescription>Review the AI-generated results below.</CardDescription>
          </CardHeader>
          <CardContent>
            <RenderOutput />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    