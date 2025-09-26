import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

interface RenameFilePopoverProps {
  fileName: string;
  onRename: (newName: string) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export default function RenameFilePopover({
  fileName,
  onRename,
  trigger,
  disabled = false,
}: RenameFilePopoverProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(fileName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setNewName(fileName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error("File name cannot be empty");
      return;
    }

    if (newName.trim() === fileName) {
      setOpen(false);
      return;
    }

    // Basic file name validation
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName)) {
      toast.error("File name contains invalid characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await onRename(newName.trim());
      setOpen(false);
      toast.success("File renamed successfully", {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch (error) {
      toast.error("Failed to rename file", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      console.error("Error renaming file:", error);
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
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="h-8 w-8 p-0 hover:bg-muted"
    >
      <Edit className="h-4 w-4" />
    </Button>
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
          // Prevent auto focus to avoid any focus-related closing
          e.preventDefault();
          // Manually focus the input after a small delay
          setTimeout(() => {
            const input = document.getElementById("fileName");
            if (input) input.focus();
          }, 100);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName" className="text-sm font-medium">
              Rename File
            </Label>
            <Input
              id="fileName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new file name"
              className="w-full"
              autoFocus
              disabled={isSubmitting}
            />
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
                isSubmitting || !newName.trim() || newName.trim() === fileName
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
