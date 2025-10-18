import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import {
    RefreshCw,
    ExternalLink,
    Eye,
    X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useEffect } from "react";

interface PreviewComponentProps {
    isOpen: boolean;
    onClose: () => void;
    previewContent: string;
    projectName?: string;
    isTransitioning: boolean;
    onRefresh: () => void;
    onOpenInNewWindow: () => void;
}

export default function PreviewComponent({
    isOpen,
    onClose,
    previewContent,
    projectName = "Project",
    isTransitioning,
    onRefresh,
    onOpenInNewWindow,
}: PreviewComponentProps) {

    // Close tooltips when cursor moves over iframe area
    useEffect(() => {
        const handleCloseTooltips = () => {
            // Force close all tooltips by dispatching an escape key event
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        };

        // Target both iframe and preview content area
        const iframes = document.querySelectorAll('iframe');
        const previewAreas = document.querySelectorAll('.preview-content-area');

        // Add listeners to iframes
        iframes.forEach(iframe => {
            iframe.addEventListener('mouseenter', handleCloseTooltips);
        });

        // Add listeners to preview content areas
        previewAreas.forEach(area => {
            area.addEventListener('mouseenter', handleCloseTooltips);
        });

        return () => {
            iframes.forEach(iframe => {
                iframe.removeEventListener('mouseenter', handleCloseTooltips);
            });
            previewAreas.forEach(area => {
                area.removeEventListener('mouseenter', handleCloseTooltips);
            });
        };
    }, [previewContent]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out"
                onClick={onClose}
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
                            <div className="border-b p-2 bg-card/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-blue-600" />
                                        <h3 className="font-semibold">Responsive Preview</h3>
                                        <Badge variant="outline" className="text-xs">
                                            Live Preview
                                        </Badge>
                                        <Badge variant={"destructive"}>
                                            for better performance, open in new window
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider delayDuration={200} skipDelayDuration={50}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={onRefresh}
                                                        className="h-8 px-2 text-xs gap-1"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" sideOffset={5}>
                                                    <p>Refresh Preview</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={onOpenInNewWindow}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs gap-1"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" sideOffset={5}>
                                                    <p>Open in New Window</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClose}
                                            className="h-8 w-8 p-0 transition-colors duration-200"
                                            disabled={isTransitioning}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300 preview-content-area">
                                <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden border transition-all duration-300">
                                    {isTransitioning ? (
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
                                            title={`${projectName} Preview`}
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
    );
}