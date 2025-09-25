"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Terminal as TerminalIcon } from "lucide-react";
import { toast } from "sonner";
import Header, { languages } from "../components/Header-comp";
import useCodeStore from "@/store/codeStore";
import { Separator } from "@radix-ui/react-separator";
import Terminal from "@/components/Terminal";

export default function RoomPage() {
  const params = useParams();
  const RoomId = params.roomId;

  const { runCode, loading, saveCode } = useCodeStore();

  const [language, setLanguage] = useState(languages[0].id);
  const [code, setCode] = useState(languages[0].defaultCode);
  const [mode, setMode] = useState<string>("light");

  // Terminal state
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const [stdin, setStdin] = useState(""); // input section

  const editorRef = useRef<any>(null);
  const layoutTimeoutRef = useRef<NodeJS.Timeout>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [charCount, setCharCount] = useState(0);

  const extensionMap: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    html: "html",
    css: "css",
  };

  // Editor mount
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
      }, 10); // Reduced timeout for more responsive resizing
    }
    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
    };
  }, [isTerminalOpen, terminalHeight]);

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

      // Trigger editor layout during resize
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

      // Final layout after resize
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

  const handleLanguageChange = useCallback((langId: string) => {
    const lang = languages.find((l) => l.id === langId)!;
    setLanguage(langId);
    setCode(lang.defaultCode);
  }, []);

  const handleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "vs-dark" : "light"));
  }, []);

  const handleRun = useCallback(async () => {
    if (!isTerminalOpen) {
      setIsTerminalOpen(true);
    }

    try {
      await runCode(code, language, stdin);
      // Auto-scroll terminal output after running
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 300);
    } catch (error: any) {
      toast.error(error);
    }
  }, [code, language, stdin, runCode, isTerminalOpen]);

  const handleSave = useCallback(() => {
    saveCode(code, RoomId!);
    toast("Code saved!", {
      duration: 1000,
      style: { width: "auto", minWidth: "fit-content", padding: 6 },
    });
  }, [RoomId, code, saveCode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!", {
        position: "bottom-right",
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    if (!code) return;

    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    const lang = languages
      .find((l) => l.id === language)
      ?.monaco?.toLowerCase();

    const ext = lang && extensionMap[lang] ? extensionMap[lang] : "txt";

    link.href = URL.createObjectURL(blob);
    link.download = `code.${ext}`;
    document.body.appendChild(link); // ensures Firefox compatibility
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }, [code, language]);

  const handleCodeChange = useCallback((val: string | undefined) => {
    setCode(val || "");
  }, []);

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
      ); // Longer delay when opening
      return newState;
    });
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header
        language={language}
        mode={mode}
        onModeToggle={handleMode}
        onRun={handleRun}
        onSave={handleSave}
        onCopy={handleCopy}
        onDownload={handleDownload}
        isCompiling={loading}
      />

      {/* EDITOR + TERMINAL CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden editor-container">
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div
            className={`flex-1 overflow-hidden ${isTerminalOpen ? "rounded-t-lg" : "rounded-lg"}`}
            style={{
              height: isTerminalOpen
                ? `calc(100% - ${terminalHeight}px)`
                : "100%",
              transition: "height 0.2s ease-out",
            }}
          >
            <Editor
              className="h-full w-full"
              theme={mode}
              language={
                languages.find((l) => l.id === language)?.monaco || "plaintext"
              }
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 16,
                minimap: { enabled: true, scale: 2 },
                automaticLayout: true,
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
              {loading && (
                <>
                  <Separator
                    orientation="vertical"
                    className="w-[1px] h-3 bg-border"
                  />
                  <span className="text-yellow-600 animate-pulse">
                    Compiling...
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
