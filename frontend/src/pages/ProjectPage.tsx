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
  ExternalLink,
  FileText,
  Palette,
  Zap,
  FolderOpen,
  Eye,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

// Import stores
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProjectPage() {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = params.projectId as string;

  // Zustand stores
  const { user } = useAuthStore();
  const {
    projects,
    loading: projectLoading,
    error: projectError,
    fetchUserProjects,
    getProjectFiles,
    runProject,
  } = useProjectStore();

  // Local state
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewTransitioning, setIsPreviewTransitioning] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  // File editing state
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [jsContent, setJsContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get current project from the projects array
  const project = projects.find((p: any) => p.id === projectId);

  // Load data on mount
  useEffect(() => {
    if (projectId && user) {
      fetchUserProjects();
      getProjectFiles(projectId);
    }
  }, [projectId, user, fetchUserProjects, getProjectFiles]);

  // Sync file contents with local state
  useEffect(() => {
    if (project?.files) {
      const html = project.files.find((f: any) => f.type === "html");
      const css = project.files.find((f: any) => f.type === "css");
      const js = project.files.find((f: any) => f.type === "js");

      setHtmlContent(html?.content || getDefaultHtml());
      setCssContent(css?.content || getDefaultCss());
      setJsContent(js?.content || getDefaultJs());
      setHasUnsavedChanges(false);
    }
  }, [project?.files]);

  // Get files by type
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
    // Force iframe refresh by temporarily changing the srcDoc
    setHtmlContent(prev => prev);
    toast.success("Preview refreshed", { duration: 1000 });
  };

  const handleRunInNewWindow = () => {
    if (project) {
      runProject(project.id);
      toast.success("Opening project in new window", { duration: 1000 });
    }
  };

  // Default content functions
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



  // Content change handlers
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

  // Save functionality
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

      setHasUnsavedChanges(false);
      toast.success("All files saved successfully!", { duration: 2000 });
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

    // Inject CSS
    if (cssContent) {
      content = content.replace(
        '</head>',
        `<style>\n${cssContent}\n</style>\n</head>`
      );
    }

    // Inject JS
    if (jsContent) {
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

  // Loading state
  if (projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading project...</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Project not found
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
    <TooltipProvider>

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
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out"
              onClick={closePreview}
            />

            {/* Resizable Preview Container */}
            <div className="fixed inset-0 z-50 pointer-events-none">
              <ResizablePanelGroup
                direction="horizontal"
                className="h-full pointer-events-auto transition-transform duration-300 ease-in-out"
              >
                {/* Main Content Area (Hidden/Transparent) */}
                <ResizablePanel
                  defaultSize={40}
                  minSize={10}
                  className="pointer-events-none opacity-0"
                />

                <ResizableHandle
                  withHandle
                  className="pointer-events-auto bg-transparent hover:bg-blue-500/20 transition-colors"
                />

                {/* Preview Panel */}
                <ResizablePanel
                  defaultSize={60}
                  minSize={25}
                  maxSize={90}
                  className="pointer-events-auto"
                >
                  <div className="h-full bg-background border-l shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out">
                    {/* Header */}
                    <div className="border-b p-3 bg-card/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold">Responsive Preview</h3>
                          <Badge variant="outline" className="text-xs">
                            Live Preview
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefreshPreview}
                                className="h-8 px-2 text-xs gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {/* Refresh */}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Refresh Preview</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleRunInNewWindow}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>

                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Open in New Window</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={closePreview}
                            className="h-8 w-8 p-0 transition-colors duration-200"
                            disabled={isPreviewTransitioning}
                          >
                            <X />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag the left handle to test different viewport sizes
                      </p>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
                      <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden border transition-all duration-300">
                        {isPreviewTransitioning ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                            <div className="text-center">
                              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                              <p className="text-sm text-muted-foreground">Loading preview...</p>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            key={`preview-${Date.now()}`}
                            srcDoc={previewContent}
                            title={`${project?.name || 'Project'} Preview`}
                            className="w-full h-full border-none transition-opacity duration-300"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            style={{ opacity: previewContent ? 1 : 0 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
