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
import { toast } from "sonner";
import NewFilePopover from "./NewFilePopover";
import UpdateRoomPopover from "./UpdateRoomPopover";
import RenameFilePopover from "./RenameFilePopover";
import type { CreateFileData } from "@/store/fileStore";

interface Room {
  id: string;
  name: string;
  password?: string;
  userId: string;
  files: { id: string; name: string; type: string }[];
  createdAt?: string;
  updatedAt?: string;
}

interface NavRoomsProps {
  rooms: Room[];
  activeFileId: string;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameRoom: (
    roomId: string,
    updates: { name?: string | undefined; password?: string | undefined }
  ) => Promise<void>;
  onDeleteRoom: (roomId: string) => void;
  onAddFile: (fileData: CreateFileData) => Promise<string>;
}

export function NavRooms({
  rooms,
  activeFileId,
  onRenameFile,
  onDeleteFile,
  onRenameRoom,
  onDeleteRoom,
  onAddFile,
}: NavRoomsProps) {
  const navigate = useNavigate();
  const { roomId: activeRoomId } = useParams<{ roomId: string }>();
  const [openRooms, setOpenRooms] = useState<Set<string>>(
    new Set(activeRoomId ? [activeRoomId] : [])
  );
  const [activeRoomForNewFile, setActiveRoomForNewFile] = useState<string>("");

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

  const handleRenameFile = async (
    roomId: string,
    fileId: string,
    newName: string
  ) => {
    try {
      onRenameFile(fileId, newName);
      // Update local state
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        const fileIndex = room.files.findIndex((f) => f.id === fileId);
        if (fileIndex !== -1) {
          room.files[fileIndex].name = newName;
        }
      }
    } catch (error) {
      throw error; // Let the popover handle the error
    }
  };

  const handleDeleteFile = (fileId: string) => {
    try {
      onDeleteFile?.(fileId);
      rooms
        .find((r) => r.id === activeRoomId)
        ?.files.splice(
          rooms
            .find((r) => r.id === activeRoomId)
            ?.files.findIndex((f) => f.id === fileId) as number,
          1
        );
      toast.success("File deleted successfully", {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch {
      toast.error("Failed to delete file", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    }
  };

  const handleUpdateRoom = async (roomId: string, newName: string) => {
    try {
      await onRenameRoom(roomId, { name: newName });
      toast.success(`Room renamed to "${newName}"`, {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch (error) {
      toast.error("Failed to rename room", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      console.error("Error renaming room:", error);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    try {
      onDeleteRoom(roomId);
      toast.success("Room deleted successfully", {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch (error) {
      toast.error("Failed to delete room", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      console.error("Error deleting room:", error);
    }
  };

  const handleCreateFile = async (fileName: string, fileType: string) => {
    try {
      const newFileId = await onAddFile({
        name: fileName,
        type: fileType,
        roomId: activeRoomForNewFile,
      });
      handleFileClick(activeRoomForNewFile, newFileId);
      rooms
        .find((r) => r.id === activeRoomForNewFile)
        ?.files.push({
          id: newFileId,
          name: fileName,
          type: fileType,
        });
      toast.success(`File "${fileName}" created successfully`, {
        duration: 1000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
    } catch (error) {
      toast.error("Failed to create file", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      console.error("Error creating file:", error);
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
                    <div onClick={() => setActiveRoomForNewFile(room.id)}>
                      <NewFilePopover onCreateFile={handleCreateFile} />
                    </div>
                    <UpdateRoomPopover
                      currentRoomName={room.name}
                      onUpdateRoom={(newName: string) =>
                        handleUpdateRoom(room.id, newName)
                      }
                    />
                    <ContextMenuItem
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Room
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2">
                  <SidebarMenuSub className="animate-in slide-in-from-top-2 duration-300 ease-in-out">
                    {room.files.map((file) => (
                      <SidebarMenuSubItem
                        key={file.id}
                        className="animate-in fade-in-0 slide-in-from-left-2 duration-200 ease-in-out"
                      >
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div
                              className={`flex items-center ${
                                activeFileId === file.id
                                  ? "bg-accent text-accent-foreground font-medium"
                                  : "font-normal"
                              } group/menu-button`}
                            >
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
                            <RenameFilePopover
                              fileName={file.name}
                              onRename={(newName) =>
                                handleRenameFile(room.id, file.id, newName)
                              }
                              trigger={
                                <ContextMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  Rename File
                                </ContextMenuItem>
                              }
                            />
                            <ContextMenuItem
                              onClick={() => handleDeleteFile(file.id)}
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
