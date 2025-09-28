"use client"

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  DoorClosedLocked,
  DoorOpen,
  FileIcon,
  OctagonAlert,
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { getfileExtension } from "@/lib/helper";
import { toast } from "sonner";
import NewFilePopover from "./NewFilePopover";
import UpdateRoomPopover from "./UpdateRoomPopover";
import RenameFilePopover from "./RenameFilePopover";
import type { CreateFileData } from "@/store/fileStore";
import useFileStore from "@/store/fileStore";
import useRoomStore from "@/store/roomStore";

interface NavRoomsProps {
  // rooms: Room[];
  activeFileId: string;
  loading?: boolean;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onAddFile: (fileData: CreateFileData) => Promise<string>;
}

export function NavRooms({
  activeFileId,
  onRenameFile,
  onDeleteFile,
  onAddFile,
}: NavRoomsProps) {
  const navigate = useNavigate();
  const { roomId: activeRoomId } = useParams<{ roomId: string }>();

  const { activeFile } = useFileStore();
  const { activeRoom, rooms, updateRoom, deleteRoom, updateFileInRoom, removeFileFromRoom, addFileToRoom } = useRoomStore();

  const [openRooms, setOpenRooms] = useState<Set<string>>(new Set());
  const [activeRoomForNewFile, setActiveRoomForNewFile] = useState<string>("");
  const [roomToDelete, setRoomToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const roomToOpen = activeFile?.roomId || activeRoom?.id || activeRoomId;

    if (roomToOpen) {
      setOpenRooms(prev => {
        if (prev.has(roomToOpen)) {
          return prev;
        }
        return new Set([roomToOpen]);
      });
    }
  }, [activeFile?.roomId, activeRoom?.id, activeRoomId]);

  const handleFileClick = useCallback((roomId: string, fileId: string) => {
    navigate(`/room/${roomId}/file/${fileId}`);
  }, [navigate]);

  const handleRoomToggle = useCallback((roomId: string, isOpen: boolean) => {
    setOpenRooms((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(roomId);
      } else {
        newSet.delete(roomId);
      }
      return newSet;
    });
  }, []);

  const handleRoomClick = useCallback((roomId: string) => {
    navigate(`/room/${roomId}`);
  }, [navigate]);

  const handleRenameFile = useCallback(async (
    fileId: string,
    newName: string
  ) => {
    try {
      await onRenameFile(fileId, newName);

      // Update the file name in the room store
      updateFileInRoom(fileId, { name: newName });
    } catch (error) {
      throw error;
    }
  }, [onRenameFile, updateFileInRoom]);

  const handleDeleteFile = useCallback((fileId: string) => {
    try {
      onDeleteFile?.(fileId);

      // Remove the file from the room store
      removeFileFromRoom(fileId);

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
  }, [onDeleteFile, removeFileFromRoom]);

  const handleUpdateRoom = async (roomId: string, newName: string) => {
    try {
      await updateRoom(roomId, { name: newName });
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

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      setRoomToDelete({ id: roomId, name: rooms.find((r) => r.id === roomId)?.name || "" });
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

      // Add the new file to the room store
      addFileToRoom(activeRoomForNewFile, {
        id: newFileId,
        name: fileName,
        type: fileType
      });

      handleFileClick(activeRoomForNewFile, newFileId);

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
                    <SidebarMenuButton
                      tooltip={room.name}
                      onClick={() => handleRoomClick(room.id)}
                      isActive={isActive}
                      className="cursor-pointer"
                    >
                      {isOpen ? (
                        <DoorOpen className="h-4 w-4" />
                      ) : (
                        <DoorClosedLocked className="h-4 w-4" />
                      )}
                      <span>{room.name}</span>
                    </SidebarMenuButton>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
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
                      onClick={() =>
                        setRoomToDelete({ id: room.id, name: room.name })
                      }
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Room
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                {room.files?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {room.files?.map((file) => (
                          <SidebarMenuSubItem key={`${room.id}-${file.id}`}>
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <SidebarMenuSubButton
                                  className="cursor-pointer"
                                  onClick={() => handleFileClick(room.id, file.id)}
                                  isActive={activeFileId === file.id || activeFile?.id === file.id}
                                >
                                  <FileIcon className="h-4 w-4" />
                                  <span>
                                    {file.name}.{getfileExtension(file.type)}
                                  </span>
                                </SidebarMenuSubButton>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <RenameFilePopover
                                  fileName={file.name}
                                  onRename={(newName) => handleRenameFile(file.id, newName)}
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
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>

      <AlertDialog
        open={!!roomToDelete}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <AlertDialogTitle>
              <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <OctagonAlert className="h-7 w-7 text-destructive" />
              </div>
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-center">
              This action cannot be undone. This will permanently delete the
              room <b>{roomToDelete?.name}</b> and all its files from the
              server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 sm:justify-center">
            <AlertDialogCancel onClick={() => setRoomToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => roomToDelete && handleDeleteRoom(roomToDelete.id)}
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  );
}