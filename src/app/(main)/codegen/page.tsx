"use client";

import { useState, useEffect, useRef } from "react";
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
  Workflow,
  Trash2
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

  const outputRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem("devstudio-input");
    const savedOutput = localStorage.getItem("devstudio-output");
    if (savedInput) setInput(savedInput);
    if (savedOutput) setOutput(savedOutput);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem("devstudio-input", input);
  }, [input]);

  useEffect(() => {
    localStorage.setItem("devstudio-output", output);
  }, [output]);

  // Sync scrolling between textarea and line numbers
  const handleScroll = () => {
    if (outputRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = outputRef.current.scrollTop;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setOutput(""); // Explicitly clear output on tab switch
    // Keep input as context might be useful, or user can clear manually.
  };

  const handleGenerate = async () => {
    if (!input) return;
    setIsLoading(true);

    const lowerInput = input.toLowerCase();
    let language = "typescript";
    if (lowerInput.includes("python") || lowerInput.includes("def ")) language = "python";
    else if (lowerInput.includes("java") || lowerInput.includes("public class")) language = "java";
    else if (lowerInput.includes("html") || lowerInput.includes("div")) language = "html";
    else if (lowerInput.includes("sql") || lowerInput.includes("select")) language = "sql";
    else if (lowerInput.includes("css") || lowerInput.includes("font-")) language = "css";

    try {
      setTimeout(() => {
        let result = "";

        // --- 1. ARCHITECT (System Design) ---
        if (activeTab === "architect") {
          const entityName = input.split(' ')[0] || "Entity";
          if (language === "python" || lowerInput.includes("django")) {
            result = `# 🏗️ SYSTEM ARCHITECTURE: ${input}\n\n## 1. Data Models (Django/SQLAlchemy)\n\`\`\`python\nclass ${entityName}(models.Model):\n    """\n    Represents the core ${entityName} entity in the system.\n    """\n    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)\n    created_at = models.DateTimeField(auto_now_add=True, db_index=True)\n    updated_at = models.DateTimeField(auto_now=True)\n    is_active = models.BooleanField(default=True)\n    \n    # Business Fields\n    metadata = models.JSONField(default=dict, blank=True)\n\n    class Meta:\n        ordering = ['-created_at']\n        indexes = [\n            models.Index(fields=['created_at', 'is_active'])\n        ]\n\`\`\`\n\n## 2. API Design (RESTful)\n- **GET** \`/api/v1/${entityName.toLowerCase()}s/\` - List all (Paginated)\n- **POST** \`/api/v1/${entityName.toLowerCase()}s/\` - Create new\n- **GET** \`/api/v1/${entityName.toLowerCase()}s/{id}/\` - Retrieve detail\n\n## 3. Service Layer\n- \`${entityName}Service\`: Handles business logic, validation, and side-effects (e.g., notifications).`;
          } else if (language === "java" || lowerInput.includes("spring")) {
            result = `// 🏗️ SYSTEM ARCHITECTURE: ${input}\n\n// 1. Domain Entity\n@Entity\n@Table(name = "${entityName.toLowerCase()}s")\n@Data\n@Builder\npublic class ${entityName} {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n\n    @Column(nullable = false)\n    private String status;\n\n    @CreatedDate\n    private Instant createdAt;\n}\n\n// 2. Repository Layer\n@Repository\npublic interface ${entityName}Repository extends JpaRepository<${entityName}, Long> {\n    Optional<${entityName}> findByStatus(String status);\n}\n\n// 3. Service Layer\n@Service\n@RequiredArgsConstructor\npublic class ${entityName}Service {\n    private final ${entityName}Repository repository;\n    \n    @Transactional\n    public ${entityName} create(${entityName}DTO dto) {\n        // Implementation\n        return repository.save(mapper.toEntity(dto));\n    }\n}`;
          } else {
            result = `// 🏗️ SYSTEM ARCHITECTURE: ${input}\n\n// 1. Database Schema (Prisma/PostgreSQL)\nmodel ${entityName} {\n  id        String   @id @default(cuid())\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  \n  // Relations\n  userId    String\n  user      User     @relation(fields: [userId], references: [id])\n  \n  @@index([userId])\n}\n\n// 2. API Routes (Next.js App Router)\n// app/api/${entityName.toLowerCase()}/route.ts\nexport async function POST(req: Request) {\n  const body = await req.json();\n  const validated = ${entityName}Schema.parse(body);\n  // Business Logic\n}\n\n// 3. Component Hierarchy\n// - ${entityName}Page (Layout)\n//   - ${entityName}List (Smart Component)\n//     - ${entityName}Card (Presentational)\n//   - Create${entityName}Modal (Form)`;
          }

          // --- 2. TESTS (Unit & Integration) ---
        } else if (activeTab === "tests") {
          const componentName = input.split(' ')[0] || "Component";
          if (language === "python") {
            result = `import pytest\nfrom rest_framework.test import APIClient\nfrom .models import ${componentName}\n\n@pytest.mark.django_db\nclass Test${componentName}Flow:\n    """\n    Integration tests for ${componentName} lifecycle.\n    """\n    \n    def setup_method(self):\n        self.client = APIClient()\n        self.payload = {"name": "Test Item"}\n\n    def test_create_successful(self):\n        """Should successfully create a new ${componentName} with valid data."""\n        response = self.client.post('/api/v1/${componentName.toLowerCase()}/', self.payload)\n        assert response.status_code == 201\n        assert ${componentName}.objects.count() == 1\n\n    def test_invalid_payload_returns_400(self):\n        """Should fail validation when required fields are missing."""\n        response = self.client.post('/api/v1/${componentName.toLowerCase()}/', {})\n        assert response.status_code == 400`;
          } else if (language === "java") {
            result = `import org.junit.jupiter.api.Test;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport static org.mockito.Mockito.*;\nimport static org.assertj.core.api.Assertions.*;\n\n@SpringBootTest\nclass ${componentName}ServiceTest {\n\n    @MockBean\n    private ${componentName}Repository repository;\n\n    @Autowired\n    private ${componentName}Service service;\n\n    @Test\n    void shouldCreate${componentName}Successfully() {\n        // Given\n        var dto = new ${componentName}DTO("Test");\n        var entity = new ${componentName}(1L, "Test");\n        when(repository.save(any())).thenReturn(entity);\n\n        // When\n        var result = service.create(dto);\n\n        // Then\n        assertThat(result).isNotNull();\n        assertThat(result.getName()).isEqualTo("Test");\n        verify(repository).save(any());\n    }\n}`;
          } else {
            result = `import { render, screen, fireEvent, waitFor } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { ${componentName} } from './${componentName}';\n\ndescribe('<${componentName} />', () => {\n  const mockSubmit = jest.fn();\n\n  beforeEach(() => {\n    mockSubmit.mockClear();\n  });\n\n  it('should render the form fields correctly', () => {\n    render(<${componentName} onSubmit={mockSubmit} />);\n    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();\n    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();\n  });\n\n  it('should handle user input and submission', async () => {\n    render(<${componentName} onSubmit={mockSubmit} />);\n    const user = userEvent.setup();\n    \n    await user.type(screen.getByLabelText(/name/i), 'New Item');\n    await user.click(screen.getByRole('button', { name: /save/i }));\n    \n    await waitFor(() => {\n      expect(mockSubmit).toHaveBeenCalledWith({ name: 'New Item' });\n    });\n  });\n\n  it('should display error message on API failure', async () => {\n    mockSubmit.mockRejectedValue(new Error('API Error'));\n    render(<${componentName} onSubmit={mockSubmit} />);\n    // ... error handling assertion\n  });\n});`;
          }

          // --- 3. SNIPPETS (Robust Code) ---
        } else if (activeTab === "snippets") {
          if (language === "python") {
            result = `def ${input.replace(/\s+/g, '_').toLowerCase()}(data: list[dict]) -> dict:\n    """\n    ${input}\n    Processes input data with error handling and logging.\n    \n    Args:\n        data (list[dict]): The input payload\n    \n    Returns:\n        dict: Processed result\n    """\n    try:\n        import logging\n        logger = logging.getLogger(__name__)\n        \n        # Validation\n        if not data:\n            raise ValueError("Input data cannot be empty")\n            \n        # Processing Logic\n        processed = [d for d in data if d.get('active')]\n        \n        logger.info(f"Processed {len(processed)} items")\n        return {"success": True, "count": len(processed), "items": processed}\n        \n    except Exception as e:\n        logger.error(f"Error in ${input}: {str(e)}")\n        return {"success": False, "error": str(e)}`;
          } else if (language === "sql") {
            result = `-- 🔍 Specialized Query for: ${input}\n\nWITH RecentStats AS (\n    SELECT \n        active_users,\n        DATE_TRUNC('day', created_at) as stat_date\n    FROM analytics\n    WHERE created_at >= NOW() - INTERVAL '30 days'\n)\nSELECT \n    u.id,\n    u.email,\n    COALESCE(s.active_users, 0) as activity_score\nFROM users u\nLEFT JOIN RecentStats s ON s.stat_date = DATE_TRUNC('day', u.last_login)\nWHERE u.status = 'ACTIVE'\nORDER BY u.last_login DESC\nLIMIT 100;`;
          } else {
            result = `/**\n * ✨ ${input} - Robust Implementation\n */\nimport { useState, useCallback, useEffect } from 'react';\n\nexport const use${input.replace(/\s+/g, '')} = (initialValue: any) => {\n  const [state, setState] = useState(initialValue);\n  const [error, setError] = useState<Error | null>(null);\n  const [loading, setLoading] = useState(false);\n\n  const execute = useCallback(async () => {\n    setLoading(true);\n    setError(null);\n    try {\n      // Implementation logic here\n      const response = await fetch('/api/resource');\n      const data = await response.json();\n      setState(data);\n    } catch (err) {\n      setError(err instanceof Error ? err : new Error('Unknown error'));\n      console.error('Error in use${input}:', err);\n    } finally {\n      setLoading(false);\n    }\n  }, []);\n\n  return { state, error, loading, execute };\n};`;
          }

          // --- 4. DOCS (Professional Markdown) ---
        } else if (activeTab === "docs") {
          const moduleName = input.split(' ')[0] || "Module";
          result = `# 📘 ${moduleName} Documentation\n\n## Overview\nThe **${moduleName}** module is responsible for handling *${input}*. It assumes a stateless environment and provides robust error handling.\n\n## 🔧 Installation\n\`\`\`bash\nnpm install @work-sync/${moduleName.toLowerCase()}\n\`\`\`\n\n## ⚙️ Configuration\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| \`apiKey\` | string | required | Your authenticated API key |\n| \`retries\` | number | 3 | Number of failure attempts |\n| \`onSuccess\` | function | - | Callback triggered on completion |\n\n## 🚀 Usage Example\n\`\`\`typescript\nimport { ${moduleName} } from '@work-sync/core';\n\nconst instance = new ${moduleName}({\n    apiKey: process.env.API_KEY,\n    onSuccess: (data) => console.log('Done!', data)\n});\n\nawait instance.initialize();\n\`\`\`\n\n## ⚠️ Error Handling\nThe module throws \`ValidationException\` for invalid inputs. Always wrap calls in \`try/catch\`.`;

          // --- 5. DIAGRAMS (Mermaid) ---
        } else {
          result = `flowchart TD\n    start([🚀 Start Request]) --> auth{Is Authenticated?}\n    \n    %% Auth Flow\n    auth -->|No| login[Redirect to Login]\n    auth -->|Yes| validate[Validate Input]\n    \n    %% Validation\n    validate -->|Invalid| err1[Return 400 Error]\n    validate -->|Valid| db[(Database Lookup)]\n    \n    %% Logic\n    db -->|Found| cache{Check Redis Info}\n    db -->|Not Found| err2[Return 404]\n    \n    cache -->|Hit| return([Return Cached Data])\n    cache -->|Miss| compute[Compute & Store]\n    compute --> return\n    \n    style start fill:#22c55e,stroke:#fff\n    style err1 fill:#ef4444,stroke:#fff\n    style err2 fill:#ef4444,stroke:#fff\n    style db fill:#3b82f6,stroke:#fff`;
        }

        setOutput(result);
        setIsLoading(false);
        playSound("success");
      }, 1500); // Slightly longer delay for "thinking" effect
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
      <div className="flex items-center justify-between px-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
            <Icons.codegen className="h-6 w-6 text-blue-400" />
            DevTools Pro
          </h1>
          <p className="text-muted-foreground text-sm">AI-Powered Development Environment</p>
        </div>
        <div className="flex gap-2">
          {/* Easter Egg Trigger Area (invisible) */}
          <div className="w-10 h-10 opacity-0 cursor-default" onClick={() => console.log("Matrix?")}></div>
        </div>
      </div>

      {/* Main Glass Workspace */}
      <Card className="flex-1 bg-gray-900/60 backdrop-blur-xl border-blue-500/10 shadow-2xl flex flex-col overflow-hidden min-h-0">
        <div className="flex border-b border-blue-500/10 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as Tab)}
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

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 p-6 gap-6 overflow-hidden min-h-0">
          {/* Input Section */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 shrink-0">
              <Terminal className="h-4 w-4" /> Input Context
            </h3>
            <Textarea
              placeholder={
                activeTab === "architect" ? "Describe functionality (e.g., 'Create a user profile system with avatars')..." :
                  activeTab === "tests" ? "Paste function/component to test..." :
                    activeTab === "snippets" ? "Describe snippet (e.g., 'useEffect for data fetching')..." :
                      "Paste code to document..."
              }
              className="flex-1 bg-black/40 border-blue-500/10 resize-none font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-500/50 min-h-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setOutput("");
                  // We do NOT clear input as it might be useful to keep
                }}
                className="shrink-0 border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Output
              </Button>
              <Button
                onClick={() => {
                  handleGenerate();
                  playSound("click");
                }}
                className="flex-1 shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none shadow-lg shadow-blue-500/20 transition-all active:scale-95"
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
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4 h-full relative group min-h-0">
            <div className="flex items-center justify-between shrink-0">
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

            <div className="flex-1 bg-black/80 border border-blue-500/10 rounded-lg p-0 font-mono text-sm overflow-hidden relative shadow-inner flex flex-col min-h-0">
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
              <div className="flex min-h-full flex-1 relative">
                {/* Line Numbers */}
                <div
                  ref={lineNumbersRef}
                  className="hidden md:block select-none text-right pr-4 pl-2 py-4 text-white/40 border-r border-white/10 font-mono text-sm leading-6 bg-white/5 w-14 overflow-hidden"
                  aria-hidden="true"
                >
                  {Array.from({ length: Math.max((output.match(/\n/g) || []).length + 1, 1) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Output TextArea */}
                <Textarea
                  ref={outputRef}
                  onScroll={handleScroll}
                  className="flex-1 bg-transparent border-none resize-none text-white font-mono text-sm leading-6 p-4 focus-visible:ring-0 min-h-full scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent overflow-y-auto h-full"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="// Output will appear here..."
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Status */}
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Agent Systems Online</span>
        </div>
        <span>v3.0.2 Stable</span>
      </div>
    </div>
  );
}