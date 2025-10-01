import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { SidebarMenuButton } from "./ui/sidebar";

interface NewProjectPopoverProps {
    onCreateProject: (projectName: string) => Promise<any>;
    trigger?: React.ReactNode;
}

export default function NewProjectPopover({
    onCreateProject,
    trigger
}: NewProjectPopoverProps) {
    const [projectName, setProjectName] = useState("");
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectName.trim()) {
            toast.error("Please enter a project name", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        // Only letters, numbers, spaces, hyphens and underscores allowed
        if (!/^[a-zA-Z0-9\s_-]+$/.test(projectName)) {
            toast.error(
                "Project name can only contain letters, numbers, spaces, hyphens and underscores",
                {
                    duration: 3000,
                    style: { width: "auto", minWidth: "fit-content", padding: 6 },
                }
            );
            return;
        }

        if (projectName.length > 50) {
            toast.error("Project name must be 50 characters or less", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateProject(projectName.trim());
            setOpen(false);
            setProjectName("");
            toast.success(`Project "${projectName}" created successfully`, {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
        } catch (error) {
            toast.error("Failed to create project", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            console.error("Error creating project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setProjectName("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const defaultTrigger = (
        <SidebarMenuButton variant="outline" tooltip="New Project" className="bg-sidebar">
            <Plus className="size-4" />
            <span><b>New Project</b></span>
        </SidebarMenuButton>
    );

    return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
            <PopoverTrigger asChild>
                {trigger || defaultTrigger}
            </PopoverTrigger>
            <PopoverContent
                className="w-80"
                align="start"
                side="right"
                alignOffset={-10}
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    setTimeout(() => {
                        const input = document.getElementById("projectName");
                        if (input) input.focus();
                    }, 100);
                }}
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm font-medium">
                            Create New Project
                        </Label>
                        <Input
                            id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter project name"
                            className="w-full"
                            autoFocus
                            disabled={isSubmitting}
                            maxLength={50}
                        />
                        <p className="text-xs text-muted-foreground">
                            Letters, numbers, spaces, hyphens and underscores only
                        </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !projectName.trim()}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}