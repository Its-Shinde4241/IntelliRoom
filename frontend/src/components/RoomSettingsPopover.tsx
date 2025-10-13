import { useState, useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface RoomSettingsPopoverProps {
    currentRoomName: string;
    currentPassword?: string;
    onUpdateRoom: (name: string) => Promise<void>;
    onUpdateRoomWithPassword: (name: string, password: string) => Promise<void>;
    trigger?: React.ReactNode;
}

export default function RoomSettingsPopover({
    currentRoomName,
    currentPassword,
    onUpdateRoom,
    onUpdateRoomWithPassword,
    trigger
}: RoomSettingsPopoverProps) {
    const [roomName, setRoomName] = useState("");
    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set current room name when popover opens
    useEffect(() => {
        if (open) {
            setRoomName(currentRoomName);
            setCurrentPasswordInput("");
            setNewPassword("");
            setConfirmPassword("");
            setIsChangingPassword(false);
        }
    }, [open, currentRoomName]);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomName.trim()) {
            toast.error("Please enter a room name", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        if (roomName.trim() === currentRoomName) {
            toast.error("Room name is the same as current", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        if (roomName.length > 50) {
            toast.error("Room name must be 50 characters or less", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        try {
            setIsSubmitting(true);
            await onUpdateRoom(roomName.trim());
            toast.success("Room name updated successfully!");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update room name");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate current password if room has password
        if (currentPassword && currentPasswordInput !== currentPassword) {
            toast.error("Current password is incorrect", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        if (!newPassword) {
            toast.error("Please enter a new password", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match", {
                duration: 2000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });
            return;
        }

        try {
            setIsSubmitting(true);
            await onUpdateRoomWithPassword(roomName.trim() || currentRoomName, newPassword);
            toast.success("Room password updated successfully!");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update room password");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setRoomName(currentRoomName);
        setCurrentPasswordInput("");
        setNewPassword("");
        setConfirmPassword("");
        setIsChangingPassword(false);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                className="w-96"
                align="end"
                side="bottom"
                sideOffset={4}
            >
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Room Settings</h4>
                        <p className="text-sm text-muted-foreground">
                            Update room name and password
                        </p>
                    </div>

                    <Separator />

                    {/* Room Name Section */}
                    <div className="grid gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="roomName" className="text-sm font-medium">
                                Room Name
                            </Label>
                            <Input
                                id="roomName"
                                placeholder="Enter room name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="text-sm"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleUpdateName}
                                disabled={!roomName.trim() || roomName.trim() === currentRoomName || isSubmitting}
                                size="sm"
                                className="flex-1"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Update Name
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Password Section */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Room Password</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                className="text-xs h-6 px-2"
                            >
                                {isChangingPassword ? "Cancel" : "Change Password"}
                            </Button>
                        </div>

                        {isChangingPassword && (
                            <div className="grid gap-3">
                                {/* Current Password - only show if room has password */}
                                {currentPassword && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="currentPassword" className="text-sm">
                                            Current Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Enter current password"
                                                value={currentPasswordInput}
                                                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                                                className="text-sm pr-10"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* New Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="newPassword" className="text-sm">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password (min 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="text-sm pr-10"
                                            disabled={isSubmitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword" className="text-sm">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="text-sm pr-10"
                                            disabled={isSubmitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Password validation feedback */}
                                {newPassword && newPassword.length < 6 && (
                                    <p className="text-xs text-red-500">
                                        Password must be at least 6 characters
                                    </p>
                                )}
                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500">
                                        Passwords don't match
                                    </p>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={
                                            !newPassword ||
                                            newPassword.length < 6 ||
                                            newPassword !== confirmPassword ||
                                            (currentPassword && currentPasswordInput !== currentPassword) ||
                                            isSubmitting
                                        }
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Update Password
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsChangingPassword(false)}
                                        size="sm"
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} size="sm" className="flex-1">
                            Close
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}