import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface UpdateRoomPopoverProps {
  currentRoomName: string;
  onUpdateRoom: (newRoomName: string) => void;
}

export default function UpdateRoomPopover({
  currentRoomName,
  onUpdateRoom,
}: UpdateRoomPopoverProps) {
  const [roomName, setRoomName] = useState("");
  const [open, setOpen] = useState(false);

  // Set current room name when popover opens
  useEffect(() => {
    if (open) {
      setRoomName(currentRoomName);
    }
  }, [open, currentRoomName]);

  const handleUpdate = () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    // Only letters, numbers, spaces, and underscores allowed
    if (!/^[a-zA-Z0-9\s_]+$/.test(roomName)) {
      toast.error(
        "Room name can only contain letters, numbers, spaces, and underscores",
        {
          duration: 3000,
          style: { width: "auto", minWidth: "fit-content", padding: 6 },
        }
      );
      return;
    }

    if (roomName.length > 50) {
      toast.error("Room name must be 50 characters or less", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    if (roomName.trim() === currentRoomName) {
      toast.error("Please enter a different room name", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    const cleanRoomName = roomName.trim();
    onUpdateRoom(cleanRoomName);

    // Close popover
    setOpen(false);
  };

  const handleCancel = () => {
    setRoomName(currentRoomName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Pencil className="h-4 w-4 mr-2" />
          Rename Room
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        side="right"
        sideOffset={4}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Rename Room</h4>
            <p className="text-sm text-muted-foreground">Enter new room name</p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="roomName" className="text-sm">
                Room Name
              </Label>
              <Input
                id="roomName"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomName.trim()) {
                    handleUpdate();
                  }
                }}
                className={`text-sm ${
                  roomName && !/^[a-zA-Z0-9\s_]+$/.test(roomName)
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                autoFocus
              />
              {roomName && !/^[a-zA-Z0-9\s_]+$/.test(roomName) && (
                <p className="text-xs text-red-500 mt-1">
                  Only letters, numbers, spaces, and underscores allowed
                </p>
              )}
            </div>

            {roomName.trim() && roomName.trim() !== currentRoomName && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                New name: <code className="font-mono">{roomName.trim()}</code>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpdate}
              disabled={!roomName.trim() || roomName.trim() === currentRoomName}
              size="sm"
              className="flex-1"
            >
              Rename
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
