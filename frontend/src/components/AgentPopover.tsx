import React, { useState, useCallback, useEffect, useRef } from "react";
import { Bot, Loader2, X, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ui/context-menu";
import useAgentStore from "@/store/AgentStore";
import { toast } from "sonner";

interface AgentPopoverProps {
    onFilesGenerated?: (files: { html: string; css: string; js: string }) => void;
    currentHtml: string;
    currentCss: string;
    currentJs: string;
}

export default function AgentPopover({ onFilesGenerated, currentHtml, currentCss, currentJs }: AgentPopoverProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { getProjectfromagent } = useAgentStore();

    // Auto-resize textarea
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
            textarea.style.height = newHeight + 'px';
        }
    }, []);

    useEffect(() => {
        adjustTextareaHeight();
    }, [prompt, adjustTextareaHeight]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt");
            return;
        }

        setIsGenerating(true);
        try {
            await getProjectfromagent(prompt + `"currentHTML":"${currentHtml}","currentCSS":"${currentCss}","currentJavaScript":"${currentJs}"`);

            const { Indexfile: htmlContent, Stylefile: cssContent, Scriptfile: jsContent } = useAgentStore.getState();

            if (onFilesGenerated) {
                onFilesGenerated({
                    html: htmlContent,
                    css: cssContent,
                    js: jsContent
                });
            }

            toast.success("WEB Agent generated your project successfully!", {
                duration: 3000,
                style: {
                    width: "auto",
                    minWidth: "fit-content",
                    padding: 10
                }
            });
            setIsOpen(false);
            setPrompt("");
        } catch (error) {
            toast.error("WEB Agent failed to generate project", {
                duration: 3000,
                style: {
                    width: "auto",
                    minWidth: "fit-content",
                    padding: 10
                }
            });
            console.error("Generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, getProjectfromagent, onFilesGenerated]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                return;
            } else {
                e.preventDefault();
                if (prompt.trim() && !isGenerating) {
                    handleGenerate();
                }
            }
        }
    }, [handleGenerate, prompt, isGenerating]);

    const toggleVisibility = useCallback(() => {
        setIsVisible(!isVisible);
    }, [isVisible]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <ContextMenu>
                <ContextMenuTrigger>
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                size="lg"
                                variant="default"
                                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Bot className="h-6 w-6" />
                                )}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="top"
                            className="w-96 p-4 border-2 shadow-xl"
                            align="end"
                            sideOffset={8}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-foreground">WEB Agent</h3>
                                            <p className="text-sm text-muted-foreground">AI-powered project generator</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="relative bg-muted/30 border-2 border-border rounded-xl p-2 focus-within:border-primary/50 focus-within:bg-background transition-all duration-200 hover:bg-muted/50 hover:border-primary/30">
                                            <textarea
                                                ref={textareaRef}
                                                id="prompt"
                                                value={prompt}
                                                onChange={(e) => {
                                                    setPrompt(e.target.value);
                                                    adjustTextareaHeight();
                                                }}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Describe your web project in detail..."
                                                className="w-full max-h-[200px] bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground pr-16 leading-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                                                disabled={isGenerating}
                                                rows={1}
                                                style={{
                                                    overflow: 'hidden'
                                                }}
                                            />
                                            <div className="absolute bottom-2 right-2 flex items-center gap-2">

                                                <Button
                                                    size="sm"
                                                    onClick={handleGenerate}
                                                    disabled={isGenerating || !prompt.trim()}
                                                    className="h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 shadow-md"
                                                >
                                                    {isGenerating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <ArrowRight className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span>HTML, CSS & JS will be generated</span>
                                        </div>
                                        <span className="text-[10px] opacity-70">Shift+Enter for new line</span>
                                    </div>

                                    {isGenerating && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                            <div className="relative">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                <div className="absolute inset-0 h-5 w-5 border-2 border-primary/20 rounded-full animate-pulse"></div>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-sm font-semibold text-primary block">
                                                    WEB Agent is working...
                                                </span>
                                                <span className="text-xs text-primary/70">
                                                    Generating HTML, CSS, and JavaScript files
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-48">
                    <ContextMenuItem
                        onClick={toggleVisibility}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        {isVisible ? (
                            <>
                                <EyeOff className="h-4 w-4" />
                                Hide WEB Agent
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                Show WEB Agent
                            </>
                        )}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
    );
}
