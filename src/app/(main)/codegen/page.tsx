"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import {
  Code2,
  TestTube2,
  Library,
  FileText,
  Sparkles,
  Copy,
  Download,
  Terminal,
  Play,
  Workflow
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";

type Tab = "architect" | "tests" | "snippets" | "docs" | "diagrams";

export default function DevToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("architect");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSoundEffects();


  const handleGenerate = async () => {
    if (!input) return;
    setIsLoading(true);
    // Determine language from input context
    const lowerInput = input.toLowerCase();
    let language = "typescript";
    if (lowerInput.includes("python") || lowerInput.includes("def ")) language = "python";
    else if (lowerInput.includes("java") || lowerInput.includes("public class")) language = "java";
    else if (lowerInput.includes("html") || lowerInput.includes("div")) language = "html";
    else if (lowerInput.includes("sql") || lowerInput.includes("select")) language = "sql";
    else if (lowerInput.includes("css") || lowerInput.includes("font-")) language = "css";

    try {
      // Simulate AI Generation with more "dynamic" feel
      setTimeout(() => {
        let result = "";

        // Smart Mock Generation Logic
        if (activeTab === "architect") {
          if (language === "python") {
            result = `# Architecture Plan for: ${input}\n\n# 1. Data Models\nclass ${input.split(' ')[0]}(models.Model):\n    id = models.UUIDField(primary_key=True)\n    created_at = models.DateTimeField(auto_now_add=True)\n    data = models.JSONField()\n\n# 2. API Views\n# GET /api/v1/${input.replace(/\s+/g, '-').toLowerCase()}\nclass ${input.split(' ')[0]}View(APIView):\n    def get(self, request):\n        pass`;
          } else if (language === "java") {
            result = `// Architecture Plan for: ${input}\n\n// 1. Entity\n@Entity\npublic class ${input.split(' ')[0]} {\n    @Id\n    private Long id;\n    private String data;\n}\n\n// 2. Controller\n@RestController\n@RequestMapping("/api/${input.split(' ')[0].toLowerCase()}")\npublic class ${input.split(' ')[0]}Controller {\n    @GetMapping\n    public ResponseEntity<?> get() {\n        return ResponseEntity.ok().build();\n    }\n}`;
          } else {
            result = `// Architecture Plan for: ${input}\n\n// 1. Data Model\ninterface Data {\n  id: string;\n  createdAt: Date;\n  payload: any;\n}\n\n// 2. API Routes\n// GET /api/v1/${input.replace(/\s+/g, '-').toLowerCase()}\n// POST /api/v1/${input.replace(/\s+/g, '-').toLowerCase()}\n\n// 3. Components\nexport function ${input.replace(/\s+/g, '')}Component() {\n  return (\n    <div className="p-4">\n      <h1>${input}</h1>\n      {/* Implementation details go here */}\n    </div>\n  );\n}`;
          }
        } else if (activeTab === "tests") {
          if (language === "python") {
            result = `import unittest\nfrom ${input.split(' ')[0].toLowerCase()} import ${input.split(' ')[0]}\n\nclass Test${input.split(' ')[0]}(unittest.TestCase):\n    def test_initialization(self):\n        obj = ${input.split(' ')[0]}()\n        self.assertIsNotNone(obj)\n\n    def test_functionality(self):\n        # TODO: Implement test\n        pass`;
          } else if (language === "java") {
            result = `import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass ${input.split(' ')[0]}Test {\n    @Test\n    void testFunctionality() {\n        ${input.split(' ')[0]} component = new ${input.split(' ')[0]}();\n        assertNotNull(component);\n    }\n}`;
          } else {
            result = `import { render, screen, fireEvent } from '@testing-library/react';\nimport { ${input.split(' ')[0]} } from './component';\n\ndescribe('${input}', () => {\n  it('should render successfully', () => {\n    render(<${input.split(' ')[0]} />);\n    expect(screen.getByText(/${input}/i)).toBeInTheDocument();\n  });\n\n  it('handles user interaction', () => {\n    // TODO: Add specific interaction tests\n    const button = screen.getByRole('button');\n    fireEvent.click(button);\n    expect(button).toBeEnabled();\n  });\n});`;
          }
        } else if (activeTab === "snippets") {
          // Universal Snippet Switch
          if (language === "python") {
            result = `def ${input.replace(/\s+/g, '_').toLowerCase()}():\n    """\n    ${input}\n    """\n    data = []\n    # Todo: Implement logic\n    return data`;
          } else if (language === "sql") {
            result = `SELECT *\nFROM ${input.split(' ')[0] || 'users'}\nWHERE created_at > NOW() - INTERVAL '1 day';`;
          } else if (language === "html") {
            result = `<div class="container">\n  <h1>${input}</h1>\n  <p>Generated HTML Snippet</p>\n</div>`;
          } else if (language === "java") {
            result = `public static void ${input.replace(/\s+/g, '')}() {\n    // ${input} logic\n    System.out.println("Running...");\n}`;
          } else {
            // Default React/JS
            result = `// ${input} Snippet\nexport const ${input.replace(/\s+/g, '')} = () => {\n  const [value, setValue] = useState(null);\n\n  useEffect(() => {\n    // Logic for ${input}\n    console.log("Mounting ${input}");\n  }, []);\n\n  return <div>{value}</div>;\n};`;
          }
        } else if (activeTab === "docs") {
          result = `/**\n * Module: ${input}\n * Author: AI Assistant\n * Language: ${language.toUpperCase()}\n * Date: ${new Date().toISOString().split('T')[0]}\n * \n * Description:\n * A comprehensive guide to implementing ${input}.\n * \n * Usage:\n * See examples below.\n */\n\n// TODO: Add detailed API table\n// TODO: Add usage examples`;
        } else {
          result = `graph TD\n  Start([Start]) --> Input[/${input}/]\n  Input --> Process{Processing}\n  Process -->|Success| End([End])\n  Process -->|Fail| Error[Log Error]\n  style Input fill:#2563eb,stroke:#fff,stroke-width:2px`;
        }

        setOutput(result);
        setIsLoading(false);
        playSound("success");
      }, 1000);
    } catch (e) {
      setIsLoading(false);
      playSound("error");
    } finally {
      // Double safety to ensure loading state is cleared
      setTimeout(() => setIsLoading(false), 1100);
    }
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied to clipboard", description: "Code is ready to paste." });
  };

  const tabs = [
    { id: "architect", label: "Code Architect", icon: Code2, color: "text-blue-400" },
    { id: "tests", label: "Test Pilot", icon: TestTube2, color: "text-green-400" },
    { id: "snippets", label: "Snippet Vault", icon: Library, color: "text-purple-400" },
    { id: "docs", label: "DocuMind", icon: FileText, color: "text-orange-400" },
    { id: "diagrams", label: "Req. Architect", icon: Workflow, color: "text-pink-400" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 p-2 relative overflow-hidden">
      {/* Background Ambience */}
      {/* Background Ambience Removed for Performance */}

      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
            <Icons.codegen className="h-6 w-6 text-blue-400" />
            DevStudio Pro
          </h1>
          <p className="text-muted-foreground text-sm">AI-Powered Development Environment</p>
        </div>
        <div className="flex gap-2">
          {/* Easter Egg Trigger Area (invisible) */}
          <div className="w-10 h-10 opacity-0 cursor-default" onClick={() => console.log("Matrix?")}></div>
        </div>
      </div>

      {/* Main Glass Workspace */}
      <Card className="flex-1 bg-gray-900/60 backdrop-blur-xl border-blue-500/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex border-b border-blue-500/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative
                ${activeTab === tab.id ? "text-white bg-blue-500/10" : "text-muted-foreground hover:text-white hover:bg-blue-500/5"}
              `}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : "text-muted-foreground"}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${tab.color.split('-')[1]}-400 to-transparent`}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 p-6 gap-6 overflow-hidden">
          {/* Input Section */}
          <div className="flex flex-col gap-4 h-full">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Input Context
            </h3>
            <Textarea
              placeholder={
                activeTab === "architect" ? "Describe functionality (e.g., 'Create a user profile system with avatars')..." :
                  activeTab === "tests" ? "Paste function/component to test..." :
                    activeTab === "snippets" ? "Describe snippet (e.g., 'useEffect for data fetching')..." :
                      "Paste code to document..."
              }
              className="flex-1 bg-black/40 border-blue-500/10 resize-none font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-500/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              onClick={() => {
                handleGenerate();
                playSound("click");
              }}
              disabled={!input.trim()}
              className="w-full shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin text-white" />
                  <span className="text-white">Generating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Play className="h-4 w-4 fill-current text-white" />
                  <span className="text-white">Execute Agent</span>
                </div>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4 h-full relative group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code2 className="h-4 w-4" /> Generated Output
              </h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-black/80 border border-blue-500/10 rounded-lg p-0 font-mono text-sm text-blue-100 overflow-y-auto relative shadow-inner flex flex-col scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span className="text-xs text-blue-400 font-medium animate-pulse">Processing...</span>
                  </div>
                </div>
              )}
              <div className="flex min-h-full flex-1">
                <div className="hidden md:block select-none text-right pr-4 pl-2 py-4 text-white/20 border-r border-white/10 font-mono text-xs leading-6 bg-white/5 w-12" aria-hidden="true">
                  {Array.from({ length: (output.match(/\n/g) || []).length + 10 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <Textarea
                  className="flex-1 bg-transparent border-none resize-none text-blue-100 font-mono text-sm leading-6 p-4 focus-visible:ring-0 min-h-full"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="// Output will appear here. You can also edit this code directly..."
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Status */}
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Agent Systems Online</span>
        </div>
        <span>v3.0.1 Stable</span>
      </div>
    </div>
  );
}