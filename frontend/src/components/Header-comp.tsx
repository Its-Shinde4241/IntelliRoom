import { useCallback } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import {
  Play,
  Save,
  Copy,
  Download,
  Maximize2,
  Loader2,
  Moon,
  Sun,
  Minimize2,
  Share2,
} from "lucide-react";
import { Badge } from "./ui/badge";

const languages = [
  {
    id: "54", // Judge0 ID
    monaco: "cpp", // Monaco syntax highlighting
    label: "C++",
    defaultCode: `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  cout << "Hello Boss!";\n  return 0;\n}`,
  },
  {
    id: "52",
    monaco: "c",
    label: "C",
    defaultCode: `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  cout << "Hello Boss!";\n  return 0;\n}`,
  },
  {
    id: "62",
    monaco: "java",
    label: "Java",
    defaultCode: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Boss!");\n  }\n}`,
  },
  {
    id: "71",
    monaco: "python",
    label: "Python",
    defaultCode: `print("Hello Boss!")`,
  },
  {
    id: "63",
    monaco: "javascript",
    label: "JavaScript",
    defaultCode: `console.log("Hello Boss!");`,
  },
  {
    id: "74",
    monaco: "typescript",
    label: "TypeScript",
    defaultCode: `let msg: string = "Hello Boss!";\nconsole.log(msg);`,
  },
];

interface HeaderProps {
  language: string;
  mode: string;
  onModeToggle: () => void;
  onRun: () => void;
  onSave: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onShare?: () => void;
  isCompiling: boolean;
}

export default function Header({
  language,
  mode,
  onModeToggle,
  onRun,
  onSave,
  onCopy,
  onDownload,
  onShare,
  isCompiling,
}: HeaderProps) {
  const { state, toggleSidebar } = useSidebar();
  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      console.log("Share functionality not implemented");
    }
  }, [onShare]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div></div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Language selector */}
          <Badge variant={"outline"} className="cursor-pointer">
            {language == "-1"
              ? "txt"
              : languages.find((lang) => lang.id === language)?.label}
          </Badge>

          {/* Mode selector */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onModeToggle}
            className="h-8 w-8 p-0"
            title="Toggle editor theme"
          >
            {mode === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1">
            {language !== "-1" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRun}
                disabled={isCompiling}
                className="h-8 gap-2 text-green-600 hover:bg-green-100 hover:text-green-700"
                title="Run Code"
              >
                {isCompiling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="h-8 gap-2 text-primary hover:bg-primary/10 hover:text-primary"
              title="Save Code"
            >
              <Save className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-8 text-muted-foreground hover:text-foreground"
              title="Copy Code"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="h-8 text-muted-foreground hover:text-foreground"
              title="Download Code"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 text-muted-foreground hover:text-foreground"
              title="Share Code"
              disabled={true}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-foreground hidden md:block"
              onClick={toggleSidebar}
              title="Toggle Sidebar"
            >
              {state === "expanded" ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export { languages };
