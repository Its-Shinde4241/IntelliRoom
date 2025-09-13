import {
  File as FileIconLucide,
  FileCode,
  FileText,
  Edit,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type File } from "@/store/fileStore";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface FileListProps {
  files: File[];
  parentId: string; // roomId or projectId
  parentType: "room" | "project";
  isCollapsed?: boolean;
  activeFileId?: string;
  onRename?: (file: File) => void;
  onDelete?: (file: File) => void;
}

export function FileList({
  files,
  parentId,
  parentType,
  isCollapsed = false,
  activeFileId,
  onRename,
  onDelete,
}: FileListProps) {
  const navigate = useNavigate();

  const getFileIcon = (fileName: string): LucideIcon => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return FileCode;
      case 'html':
      case 'css':
        return FileText;
      default:
        return FileIconLucide;
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="pl-6 py-1 text-sm text-muted-foreground">
        No files
      </div>
    );
  }

  return (
    <div className="pl-6 space-y-0.5">
      {files.map((file) => {
        const FileIcon = getFileIcon(file.name);
        const isActive = file.id === activeFileId;

        const handleFileClick = () => {
          const path = parentType === "room"
            ? `/rooms/${parentId}/files/${file.id}`
            : `/projects/${parentId}/files/${file.id}`;
          navigate(path);
        };

        return (
          <DropdownMenu key={file.id}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuItem className="group/file">
                <SidebarMenuButton
                  tooltip={isCollapsed ? file.name : undefined}
                  onClick={handleFileClick}
                  className={cn(
                    "flex-1 cursor-pointer rounded px-2 py-1.5 text-sm font-medium",
                    "transition-colors duration-150 ease-in-out",
                    "hover:bg-sidebar-accent/70",
                    isActive && "bg-muted text-foreground"
                  )}
                >
                  <FileIcon className={cn("h-4 w-4", isActive && "text-primary")} />
                  {!isCollapsed && (
                    <span className="ml-2 flex-1 truncate text-[13px]">
                      {file.name}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-48" side="right">
              <div className="px-2 py-1.5 text-sm font-medium">
                {file.name}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onRename?.(file)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(file)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
