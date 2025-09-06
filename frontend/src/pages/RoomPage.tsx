"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import {
  ChevronUp,
  ChevronDown,
  X,
  Terminal as TerminalIcon,
} from "lucide-react";
import { toast } from "sonner";
import Header, { languages } from "../components/Header-comp"; // Adjust import path as needed

// Mock API for code execution
const mockExecuteCode = async (
  code: string,
  language: string
): Promise<{ output: string; error?: string; executionTime: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startTime = Date.now();

      try {
        let output = "";
        let error = undefined;

        // Simulate different language outputs
        switch (language) {
          case "python":
            if (code.includes("print(")) {
              const match = code.match(/print\(["'](.+?)["']\)/);
              output = match ? match[1] : "Hello Boss!";
            } else if (code.includes("error") || code.includes("Error")) {
              error = "NameError: name 'undefined_variable' is not defined";
            } else {
              output = "Hello Boss!";
            }
            break;

          case "javascript":
          case "typescript":
            if (code.includes("console.log(")) {
              const match = code.match(/console\.log\(["'](.+?)["']\)/);
              output = match ? match[1] : "Hello Boss!";
            } else if (code.includes("error") || code.includes("Error")) {
              error = "ReferenceError: undefined_variable is not defined";
            } else {
              output = "Hello Boss!";
            }
            break;

          case "java":
            if (code.includes("System.out.println(")) {
              const match = code.match(/System\.out\.println\(["'](.+?)["']\)/);
              output = match ? match[1] : "Hello Boss!";
            } else if (code.includes("error") || code.includes("Error")) {
              error = "java.lang.RuntimeException: Undefined variable";
            } else {
              output = "Hello Boss!";
            }
            break;

          case "cpp":
            if (code.includes("cout")) {
              const match = code.match(/cout\s*<<\s*["'](.+?)["']/);
              output = match && match[1] ? match[1] : "Hello Boss!";
            } else if (code.includes("error") || code.includes("Error")) {
              error =
                "error: 'undefined_variable' was not declared in this scope";
            } else {
              output = "Hello Boss!";
            }
            break;

          default:
            output = "Hello Boss!";
        }

        const executionTime = Date.now() - startTime;
        resolve({ output, error, executionTime });
      } catch (e) {
        resolve({
          output: "",
          error: "Runtime error occurred",
          executionTime: Date.now() - startTime,
        });
      }
    }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
  });
};

interface TerminalOutput {
  id: string;
  timestamp: string;
  command: string;
  output?: string;
  error?: string;
  executionTime?: number;
  language: string;
}

export default function RoomPage() {
  const params = useParams();
  const RoomId = params.roomId;

  const [language, setLanguage] = useState(languages[0].id);
  const [code, setCode] = useState(languages[0].defaultCode);
  const [mode, setMode] = useState<string>("light");
  const [isCompiling, setIsCompiling] = useState(false);

  // Terminal state
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [isResizing, setIsResizing] = useState(false);

  const editorRef = useRef<any>(null);
  const layoutTimeoutRef = useRef<NodeJS.Timeout>(null!);
  const terminalRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [charCount, setCharCount] = useState(0);

  // Optimize editor mount with useCallback
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    let positionTimeout: NodeJS.Timeout;
    editor.onDidChangeCursorPosition((e) => {
      clearTimeout(positionTimeout);
      positionTimeout = setTimeout(() => {
        const pos = e.position;
        setPosition({ line: pos.lineNumber, column: pos.column });
      }, 50);
    });

    let charTimeout: NodeJS.Timeout;
    editor.onDidChangeModelContent(() => {
      clearTimeout(charTimeout);
      charTimeout = setTimeout(() => {
        const value = editor.getValue();
        setCharCount(value.length);
      }, 100);
    });

    setCharCount(editor.getValue().length);
  }, []);

  // Handle layout changes
  useEffect(() => {
    if (editorRef.current) {
      clearTimeout(layoutTimeoutRef.current);
      layoutTimeoutRef.current = setTimeout(() => {
        editorRef.current.layout();
      }, 150);
    }

    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
    };
  }, [isTerminalOpen, terminalHeight]);

  // Resize handler for terminal
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector(".editor-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      const minHeight = 150;
      const maxHeight = containerRect.height * 0.7;

      setTerminalHeight(Math.min(Math.max(newHeight, minHeight), maxHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleLanguageChange = useCallback((langId: string) => {
    const lang = languages.find((l) => l.id === langId)!;
    setLanguage(langId);
    setCode(lang.defaultCode);
  }, []);

  const handleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "vs-dark" : "light"));
  }, []);

  const handleRun = useCallback(async () => {
    setIsCompiling(true);
    setIsTerminalOpen(true);

    const outputId = `output-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString();

    // Add running indicator
    const runningOutput: TerminalOutput = {
      id: outputId,
      timestamp,
      command: `Running ${
        languages.find((l) => l.id === language)?.label
      } code...`,
      language,
    };

    setOutputs((prev) => [...prev, runningOutput]);

    try {
      const result = await mockExecuteCode(code, language);

      // Update with results
      setOutputs((prev) =>
        prev.map((output) =>
          output.id === outputId
            ? {
                ...output,
                command: `Executed ${
                  languages.find((l) => l.id === language)?.label
                } code`,
                output: result.output,
                error: result.error,
                executionTime: result.executionTime,
              }
            : output
        )
      );

      // Auto-scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      setOutputs((prev) =>
        prev.map((output) =>
          output.id === outputId
            ? {
                ...output,
                command: `Failed to execute ${
                  languages.find((l) => l.id === language)?.label
                } code`,
                error: "Execution failed",
              }
            : output
        )
      );
    } finally {
      setIsCompiling(false);
    }
  }, [code, language]);

  const handleSave = useCallback(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        localStorage.setItem(`code-${language}`, code);
        toast.success("Code saved!", { duration: 1000 });
      });
    } else {
      setTimeout(() => {
        localStorage.setItem(`code-${language}`, code);
        toast.success("Code saved!", { duration: 1000 });
      }, 0);
    }
  }, [language, code]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!", {
        position: "bottom-right",
        duration: 1000,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    requestAnimationFrame(() => {
      const blob = new Blob([code], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `code.${language}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    });
  }, [code, language]);

  const handleCodeChange = useCallback((val: string | undefined) => {
    setCode(val || "");
  }, []);

  const clearTerminal = useCallback(() => {
    setOutputs([]);
  }, []);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen((prev) => !prev);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        mode={mode}
        onModeToggle={handleMode}
        onRun={handleRun}
        onSave={handleSave}
        onCopy={handleCopy}
        onDownload={handleDownload}
        isCompiling={isCompiling}
      />

      {/* EDITOR AND TERMINAL CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden editor-container">
        {/* MONACO EDITOR */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            height: isTerminalOpen
              ? `calc(100% - ${terminalHeight}px)`
              : "100%",
          }}
        >
          <div className="flex-1 overflow-hidden">
            <Editor
              className="h-full"
              theme={mode}
              language={language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 16,
                minimap: { enabled: true, scale: 2 },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false,
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
              }}
            />
          </div>
          <div className="h-6 flex items-center justify-between px-4 text-xs bg-muted text-muted-foreground shrink-0">
            <div className="flex items-center gap-4">
              <span>
                Ln {position.line}, Col {position.column} | {charCount} chars
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTerminal}
              className="h-5 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <TerminalIcon className="h-3 w-3" />
              Terminal
              {isTerminalOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* TERMINAL */}
        {isTerminalOpen && (
          <div
            className="border-t bg-background"
            style={{ height: terminalHeight }}
          >
            {/* Terminal resize handle */}
            <div
              ref={resizeRef}
              className="h-1 cursor-ns-resize hover:bg-primary/20 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />

            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <TerminalIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Output</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTerminal}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTerminal}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Terminal content */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm"
              style={{ height: terminalHeight - 60 }}
            >
              {outputs.length === 0 ? (
                <div className="text-muted-foreground">
                  No output yet. Run your code to see results here.
                </div>
              ) : (
                outputs.map((output) => (
                  <div key={output.id} className="mb-4 last:mb-0">
                    <div className="text-muted-foreground text-xs mb-1">
                      [{output.timestamp}] {output.command}
                      {output.executionTime && (
                        <span className="ml-2">({output.executionTime}ms)</span>
                      )}
                    </div>
                    {output.output && (
                      <div className="text-green-600 dark:text-green-400 whitespace-pre-wrap">
                        {output.output}
                      </div>
                    )}
                    {output.error && (
                      <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap">
                        Error: {output.error}
                      </div>
                    )}
                    {!output.output && !output.error && isCompiling && (
                      <div className="text-yellow-600 dark:text-yellow-400">
                        Executing...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
