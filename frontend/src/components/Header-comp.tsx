import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ExternalLink,
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
  onHandlePreview?: () => void;
  isCompiling: boolean;
}

// Reusable Tooltip Button Component
interface TooltipButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const TooltipButton = ({
  onClick,
  icon,
  tooltip,
  variant = "ghost",
  size = "sm",
  className = "",
  disabled = false,
  children,
}: TooltipButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        className={`h-8 ${className}`}
      >
        {icon}
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

// Language Badge Component
const LanguageBadge = ({ language }: { language: string }) => {
  const currentLanguage = language === "-1"
    ? "txt"
    : languages.find((lang) => lang.id === language)?.label || "Unknown";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="cursor-pointer">
          {currentLanguage}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Current programming language: {currentLanguage}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Preview Button Component
const PreviewButton = ({ onHandlePreview }: { onHandlePreview?: () => void }) => {
  if (!onHandlePreview) return null;

  return (
    <TooltipButton
      onClick={onHandlePreview}
      icon={<ExternalLink className="h-4 w-4" />}
      tooltip="Open project preview in a new browser tab"
      variant="outline"
      className="gap-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
    >
      <span className="hidden sm:inline">Preview in Browser</span>
    </TooltipButton>
  );
};

// Theme Toggle Component
const ThemeToggle = ({ mode, onModeToggle }: { mode: string; onModeToggle: () => void }) => (
  <TooltipButton
    onClick={onModeToggle}
    icon={mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    tooltip={`Switch to ${mode === "light" ? "dark" : "light"} theme`}
    className="w-8 p-0"
  />
);

// Action Buttons Group Component
const ActionButtonsGroup = ({
  language,
  isCompiling,
  onRun,
  onSave,
  onCopy,
  onDownload,
  onShare,
}: {
  language: string;
  isCompiling: boolean;
  onRun: () => void;
  onSave: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onShare?: () => void;
}) => (
  <div className="flex items-center gap-1">
    {/* Run Button - Only show for programming languages */}
    {language !== "-1" && (
      <TooltipButton
        onClick={onRun}
        icon={
          isCompiling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )
        }
        tooltip={isCompiling ? "Code is running..." : "Execute your code"}
        disabled={isCompiling}
        className="gap-2 text-green-600 hover:bg-green-100 hover:text-green-700"
      />
    )}

    {/* Save Button */}
    <TooltipButton
      onClick={onSave}
      icon={<Save className="h-4 w-4" />}
      tooltip="Save your code (Ctrl+S)"
      className="gap-2 text-primary hover:bg-primary/10 hover:text-primary"
    />

    <Separator orientation="vertical" className="h-6 mx-1" />

    {/* Secondary Actions */}
    <TooltipButton
      onClick={onCopy}
      icon={<Copy className="h-4 w-4" />}
      tooltip="Copy code to clipboard"
      className="text-muted-foreground hover:text-foreground"
    />

    <TooltipButton
      onClick={onDownload}
      icon={<Download className="h-4 w-4" />}
      tooltip="Download code as file"
      className="text-muted-foreground hover:text-foreground"
    />

    <TooltipButton
      onClick={onShare || (() => console.log("Share functionality not implemented"))}
      icon={<Share2 className="h-4 w-4" />}
      tooltip="Share your code (Coming soon)"
      disabled={!onShare}
      className="text-muted-foreground hover:text-foreground"
    />
  </div>
);

// Sidebar Toggle Component
const SidebarToggleButton = () => {
  const { state, toggleSidebar } = useSidebar();

  return (
    <TooltipButton
      onClick={toggleSidebar}
      icon={
        state === "expanded" ? (
          <Maximize2 className="h-4 w-4" />
        ) : (
          <Minimize2 className="h-4 w-4" />
        )
      }
      tooltip={state === "expanded" ? "Expand window" : "Minimize window"}
      className="text-muted-foreground hover:text-foreground hidden md:block"
    />
  );
};

// Enhanced Sidebar Trigger
const EnhancedSidebarTrigger = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <SidebarTrigger className="-ml-1" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Toggle navigation sidebar</p>
    </TooltipContent>
  </Tooltip>
);

// Main Header Component
export default function Header({
  language,
  mode,
  onModeToggle,
  onRun,
  onSave,
  onCopy,
  onDownload,
  onShare,
  onHandlePreview,
  isCompiling,
}: HeaderProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <EnhancedSidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Preview Button */}
            <PreviewButton onHandlePreview={onHandlePreview} />

            {/* Language Badge */}
            <LanguageBadge language={language} />

            {/* Theme Toggle */}
            <ThemeToggle mode={mode} onModeToggle={onModeToggle} />

            {/* Action Buttons */}
            <ActionButtonsGroup
              language={language}
              isCompiling={isCompiling}
              onRun={onRun}
              onSave={onSave}
              onCopy={onCopy}
              onDownload={onDownload}
              onShare={onShare}
            />

            {/* Sidebar Toggle */}
            <SidebarToggleButton />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

export { languages };