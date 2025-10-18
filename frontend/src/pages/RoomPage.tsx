"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  FileText,
  Calendar,
  Clock,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Grid,
  List,
  Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

// Import stores (default imports based on your store structure)
import { useAuthStore } from "@/store/authStore";
import useRoomStore from "@/store/roomStore";
import useFileStore, { type File } from "@/store/fileStore";

// Import components
import NewFilePopover from "@/components/NewFilePopover";
import RoomSettingsPopover from "@/components/RoomSettingsPopover";

export default function RoomPage() {
  const params = useParams();
  const navigate = useNavigate();
  const roomId = params.roomId as string;

  // Zustand stores
  const { user } = useAuthStore();
  const {
    rooms,
    roomLoading,
    error: roomError,
    getUserRooms,
    addFileToRoom,
    updateRoom,
  } = useRoomStore();



  const {
    files,
    fileLoading,
    getFilesByRoom,
    deleteFile,
    createFile
  } = useFileStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: '', name: '' });

  // Get current room from the rooms array
  const room = rooms.find((r: any) => r.id === roomId);


  const handleUpdateRoom = async (newRoomName: string) => {
    if (roomId && user) {
      await updateRoom(roomId, { name: newRoomName });
    }
  }
  const handleUpdateRoomwithPassword = async (newRoomName: string, newPassword: string) => {
    if (roomId && user) {
      await updateRoom(roomId, { name: newRoomName, password: newPassword });
    }
  }

  // Load data on mount
  useEffect(() => {
    if (roomId && user) {
      // Only fetch user rooms if we don't have any rooms yet
      if (rooms.length === 0) {
        getUserRooms(user.uid as string);
      }
      // Always fetch files when roomId changes
      getFilesByRoom(roomId);
    }
  }, [roomId, user, rooms.length, getUserRooms, getFilesByRoom]);
  // Filter files based on room and search
  const roomFiles = files.filter((file: any) =>
    file.roomId === roomId &&
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleFileClick = (fileId: string) => {
    navigate(`/room/${roomId}/file/${fileId}`);
  };

  const openDeleteDialog = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFile(deleteDialog.id);
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setDeleteDialog({ isOpen: false, id: '', name: '' });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = () => {
    return <FileText className="h-5 w-5 text-green-600" />;
  };

  // Loading state
  if (roomLoading || fileLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading room...</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (roomError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{roomError}</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  // Room not found
  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Room not found</h2>
          <p className="text-muted-foreground">The room you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }
  const handleCreateFile = async (fileName: string, fileType: string) => {
    try {
      const newFileId = await createFile({
        name: fileName,
        type: fileType,
        roomId: roomId,
      });

      // Add the new file to the room store
      addFileToRoom(roomId, {
        id: newFileId,
        name: fileName,
        type: fileType
      });

      // handleFileClick(newFileId);

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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Room Header */}
      <div className="border-b bg-card/50 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{room.name}</h1>
              <Badge variant="secondary">Private</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {room.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(room.createdAt)}
                </span>
              )}
              {room.updatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {formatDate(room.updatedAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <RoomSettingsPopover
              currentRoomName={room.name}
              currentPassword={room.password}
              onUpdateRoom={handleUpdateRoom}
              onUpdateRoomWithPassword={handleUpdateRoomwithPassword}
            />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <NewFilePopover
              onCreateFile={handleCreateFile}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {roomFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery
                ? "No files match your search."
                : "This room is empty. Create your first file to get started."
              }
            </p>
            <div className="flex gap-2">
              <NewFilePopover
                onCreateFile={handleCreateFile}
              />
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
          }>
            {/* Files */}
            {roomFiles.map((file: File) => (
              <Card
                key={file.id}
                className={`cursor-pointer hover:shadow-md transition-all ${viewMode === "list" ? "flex items-center p-3" : ""
                  }`}
                onClick={() => handleFileClick(file.id)}
              >
                {viewMode === "grid" ? (
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon()}
                          <Badge variant="outline" className="text-xs">File</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleFileClick(file.id)}>
                              <Eye className="h-4 w-4 mr-2" />Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => openDeleteDialog(file.id, file.name, e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-base">{file.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{file.type || 'Plain Text'}</span>
                        <span>Updated {formatDate(file.updatedAt || file.createdAt || new Date().toISOString())}</span>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {getFileIcon()}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{file.name}</span>
                          <Badge variant="outline" className="text-xs">File</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{file.type || 'Plain Text'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(file.updatedAt || file.createdAt || new Date().toISOString())}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleFileClick(file.id)}>
                            <Eye className="h-4 w-4 mr-2" />Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => openDeleteDialog(file.id, file.name, e)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) =>
        setDeleteDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}