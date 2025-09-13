"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Terminal as TerminalIcon } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header-comp";
import useCodeStore from "@/store/codeStore";
import useFileStore from "@/store/fileStore";
import { Separator } from "@radix-ui/react-separator";
import Terminal from "@/components/Terminal";

export default function FilePage() {
  const params = useParams();
  const fileId = params.fileId;

  const {
    activeFile,
    loading: fileLoading,
    getFile,
    updateFileContent,
    updateFileName,
  } = useFileStore();
  const { runCode, loading: codeLoading } = useCodeStore();

  const [mode, setMode] = useState<string>("light");

  // Terminal state
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [stdin, setStdin] = useState("");

  const layoutTimeoutRef = useRef<NodeJS.Timeout>(null);

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [charCount, setCharCount] = useState(0);

  // Load file on mount and file ID change
  useEffect(() => {
    if (fileId) {
      getFile(fileId);
    }
  }, [fileId, getFile]);

  // Editor mount handler
  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setPosition({ line: e.position.lineNumber, column: e.position.column });
    });
    editor.onDidChangeModelContent(() => {
      setCharCount(editor.getValue().length);
    });
    setCharCount(editor.getValue().length);

    // Initial layout
    setTimeout(() => {
      editor.layout();
    }, 100);
  }, []);

  // Relayout editor when terminal toggles or resizes
  useEffect(() => {
    if (editorRef.current) {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
      layoutTimeoutRef.current = setTimeout(() => {
        editorRef.current.layout();
      }, 10);
    }
    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
    };
  }, [isTerminalOpen, terminalHeight]);

  // Get language from file extension
  const getLanguageFromFileName = useCallback((fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      case "py":
        return "python";
      case "html":
        return "html";
      case "css":
        return "css";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      case "c":
        return "c";
      default:
        return "plaintext";
    }
  }, []);

  // Language change handler
  const handleLanguageChange = useCallback(
    (langId: string) => {
      if (!activeFile) return;

      const extensions: Record<string, string> = {
        javascript: "js",
        typescript: "ts",
        python: "py",
        html: "html",
        css: "css",
        java: "java",
        cpp: "cpp",
        c: "c",
      };

      const ext = extensions[langId];
      if (!ext) return;

      const baseName = activeFile.name.split(".")[0];
      const newName = `${baseName}.${ext}`;
      updateFileName(activeFile.id, newName);
    },
    [activeFile, updateFileName]
  );

  // Code change handler
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!activeFile || !value) return;
      updateFileContent(activeFile.id, value);
    },
    [activeFile, updateFileContent]
  );

  // Terminal resize handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector(".editor-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      const minHeight = 200;
      const maxHeight = containerRect.height * 0.8;

      const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
      setTerminalHeight(clampedHeight);

      if (editorRef.current) {
        requestAnimationFrame(() => {
          editorRef.current.layout();
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.pointerEvents = "";

      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current.layout();
        }, 50);
      }
    };

    if (isResizing) {
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Window resize handler
  useEffect(() => {
    const handleWindowResize = () => {
      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current.layout();
        }, 100);
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // Terminal toggle handler
  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen((prev) => {
      const newState = !prev;
      setTimeout(
        () => {
          if (editorRef.current) {
            editorRef.current.layout();
          }
        },
        newState ? 200 : 100
      );
      return newState;
    });
  }, []);

  // Handle code execution
  const handleRun = useCallback(async () => {
    if (!activeFile) return;

    if (!isTerminalOpen) {
      setIsTerminalOpen(true);
    }

    try {
      const language = getLanguageFromFileName(activeFile.name);
      await runCode(activeFile.content, language, stdin);
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 300);
    } catch (error: any) {
      toast.error(error);
    }
  }, [activeFile, getLanguageFromFileName, stdin, runCode, isTerminalOpen]);

  // Handle file save
  const handleSave = useCallback(() => {
    if (!activeFile) return;
    updateFileContent(activeFile.id, activeFile.content);
    toast.success("File saved!", {
      duration: 1000,
      style: { width: "auto", minWidth: "fit-content", padding: 6 },
    });
  }, [activeFile, updateFileContent]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      toast.success("Copied to clipboard!", {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  }, [activeFile]);

  // Handle file download
  const handleDownload = useCallback(() => {
    if (!activeFile) return;

    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }, [activeFile]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header
        language={
          activeFile ? getLanguageFromFileName(activeFile.name) : "plaintext"
        }
        onLanguageChange={handleLanguageChange}
        mode={mode}
        onModeToggle={() =>
          setMode((prev) => (prev === "light" ? "vs-dark" : "light"))
        }
        onRun={handleRun}
        onSave={handleSave}
        onCopy={handleCopy}
        onDownload={handleDownload}
        isCompiling={codeLoading || fileLoading}
      />

      {/* EDITOR + TERMINAL CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden editor-container">
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height={
                isTerminalOpen ? `calc(100% - ${terminalHeight}px)` : "100%"
              }
              theme={mode}
              language={
                activeFile
                  ? getLanguageFromFileName(activeFile.name)
                  : "plaintext"
              }
              value={activeFile?.content || ""}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 16,
                minimap: { enabled: true, scale: 2 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                lineNumbers: "on",
                folding: true,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Status Bar */}
          <div className="h-7 flex items-center justify-between pl-2 pr-1 text-xs bg-muted/80 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span>Ln {position.line}</span>
              <Separator
                orientation="vertical"
                className="w-[1px] h-3 bg-border"
              />
              <span>Col {position.column}</span>
              <Separator
                orientation="vertical"
                className="w-[1px] h-3 bg-border"
              />
              <span>{charCount} chars</span>
              {(codeLoading || fileLoading) && (
                <>
                  <Separator
                    orientation="vertical"
                    className="w-[1px] h-3 bg-border"
                  />
                  <span className="text-yellow-600 animate-pulse">
                    Loading...
                  </span>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTerminal}
              className="h-6 text-xs gap-1.5 hover:bg-muted/60 px-0"
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

        {/* TERMINAL SECTION */}
        {isTerminalOpen && (
          <Terminal
            stdin={stdin}
            setStdin={setStdin}
            setIsResizing={setIsResizing}
            terminalHeight={terminalHeight}
            terminalRef={terminalRef}
            toggleTerminal={toggleTerminal}
          />
        )}
      </div>
    </div>
  );
}
