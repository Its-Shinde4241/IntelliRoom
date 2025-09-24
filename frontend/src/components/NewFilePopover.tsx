import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface NewFilePopoverProps {
  onCreateFile: (fileName: string, fileType: string) => void;
}

const FILE_TYPES = {
  js: "JavaScript",
  ts: "TypeScript",
  py: "Python",
  html: "HTML",
  css: "CSS",
  java: "Java",
  cpp: "C++",
  c: "C",
} as const;

export default function NewFilePopover({ onCreateFile }: NewFilePopoverProps) {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (!fileName.trim()) {
      toast.error("Please enter a file name", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    if (!fileType) {
      toast.error("Please select a file type", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    // Only letters and underscores allowed
    if (!/^[a-zA-Z_]+$/.test(fileName)) {
      toast.error("File name can only contain letters and underscores", {
        duration: 3000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    if (fileName.length > 50) {
      toast.error("File name must be 50 characters or less", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    const cleanFileName = fileName.trim();
    onCreateFile(cleanFileName, fileType);

    // Reset form and close popover
    setFileName("");
    setFileType("");
    setOpen(false);
  };

  const handleCancel = () => {
    setFileName("");
    setFileType("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Plus className="h-4 w-4 mr-2" />
          New file
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        side="right"
        sideOffset={4}
        onInteractOutside={(e) => {
          // Don't close when clicking on select dropdown
          if (
            e.target instanceof Element &&
            e.target.closest("[data-radix-select-content]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Create New File</h4>
            <p className="text-sm text-muted-foreground">
              Enter file details below
            </p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="fileName" className="text-sm">
                File Name
              </Label>
              <Input
                id="fileName"
                placeholder="Enter file name (letters and underscores only)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && fileName.trim() && fileType) {
                    handleCreate();
                  }
                }}
                className={`text-sm ${
                  fileName && !/^[a-zA-Z_]+$/.test(fileName)
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                autoFocus
              />
              {fileName && !/^[a-zA-Z_]+$/.test(fileName) && (
                <p className="text-xs text-red-500 mt-1">
                  Only letters and underscores allowed
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fileType" className="text-sm">
                File Type
              </Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start">
                  {Object.entries(FILE_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          .{key}
                        </span>
                        <span className="text-sm">{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {fileName && fileType && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Preview:{" "}
                <code className="font-mono">
                  {fileName}.{fileType}
                </code>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCreate}
              disabled={!fileName.trim() || !fileType}
              size="sm"
              className="flex-1"
            >
              Create
            </Button>
            <Button variant="outline" onClick={handleCancel} size="sm">
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
