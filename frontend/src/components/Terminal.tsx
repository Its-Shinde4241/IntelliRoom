import type { Ref } from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import useCodeStore from "@/store/codeStore";
import {
  X,
  Terminal as TerminalIcon,
  FileInput,
  FileOutput,
} from "lucide-react";

type Terminal = {
  stdin: string;
  setStdin: (s: string) => void;
  terminalHeight: string | number | undefined;
  terminalRef: Ref<HTMLDivElement> | undefined;
  toggleTerminal: () => void;
  setIsResizing: (x: boolean) => void;
};

export default function Terminal({
  stdin,
  setStdin,
  terminalHeight,
  terminalRef,
  toggleTerminal,
  setIsResizing,
}: Terminal) {
  const { output, loading, error } = useCodeStore();
  const [activeTab, setActiveTab] = useState<"input" | "output">("output");

  return (
    <div
      className="border-t bg-background flex flex-col"
      style={{ height: terminalHeight }}
    >
      {/* Resize handle - More prominent and standard */}
      <div
        className="h-1 bg-border hover:bg-primary/50 transition-colors cursor-ns-resize relative group"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      >
        {/* Visual indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-0.5 bg-foreground/30 group-hover:bg-foreground/50 rounded-full" />
        </div>
      </div>

      {/* Terminal header with tabs */}
      <div className="flex items-center justify-between border-b bg-muted/30">
        <div className="flex">
          <button
            onClick={() => setActiveTab("input")}
            className={`px-3 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "input"
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileInput className="h-3 w-3" />
            Input
          </button>
          <button
            onClick={() => setActiveTab("output")}
            className={`px-3 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "output"
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileOutput className="h-3 w-3" />
            Output
            {(output || error) && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStdin("")}
            className="h-7 px-2 text-xs"
          >
            Clear Input
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTerminal}
            className="h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {/* Input tab */}
        {activeTab === "input" && (
          <div className="h-full p-3">
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter program input here..."
              className="w-full h-full p-3 text-sm font-mono border rounded-md bg-muted/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Output tab */}
        {activeTab === "output" && (
          <div
            ref={terminalRef}
            className="h-full overflow-y-auto p-3 font-mono text-sm"
          >
            {loading && (
              <div className="flex items-center gap-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                Compiling & Running...
              </div>
            )}

            {!loading && !output && !error && (
              <div className="text-muted-foreground flex items-center gap-2">
                <TerminalIcon className="h-4 w-4" />
                No output yet. Run your code to see results here.
              </div>
            )}

            {output && (
              <div className="text-green-600">
                <div className="text-xs text-muted-foreground mb-1">
                  OUTPUT:
                </div>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}

            {error && (
              <div className="text-red-600">
                <div className="text-xs text-muted-foreground mb-1">ERROR:</div>
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>Terminal</span>
          {loading && <span className="text-yellow-600">Running...</span>}
        </div>
        <div className="flex items-center gap-2">
          {stdin.length > 0 && <span>{stdin.length} chars in input</span>}
        </div>
      </div>
    </div>
  );
}
