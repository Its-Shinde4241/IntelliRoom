"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Terminal as TerminalIcon } from "lucide-react";
import { toast } from "sonner";
import useCodeStore from "@/store/codeStore";
import useFileStore from "@/store/fileStore";
import { Separator } from "@radix-ui/react-separator";
import Terminal from "@/components/Terminal";
import Header, { languages } from "../components/Header-comp";

export default function FilePage() {
  const params = useParams();
  const fileId = params.fileId;
  const navigate = useNavigate();

  const {
    activeFile,
    loading: fileLoading,
    getFile,
    updateFileContent,
  } = useFileStore();
  const { runCode, loading: codeLoading } = useCodeStore();
  const [mode, setMode] = useState<string>("light");

  const [editorValue, setEditorValue] = useState("");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [stdin, setStdin] = useState("");

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const layoutTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (fileId) getFile(fileId);
  }, [fileId, getFile]);

  useEffect(() => {
    if (activeFile) setEditorValue(activeFile.content);
    else {
      navigate("/");
      setEditorValue("");
    }
  }, [activeFile]);

  //mouse event handlers for terminal resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector(".editor-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      const minHeight = 100;
      const maxHeight = containerRect.height * 0.7;

      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      setTerminalHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) =>
      setPosition({ line: e.position.lineNumber, column: e.position.column })
    );
    editor.onDidChangeModelContent(() =>
      setCharCount(editor.getValue().length)
    );
    setCharCount(editor.getValue().length);
    setTimeout(() => editor.layout(), 100);
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
      layoutTimeoutRef.current = setTimeout(
        () => editorRef.current.layout(),
        10
      );
    }
    return () => {
      if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
    };
  }, [isTerminalOpen, terminalHeight]);

  const getLangIdFromType = useCallback((fileType: string) => {
    const typeToLanguageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      html: "html",
      css: "css",
      java: "java",
      cpp: "cpp",
      c: "c",
    };
    const languageName = typeToLanguageMap[fileType] || "txt";
    const language = languages.find(
      (lang) => lang.monaco === languageName || lang.id === languageName
    );
    return language ? language.id : "-1";
  }, []);
  const handleCodeChange = useCallback(
    (value: string | undefined) => setEditorValue(value || ""),
    []
  );

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen((prev) => {
      const newState = !prev;
      setTimeout(
        () => {
          if (editorRef.current) editorRef.current.layout();
        },
        newState ? 200 : 100
      );
      return newState;
    });
  }, []);

  const handleRun = useCallback(async () => {
    if (!activeFile) return;
    if (!isTerminalOpen) setIsTerminalOpen(true);
    try {
      const language = getLangIdFromType(activeFile.type);
      await runCode(editorValue, language, stdin);
      setTimeout(() => {
        if (terminalRef.current)
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }, 300);
    } catch (error: any) {
      toast.error(error);
    }
  }, [
    activeFile,
    getLangIdFromType,
    editorValue,
    stdin,
    runCode,
    isTerminalOpen,
  ]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    updateFileContent(activeFile.id, editorValue);
    toast.success("File saved!", {
      duration: 1000,
      style: { width: "auto", minWidth: "fit-content", padding: 6 },
    });
  }, [activeFile, editorValue, updateFileContent]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editorValue);
      toast.success("Copied to clipboard!", {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [editorValue]);

  const handleDownload = useCallback(() => {
    if (!activeFile) return;

    const filename = `${activeFile.name}.${activeFile.type}`;

    const blob = new Blob([editorValue], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }, [activeFile, editorValue]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header
        language={activeFile ? getLangIdFromType(activeFile.type) : "-1"}
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

      <div className="flex-1 flex flex-col overflow-hidden editor-container">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              theme={mode}
              language={
                activeFile
                  ? languages.find(
                      (lang) => lang.id === getLangIdFromType(activeFile.type)
                    )?.monaco || "plaintext"
                  : "plaintext"
              }
              value={editorValue}
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
          {activeFile?.type !== "text/plain" && (
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
                Terminal{" "}
                {isTerminalOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronUp className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Terminal */}
        {isTerminalOpen && (
          <div style={{ height: terminalHeight }} className="flex-shrink-0">
            <Terminal
              stdin={stdin}
              setStdin={setStdin}
              setIsResizing={setIsResizing}
              terminalHeight={terminalHeight}
              terminalRef={terminalRef}
              toggleTerminal={toggleTerminal}
            />
          </div>
        )}
      </div>
    </div>
  );
}
