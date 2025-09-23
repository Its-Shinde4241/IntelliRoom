import { useState } from "react";
import {
  ChevronRight,
  DoorClosedLocked,
  DoorOpen,
  FileIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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

interface Room {
  id: string;
  name: string; // Changed from 'title' to match backend
  password?: string;
  userId: string;
  files: { id: string; name: string; type: string }[];
  createdAt?: string;
  updatedAt?: string;
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
  const { roomId: activeRoomId } = useParams<{ roomId: string }>();
  const [openRooms, setOpenRooms] = useState<Set<string>>(
    new Set(activeRoomId ? [activeRoomId] : [])
  );
  // console.log("Rooms in NavMain:", rooms);
  // console.log("Active Room ID:", activeRoomId);

  const handleFileClick = (roomId: string, fileId: string) => {
    navigate(`/room/${roomId}/file/${fileId}`);
  };

  const handleRoomToggle = (roomId: string, isOpen: boolean) => {
    setOpenRooms((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(roomId);
      } else {
        newSet.delete(roomId);
      }
      return newSet;
    });
  };

  const handleRoomClick = (roomId: string) => {
    if (activeRoomId !== roomId) {
      navigate(`/room/${roomId}`);
      setOpenRooms((prev) => new Set(prev).add(roomId));
    }
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

    const newName = prompt("Enter new room name:", room.name);
    if (newName && newName !== room.name) {
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
        {rooms.map((room) => {
          const isOpen = openRooms.has(room.id);
          const isActive = activeRoomId === room.id;

          return (
            <Collapsible
              key={room.id}
              asChild
              open={isOpen}
              onOpenChange={(open) => handleRoomToggle(room.id, open)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div className="flex items-center flex-1 group/menu-button">
                      <CollapsibleTrigger asChild className="flex-1">
                        <SidebarMenuButton
                          tooltip={room.name}
                          onClick={() => handleRoomClick(room.id)}
                          isActive={isActive}
                          className="transition-all duration-300 ease-in-out"
                        >
                          {isOpen ? (
                            <DoorOpen className="h-4 w-4 transition-all duration-300 ease-in-out" />
                          ) : (
                            <DoorClosedLocked className="h-4 w-4 transition-all duration-300 ease-in-out" />
                          )}
                          <span className="transition-all duration-300 ease-in-out">
                            {room.name}
                          </span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 ease-in-out" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="">
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
                <CollapsibleContent
                  className="transition-all duration-300 ease-in-out
data-[state=open]:animate-in
data-[state=open]:slide-in-from-top-2"
                >
                  <SidebarMenuSub className="animate-in slide-in-from-top-2 duration-300 ease-in-out">
                    {room.files.map((file) => (
                      <SidebarMenuSubItem key={file.id} className="animate-in fade-in-0 slide-in-from-left-2 duration-200 ease-in-out">
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div className="flex items-center">
                              <SidebarMenuSubButton
                                onClick={() =>
                                  handleFileClick(room.id, file.id)
                                }
                                className="flex-1 cursor-pointer"
                              >
                                <FileIcon className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                                <span className="transition-opacity duration-150 ease-in-out">
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
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
