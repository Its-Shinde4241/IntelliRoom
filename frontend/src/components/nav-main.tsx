import {
  ChevronRight,
  FileIcon,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getfileExtension } from "@/lib/helper";

interface File {
  id: string;
  name: string;
  type: string;
}

interface Room {
  id: string;
  title: string;
  files: File[];
  icon?: LucideIcon;
  isActive?: boolean;
}

interface NavMainProps {
  rooms: Room[];
  onRenameFile?: (roomId: string, fileId: string, newName: string) => void;
  onDeleteFile?: (roomId: string, fileId: string) => void;
  onRenameRoom?: (roomId: string, newName: string) => void;
  onDeleteRoom?: (roomId: string) => void;
}

export function NavMain({
  rooms,
  onRenameFile,
  onDeleteFile,
  onRenameRoom,
  onDeleteRoom,
}: NavMainProps) {
  const navigate = useNavigate();

  const handleFileClick = (roomId: string, fileId: string) => {
    navigate(`/room/${roomId}/file/${fileId}`);
  };

  const handleRenameFile = (roomId: string, fileId: string) => {
    const file = rooms
      .find((r) => r.id === roomId)
      ?.files.find((f) => f.id === fileId);
    if (!file) return;

    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName !== file.name) {
      onRenameFile?.(roomId, fileId, newName);
    }
  };

  const handleDeleteFile = (roomId: string, fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      onDeleteFile?.(roomId, fileId);
    }
  };

  const handleRenameRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const newName = prompt("Enter new room name:", room.title);
    if (newName && newName !== room.title) {
      onRenameRoom?.(roomId, newName);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (
      confirm("Are you sure you want to delete this room and all its files?")
    ) {
      onDeleteRoom?.(roomId);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Rooms</SidebarGroupLabel>
      <SidebarMenu>
        {rooms.map((room) => (
          <Collapsible
            key={room.id}
            asChild
            defaultOpen={room.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="flex items-center flex-1 group/menu-button">
                    <CollapsibleTrigger asChild className="flex-1">
                      <SidebarMenuButton tooltip={room.title}>
                        {room.icon && <room.icon className="h-4 w-4" />}
                        <span>{room.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleRenameRoom(room.id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename Room
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Room
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {room.files.map((file) => (
                    <SidebarMenuSubItem key={file.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div className="flex items-center">
                            <SidebarMenuSubButton
                              onClick={() => handleFileClick(room.id, file.id)}
                              className="flex-1 cursor-pointer"
                            >
                              <FileIcon className="h-4 w-4" />
                              <span>
                                {file.name}.{getfileExtension(file.type)}
                              </span>
                            </SidebarMenuSubButton>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => handleRenameFile(room.id, file.id)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Rename File
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => handleDeleteFile(room.id, file.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete File
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
