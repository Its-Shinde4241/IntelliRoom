import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import { Separator } from "@radix-ui/react-separator";
import Header, { languages } from "../components/Header-comp";

export default function ProjectFilesPage() {
    const params = useParams();
    const projectId = params.projectId;
    const fileType = params.fileType;
    const navigate = useNavigate();

    const { projects, loading: projectLoading, getProjectFiles, updateProjectFile, runProject } = useProjectStore();

    const [mode, setMode] = useState<string>("light");
    const [editorValue, setEditorValue] = useState("");
    const [position, setPosition] = useState({ line: 1, column: 1 });
    const [charCount, setCharCount] = useState(0);

    const editorRef = useRef<any>(null);
    const layoutTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Find current project and active file
    const currentProject = useMemo(() => {
        return projects.find(p => p.id === projectId);
    }, [projects, projectId]);

    const activeFile = useMemo(() => {
        if (!currentProject || !fileType) return null;
        return currentProject.files.find(f => f.type === fileType);
    }, [currentProject, fileType]);

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

    useEffect(() => {
        if (activeFile) {
            setEditorValue(activeFile.content || "");
        } else {
            setEditorValue("");
        }
    }, [activeFile]);



    useEffect(() => {
        if (editorRef.current) {
            if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
            layoutTimeoutRef.current = setTimeout(() => editorRef.current.layout(), 10);
        }
        return () => {
            if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
        };
    });


    const handleEditorDidMount: OnMount = useCallback((editor) => {
        editorRef.current = editor;

        editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
                e.preventDefault();
                handleSave();
            }
        });

        editor.onDidChangeCursorPosition((e) =>
            setPosition({ line: e.position.lineNumber, column: e.position.column })
        );
        editor.onDidChangeModelContent(() => setCharCount(editor.getValue().length));
        setCharCount(editor.getValue().length);
        setTimeout(() => editor.layout(), 100);
    }, []);

    const getLangIdFromType = useCallback((fileType: string) => {
        // For HTML/CSS/JS web projects, we don't want terminal execution
        // Return -1 to hide the Run button in Header
        if (fileType === "html" || fileType === "css" || fileType === "js") {
            return "-1";
        }

        const typeToLanguageMap: Record<string, string> = {
            ts: "typescript", py: "python", java: "java", cpp: "cpp", c: "c"
        };
        const languageName = typeToLanguageMap[fileType] || "txt";
        const language = languages.find(
            (lang) => lang.monaco === languageName || lang.id === languageName
        );
        return language ? language.id : "-1";
    }, []);

    const getMonacoLanguage = useCallback((fileType: string) => {
        const typeToMonacoMap: Record<string, string> = {
            js: "javascript", ts: "typescript", py: "python", html: "html",
            css: "css", java: "java", cpp: "cpp", c: "c", json: "json",
            xml: "xml", sql: "sql", md: "markdown", txt: "plaintext"
        };
        return typeToMonacoMap[fileType] || "plaintext";
    }, []);

    const editorLanguage = useMemo(() => {
        return activeFile ? getMonacoLanguage(activeFile.type) : "plaintext";
    }, [activeFile?.type, getMonacoLanguage]);

    const handleCodeChange = useCallback((value: string | undefined) => {
        setEditorValue(value || "");
    }, []);





    const handleSave = useCallback(async () => {
        if (!activeFile || !projectId) return;
        try {
            await updateProjectFile(projectId, activeFile.id, { content: editorValue });
            toast.success("File saved!", {
                duration: 1000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
        } catch (error) {
            toast.error("Failed to save file", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
        }
    }, [activeFile, editorValue, projectId, updateProjectFile]);
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
                onRun={() => { }} // Disabled for HTML/CSS/JS projects
                onSave={handleSave}
                onCopy={handleCopy}
                onDownload={handleDownload}
                isCompiling={false} // No compilation for web projects
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
                                {projectLoading && (
                                    <>
                                        <Separator orientation="vertical" className="w-[1px] h-3 bg-border" />
                                        <span className="text-yellow-600 animate-pulse">Loading...</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
