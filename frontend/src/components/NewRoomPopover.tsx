import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SidebarMenuButton } from "./ui/sidebar";

interface NewRoomPopoverProps {
  onCreateRoom: (roomName: string, password: string) => void;
}

export default function NewRoomPopover({ onCreateRoom }: NewRoomPopoverProps) {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    // Only letters, numbers, spaces, hyphens and underscores allowed
    if (!/^[a-zA-Z0-9\s_-]+$/.test(roomName)) {
      toast.error(
        "Room name can only contain letters, numbers, spaces, hyphens and underscores",
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

    if (!password.trim()) {
      toast.error("Please enter a password", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long", {
        duration: 2000,
        style: { width: "auto", minWidth: "fit-content", padding: 6 },
      });
      return;
    }

    const cleanRoomName = roomName.trim();
    const roomPassword = password.trim();

    onCreateRoom(cleanRoomName, roomPassword);

    // Reset form and close popover
    setRoomName("");
    setPassword("");
    setOpen(false);
  };

  const handleCancel = () => {
    setRoomName("");
    setPassword("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          variant={"outline"}
          className="w-full justify-start py-4 bg-sidebar"
          tooltip="Search Rooms"
        >
          <Plus className="h-4 w-4" />
          <span>
            <b>New Room</b>
          </span>
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        side="right"
        sideOffset={4}
        onInteractOutside={(e) => {
          // Don't close when clicking on inputs or buttons inside
          if (
            e.target instanceof Element &&
            e.target.closest("[data-radix-popover-content]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="grid gap-4"
        >
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Create New Room</h4>
            <p className="text-sm text-muted-foreground">
              Enter room details below
            </p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="roomName" className="text-sm">
                Room Name
              </Label>
              <Input
                id="roomName"
                placeholder="Enter room name"
                autoComplete="off"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomName.trim() && password.trim()) {
                    handleCreate();
                  }
                }}
                className={`text-sm ${roomName && !/^[a-zA-Z0-9\s_-]+$/.test(roomName)
                  ? "border-red-500 focus:border-red-500"
                  : ""
                  }`}
                autoFocus
              />
              {roomName && !/^[a-zA-Z0-9\s_-]+$/.test(roomName) && (
                <p className="text-xs text-red-500 mt-1">
                  Only letters, numbers, spaces, hyphens and underscores allowed
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm">
                Password (Required)
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter room password (min 4 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomName.trim() && password.trim()) {
                    handleCreate();
                  }
                }}
                className="text-sm"
                required
              />
            </div>

            {roomName && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Preview:{" "}
                <code className="font-mono">
                  {roomName} (Password Protected)
                </code>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={!roomName.trim() || !password.trim()}
              size="sm"
              className="flex-1"
            >
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
