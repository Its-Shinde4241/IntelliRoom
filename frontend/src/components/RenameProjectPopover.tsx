import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ContextMenuItem } from "@/components/ui/context-menu";

interface RenameProjectPopoverProps {
    projectName: string;
    onRename: (newName: string) => Promise<void>;
    trigger?: React.ReactNode;
    disabled?: boolean;
}

export default function RenameProjectPopover({
    projectName,
    onRename,
    trigger,
    disabled = false,
}: RenameProjectPopoverProps) {
    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState(projectName);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setNewName(projectName);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName.trim()) {
            toast.error("Project name cannot be empty");
            return;
        }

        if (newName.trim() === projectName) {
            setOpen(false);
            return;
        }

        // Only letters, numbers, spaces, hyphens and underscores allowed
        if (!/^[a-zA-Z0-9\s_-]+$/.test(newName)) {
            toast.error(
                "Project name can only contain letters, numbers, spaces, hyphens and underscores",
                {
                    duration: 3000,
                    style: { width: "auto", minWidth: "fit-content", padding: 6 },
                }
            );
            return;
        }

        if (newName.length > 50) {
            toast.error("Project name must be 50 characters or less", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onRename(newName.trim());
            setOpen(false);
            toast.success("Project renamed successfully", {
                duration: 1000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
        } catch (error) {
            toast.error("Failed to rename project", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            console.error("Error renaming project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const defaultTrigger = (
        <ContextMenuItem
            onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            disabled={disabled}
        >
            <Pencil className="h-4 w-4 mr-2" />
            Rename Project
        </ContextMenuItem>
    );

    return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
            <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm font-medium">
                            Rename Project
                        </Label>
                        <Input
                            id="projectName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter new project name"
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
                            disabled={
                                isSubmitting || !newName.trim() || newName.trim() === projectName
                            }
                        >
                            <Check className="h-4 w-4 mr-1" />
                            {isSubmitting ? "Renaming..." : "Rename"}
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}