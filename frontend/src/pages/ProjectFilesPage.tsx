import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import { Separator } from "@radix-ui/react-separator";
import Header, { languages } from "../components/Header-comp";
import { useTheme } from "@/components/theme-provider";
// import AgentPopover from "@/components/AgentPopover";

export default function ProjectFilesPage() {
    const params = useParams();
    const projectId = params.projectId;
    const fileType = params.fileType;
    const navigate = useNavigate();
    const { theme } = useTheme();

    const { projects, projectFilesLoading, getProjectFiles, updateProjectFile, runProject } = useProjectStore();

    const [mode, setMode] = useState<string>(() => {
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "hc-black" : "light";
        }
        return theme === "dark" ? "hc-black" : "light";
    });
    const [editorValue, setEditorValue] = useState("");
    const [position, setPosition] = useState({ line: 1, column: 1 });
    const [charCount, setCharCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const editorRef = useRef<any>(null);
    const layoutTimeoutRef = useRef<NodeJS.Timeout>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Find current project and active file
    const currentProject = useMemo(() => {
        return projects.find(p => p.id === projectId);
    }, [projects, projectId]);

    const activeFile = useMemo(() => {
        if (!currentProject || !fileType) return null;
        return currentProject.files.find(f => f.type === fileType);
    }, [currentProject, fileType]);

    useEffect(() => {
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "hc-black" : "light";
            setMode(systemTheme);

            // Listen for system theme changes
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                setMode(e.matches ? "hc-black" : "light");
            };

            mediaQuery.addEventListener("change", handleSystemThemeChange);

            return () => {
                mediaQuery.removeEventListener("change", handleSystemThemeChange);
            };
        } else {
            setMode(theme === "dark" ? "hc-black" : "light");
        }
    }, [theme]);
    // Load project files on mount
    useEffect(() => {
        if (projectId) {
            try {
                getProjectFiles(projectId);
            } catch (error) {
                navigate("/");
                setEditorValue("");
                toast.error("Error loading project files");
            }
        }
    }, [projectId, getProjectFiles, navigate]);

    // Update editor value when active file changes
    useEffect(() => {
        if (activeFile) {
            setEditorValue(activeFile.content || "");
        } else {
            setEditorValue("");
        }
    }, [activeFile]);

    // Handle editor layout
    useEffect(() => {
        if (editorRef.current) {
            if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
            layoutTimeoutRef.current = setTimeout(() => editorRef.current.layout(), 10);
        }
        return () => {
            if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
        };
    });

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    const handleEditorDidMount: OnMount = useCallback((editor) => {
        editorRef.current = editor;

        // Monaco editor Ctrl+S handler (backup for when editor is focused)
        editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
                e.preventDefault();
                // The document-level handler will handle the save
            }
        });

        editor.onDidChangeCursorPosition((e) =>
            setPosition({ line: e.position.lineNumber, column: e.position.column })
        );

        editor.onDidChangeModelContent(() => {
            const content = editor.getValue();
            setCharCount(content.length);
            setEditorValue(content); // Keep editor value in sync
        });

        setCharCount(editor.getValue().length);
        setTimeout(() => editor.layout(), 100);
    }, []);

    const getLangIdFromType = useCallback((fileType: string) => {
        if (fileType === "html" || fileType === "css" || fileType === "js") {
            return "-1";
        }

        const typeToLanguageMap: Record<string, string> = {
            ts: "typescript",
            py: "python",
            java: "java",
            cpp: "cpp",
            c: "c"
        };

        const languageName = typeToLanguageMap[fileType] || "txt";
        const language = languages.find(
            (lang) => lang.monaco === languageName || lang.id === languageName
        );
        return language ? language.id : "-1";
    }, []);

    const getMonacoLanguage = useCallback((fileType: string) => {
        const typeToMonacoMap: Record<string, string> = {
            js: "javascript",
            ts: "typescript",
            py: "python",
            html: "html",
            css: "css",
            java: "java",
            cpp: "cpp",
            c: "c",
            json: "json",
            xml: "xml",
            sql: "sql",
            md: "markdown",
            txt: "plaintext"
        };
        return typeToMonacoMap[fileType] || "plaintext";
    }, []);

    const editorLanguage = useMemo(() => {
        return activeFile ? getMonacoLanguage(activeFile.type) : "plaintext";
    }, [activeFile?.type, getMonacoLanguage]);

    const handleCodeChange = useCallback((value: string | undefined) => {
        setEditorValue(value || "");
    }, []);

    // Handler for AI-generated files
    // const handleFilesGenerated = useCallback((files: { html: string; css: string; js: string }) => {
    //     if (activeFile) {
    //         let newContent = "";
    //         switch (activeFile.type) {
    //             case "html":
    //                 newContent = files.html;
    //                 break;
    //             case "css":
    //                 newContent = files.css;
    //                 break;
    //             case "js":
    //                 newContent = files.js;
    //                 break;
    //             default:
    //                 toast.error("AI generation not supported for this file type");
    //                 return;
    //         }

    //         setEditorValue(newContent);
    //         if (editorRef.current) {
    //             editorRef.current.setValue(newContent);
    //         }

    //         toast.success(`AI-generated ${activeFile.type.toUpperCase()} code loaded`, {
    //             duration: 3000,
    //             style: {
    //                 width: "auto",
    //                 minWidth: "fit-content",
    //                 padding: 10
    //             }
    //         });
    //     }
    // }, [activeFile]);

    const handleSave = useCallback(async () => {
        if (!activeFile || !projectId || isSaving) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);

            try {
                // Always get the latest content from the editor
                const currentContent = editorRef.current ? editorRef.current.getValue() : editorValue;

                await updateProjectFile(projectId, activeFile.id, { content: currentContent });

                toast.success("File saved!", {
                    duration: 1000,
                    style: { width: "auto", minWidth: "fit-content", padding: 6 },
                });
            } catch (error) {
                console.error('Save error:', error);
                toast.error("Failed to save file", {
                    duration: 2000,
                    style: { width: "auto", minWidth: "fit-content", padding: 6 },
                });
            } finally {
                setIsSaving(false);
            }
        }, 100); // 100ms debounce
    }, [activeFile, editorValue, projectId, updateProjectFile, isSaving]);

    // Add document-level Ctrl+S save functionality
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleSave();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSave]);

    const handlePreview = useCallback(() => {
        if (!projectId) return;
        const project = projects.find(p => p.id === projectId);
        toast.success(`Opening "${project?.name || 'project'}" in browser...`, {
            duration: 2000,
            style: { width: "auto", minWidth: "fit-content", padding: 6 },
        });
        runProject(projectId);
    }, [projectId, projects, runProject]);

    const handleCopy = useCallback(async () => {
        try {
            // Get current editor content for copying
            const currentContent = editorRef.current ? editorRef.current.getValue() : editorValue;
            await navigator.clipboard.writeText(currentContent);
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
        // Get current editor content for download
        const currentContent = editorRef.current ? editorRef.current.getValue() : editorValue;
        const filename = `${activeFile.name}.${activeFile.type}`;
        const blob = new Blob([currentContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }, [activeFile, editorValue]);

    if (!currentProject) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold mb-2">Project not found</h2>
                    <Button onClick={() => navigate("/")} variant="outline">
                        Go back to home
                    </Button>
                </div>
            </div>
        );
    }

    if (!activeFile) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold mb-2">File not found</h2>
                    <p className="text-muted-foreground mb-4">
                        The {fileType} file doesn't exist in this project.
                    </p>
                    <Button onClick={() => navigate(`/project/${projectId}`)} variant="outline">
                        Go back to project
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            <Header
                language={activeFile ? getLangIdFromType(activeFile.type) : "-1"}
                mode={mode}
                onModeToggle={() => setMode((prev) => (prev === "light" ? "vs-dark" : "light"))}
                onRun={() => { }}
                onSave={handleSave}
                onCopy={handleCopy}
                onDownload={handleDownload}
                isCompiling={isSaving}
                onHandlePreview={handlePreview}
            />

            <div className="flex-1 flex flex-col overflow-hidden editor-container">
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            key={activeFile?.id}
                            theme={mode}
                            language={editorLanguage}
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

                    {activeFile && (
                        <div className="h-7 flex items-center justify-between pl-2 pr-1 text-xs bg-muted/80 border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <span>Ln {position.line}</span>
                                <Separator orientation="vertical" className="w-[1px] h-3 bg-border" />
                                <span>Col {position.column}</span>
                                <Separator orientation="vertical" className="w-[1px] h-3 bg-border" />
                                <span>{charCount} chars</span>
                                {(projectFilesLoading || isSaving) && (
                                    <>
                                        <Separator orientation="vertical" className="w-[1px] h-3 bg-border" />
                                        <span className="text-yellow-600 animate-pulse">
                                            {isSaving ? "Saving..." : "Loading..."}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Agent Popover */}
            {/* <AgentPopover onFilesGenerated={handleFilesGenerated} /> */}
        </div>
    );
}