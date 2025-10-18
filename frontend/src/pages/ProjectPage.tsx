"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Calendar,
  RefreshCw,
  FileText,
  Palette,
  Zap,
  FolderOpen,
  Eye,
  Save,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import AgentPopover from "@/components/AgentPopover";

import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import PreviewComponent from "@/components/Preview-comp";
import { TooltipButton } from "@/components/Header-comp";

export default function ProjectPage() {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = params.projectId as string;
  const { state, toggleSidebar } = useSidebar();

  const { user } = useAuthStore();
  const {
    projects,
    projectFilesLoading,
    error: projectError,
    fetchUserProjects,
    getProjectFiles,
    runProject,
  } = useProjectStore();

  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewTransitioning, setIsPreviewTransitioning] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [jsContent, setJsContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncedContent, setLastSyncedContent] = useState<{
    html: string;
    css: string;
    js: string;
  }>({ html: htmlContent, css: cssContent, js: jsContent });

  // Get current project from the projects array
  const project = projects.find((p: any) => p.id === projectId);

  // Load data on mount
  useEffect(() => {
    if (projectId && user) {
      // Only fetch user projects if we don't have any projects yet
      if (projects.length === 0) {
        fetchUserProjects();
      }
      // Always fetch project files when projectId changes
      getProjectFiles(projectId);
    }
  }, [projectId, user, projects.length, fetchUserProjects, getProjectFiles]);

  // Sync file contents with local state (only when not saving)
  useEffect(() => {
    if (project?.files && !isSaving) {
      const html = project.files.find((f: any) => f.type === "html");
      const css = project.files.find((f: any) => f.type === "css");
      const js = project.files.find((f: any) => f.type === "js");

      const newHtmlContent = html?.content || getDefaultHtml();
      const newCssContent = css?.content || getDefaultCss();
      const newJsContent = js?.content || getDefaultJs();
      setLastSyncedContent({ html: newHtmlContent, css: newCssContent, js: newJsContent });

      // Only update if content is different from what we have locally
      // This prevents unnecessary re-renders when saving
      const currentContent = { html: htmlContent, css: cssContent, js: jsContent };
      const newContent = { html: newHtmlContent, css: newCssContent, js: newJsContent };

      if (JSON.stringify(currentContent) !== JSON.stringify(lastSyncedContent)) {
        setHtmlContent(newHtmlContent);
        setCssContent(newCssContent);
        setJsContent(newJsContent);
        setLastSyncedContent(newContent);
        setHasUnsavedChanges(false);
      }
    }
  }, [project?.files, isSaving]);

  const htmlFile = project?.files.find((f: any) => f.type === "html");
  const cssFile = project?.files.find((f: any) => f.type === "css");
  const jsFile = project?.files.find((f: any) => f.type === "js");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRefreshPreview = () => {
    setHtmlContent(prev => prev);
    toast.success("Preview refreshed", { duration: 1000, style: { width: "auto", minWidth: "fit-content", padding: 10 }, });
  };

  const handleRunInNewWindow = () => {
    if (project) {
      runProject(project.id);
      toast.success("Opening project in new window", { duration: 1000, style: { width: "auto", minWidth: "fit-content", padding: 10 }, });
    }
  };

  const getDefaultHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project?.name || 'My Project'}</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to ${project?.name || 'My Project'}!</h1>
        <p>Start building your amazing project!</p>
        <button onclick="changeColor()">Click me!</button>
    </div>
</body>
</html>`;

  const getDefaultCss = () => `/* Add your styles here */

body {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 2rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}`;

  const getDefaultJs = () => `// Add your JavaScript here
console.log("Hello World from ${project?.name || 'My Project'}!");

// Example: Add some interactivity
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded successfully!");
    
    // Add click event to heading
    const heading = document.querySelector("h1");
    if (heading) {
        heading.addEventListener("click", function() {
            this.style.transform = this.style.transform === "scale(1.1)" 
                ? "scale(1)" 
                : "scale(1.1)";
            this.style.transition = "transform 0.3s ease";
        });
    }
});

// Function for the button click
function changeColor() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = randomColor;
    
    console.log("Background color changed!");
}

// Example: Add some animations
function animateElements() {
    const elements = document.querySelectorAll("p");
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, index * 200);
    });
}`;



  const handleHtmlChange = (value: string | undefined) => {
    setHtmlContent(value || "");
    setHasUnsavedChanges(true);
  };

  const handleCssChange = (value: string | undefined) => {
    setCssContent(value || "");
    setHasUnsavedChanges(true);
  };

  const handleJsChange = (value: string | undefined) => {
    setJsContent(value || "");
    setHasUnsavedChanges(true);
  };

  // Handler for AI-generated files
  const handleFilesGenerated = useCallback((files: { html: string; css: string; js: string }) => {
    setHtmlContent(files.html);
    setCssContent(files.css);
    setJsContent(files.js);
    setHasUnsavedChanges(true);
  }, []);

  const saveAllFiles = async () => {
    if (!project || isSaving) return;

    setIsSaving(true);
    try {
      const { updateProjectFile } = useProjectStore.getState();

      // Update or create HTML file
      const htmlFile = project.files.find((f: any) => f.type === "html");
      if (htmlFile) {
        await updateProjectFile(project.id, htmlFile.id, { content: htmlContent });
      }

      // Update or create CSS file
      const cssFile = project.files.find((f: any) => f.type === "css");
      if (cssFile) {
        await updateProjectFile(project.id, cssFile.id, { content: cssContent });
      }

      // Update or create JS file
      const jsFile = project.files.find((f: any) => f.type === "js");
      if (jsFile) {
        await updateProjectFile(project.id, jsFile.id, { content: jsContent });
      }

      // Update the last synced content to current content
      setLastSyncedContent({
        html: htmlContent,
        css: cssContent,
        js: jsContent
      });

      setHasUnsavedChanges(false);
      toast.success("All files saved successfully!", { duration: 2000, style: { width: "auto", minWidth: "fit-content", padding: 10 }, });
    } catch (error) {
      toast.error("Failed to save files", { duration: 3000 });
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAllFiles();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [htmlContent, cssContent, jsContent, project]);





  // Memoized preview content generation for better performance
  const generatePreviewContent = useMemo(() => {
    if (!project) return "";

    let content = htmlContent || getDefaultHtml();

    // Remove external CSS link references and inject inline CSS
    if (cssContent) {
      // Remove external CSS link references
      content = content.replace(
        /<link[^>]*rel=["']stylesheet["'][^>]*href=["']styles\.css["'][^>]*>/gi,
        ''
      );
      content = content.replace(
        /<link[^>]*href=["']styles\.css["'][^>]*rel=["']stylesheet["'][^>]*>/gi,
        ''
      );

      content = content.replace(
        '</head>',
        `<style>\n${cssContent}\n</style>\n</head>`
      );
    }

    // Remove external JS script references and inject inline JS
    if (jsContent) {
      // Remove external JS script references
      content = content.replace(
        /<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi,
        ''
      );

      content = content.replace(
        '</body>',
        `<script>\n${jsContent}\n</script>\n</body>`
      );
    }

    return content;
  }, [project, htmlContent, cssContent, jsContent]);

  // Update preview content when generated content changes
  useEffect(() => {
    if (generatePreviewContent) {
      setPreviewContent(generatePreviewContent);
    }
  }, [generatePreviewContent]);

  // Smooth preview opening and closing functions
  const openPreview = useCallback(() => {
    setIsPreviewTransitioning(true);
    // Small delay to ensure content is ready
    setTimeout(() => {
      setShowPreview(true);
      setTimeout(() => setIsPreviewTransitioning(false), 300);
    }, 50);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewTransitioning(true);
    setShowPreview(false);
    setTimeout(() => setIsPreviewTransitioning(false), 300);
  }, []);

  if (projectFilesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading project...</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{projectError}</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (

    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Project Header */}
      <div className="border-b bg-card/50 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="p-0" />
            <FolderOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Project
            </Badge>
            {project.createdAt && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground ml-4">
                <Calendar className="h-4 w-4" />
                Created {formatDate(project.createdAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={hasUnsavedChanges ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={saveAllFiles}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {hasUnsavedChanges ? "(Ctrl+S)" : ""}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={openPreview}
              disabled={isPreviewTransitioning}
            >
              <Eye className="h-4 w-4" />
              {isPreviewTransitioning ? "Loading..." : "Preview"}
            </Button>
            <TooltipProvider>

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
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main Content with Monaco Editors */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* HTML Editor */}
          <ResizablePanel defaultSize={33} minSize={25}>

            <div className="h-full flex flex-col">
              <div className="border-b p-3 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">HTML</span>
                  {htmlFile ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {htmlFile.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                      No file
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="html"
                  value={htmlContent}
                  onChange={handleHtmlChange}
                  theme="vs-dark"
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    formatOnPaste: true,
                    formatOnType: true
                  }}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* CSS Editor */}
          <ResizablePanel defaultSize={33} minSize={25}>
            <div className="h-full flex flex-col">
              <div className="border-b p-3 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">CSS</span>
                  {cssFile ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {cssFile.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                      No file
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="css"
                  value={cssContent}
                  onChange={handleCssChange}
                  theme="vs-dark"
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    formatOnPaste: true,
                    formatOnType: true
                  }}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* JavaScript Editor */}
          <ResizablePanel defaultSize={34} minSize={25}>
            <div className="h-full flex flex-col">
              <div className="border-b p-3 bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm">JavaScript</span>
                  {jsFile ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {jsFile.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                      No file
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="javascript"
                  value={jsContent}
                  onChange={handleJsChange}
                  theme="vs-dark"
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    formatOnPaste: true,
                    formatOnType: true
                  }}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Resizable Preview Overlay using Resizable Panels */}
      {showPreview && (
        <PreviewComponent
          isOpen={showPreview}
          onClose={closePreview}
          previewContent={previewContent}
          projectName={project?.name}
          isTransitioning={isPreviewTransitioning}
          onRefresh={handleRefreshPreview}
          onOpenInNewWindow={handleRunInNewWindow}
        />
      )}

      {/* AI Agent Popover */}
      <AgentPopover onFilesGenerated={handleFilesGenerated} currentHtml={htmlContent} currentCss={cssContent} currentJs={jsContent} />
    </div>
  );
}
