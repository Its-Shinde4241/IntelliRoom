import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import {
    User,
    Mail,
    Lock,
    Calendar,
    Shield,
    Loader2,
    CheckCircle,
    AlertCircle,
    Camera
} from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
    const { user, updateProfile, isupating } = useAuthStore();
    // const { open } = useSidebar();

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user?.displayName || "",
        email: user?.email || "",
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Get user initials for avatar fallback
    const getUserInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (timestamp: string | null) => {
        if (!timestamp) return "Unknown";
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Handle profile update
    const handleProfileUpdate = async () => {
        try {
            await updateProfile(formData.displayName, formData.email);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
            console.error("Profile update error:", error);
        }
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match!");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }

        try {
            await updateProfile(
                formData.displayName,
                formData.email,
                passwordData.newPassword,
                passwordData.currentPassword
            );
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setIsChangingPassword(false);
            toast.success("Password updated successfully!");
        } catch (error: any) {
            if (error.code === 'auth/wrong-password') {
                toast.error("Current password is incorrect!");
            } else {
                toast.error("Failed to update password. Please try again.");
            }
            console.error("Password update error:", error);
        }
    };

    // Get provider info
    const getAuthProvider = () => {
        if (!user?.providerData) return "Email";
        const provider = user.providerData[0]?.providerId;
        switch (provider) {
            case "google.com":
                return "Google";
            case "password":
                return "Email";
            default:
                return "Email";
        }
    };

    const isGoogleUser = getAuthProvider() === "Google";

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 pl-1 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {(
                    <SidebarTrigger className="pl-0" />
                )}
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">Account Settings</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto p-6 space-y-6">

                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your account details and preferences
                                    </CardDescription>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                        disabled={isGoogleUser}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Avatar Section */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user?.photoURL || ""} alt="Profile" />
                                        <AvatarFallback className="text-lg font-medium">
                                            {getUserInitials(user?.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!isGoogleUser && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                            disabled
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">{user?.displayName || "User"}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={user?.emailVerified ? "default" : "secondary"} className="text-xs">
                                            {user?.emailVerified ? (
                                                <>
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Unverified
                                                </>
                                            )}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {getAuthProvider()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Edit Form */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Display Name</Label>
                                            <Input
                                                id="displayName"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    displayName: e.target.value
                                                }))}
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    email: e.target.value
                                                }))}
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleProfileUpdate}
                                            disabled={isupating}
                                        >
                                            {isupating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    displayName: user?.displayName || "",
                                                    email: user?.email || "",
                                                });
                                            }}
                                            disabled={isupating}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Display Mode */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            Display Name
                                        </Label>
                                        <p className="text-sm font-medium">{user?.displayName || "Not set"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            Email Address
                                        </Label>
                                        <p className="text-sm font-medium">{user?.email}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            Member Since
                                        </Label>
                                        <p className="text-sm font-medium">{formatDate(user?.metadata?.creationTime || null)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Shield className="h-4 w-4" />
                                            Last Sign In
                                        </Label>
                                        <p className="text-sm font-medium">{formatDate(user?.metadata?.lastSignInTime || null)}</p>
                                    </div>
                                </div>
                            )}

                            {isGoogleUser && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        You're signed in with Google. Some profile information is managed by your Google account.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    {!isGoogleUser && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Security
                                </CardTitle>
                                <CardDescription>
                                    Manage your password and security settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!isChangingPassword ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Password</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Last updated: {formatDate(user?.metadata?.lastSignInTime || null)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsChangingPassword(true)}
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    currentPassword: e.target.value
                                                }))}
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    newPassword: e.target.value
                                                }))}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    confirmPassword: e.target.value
                                                }))}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handlePasswordChange}
                                                disabled={isupating}
                                            >
                                                {isupating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Update Password
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsChangingPassword(false);
                                                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                                }}
                                                disabled={isupating}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Account Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>
                                Technical information about your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">User ID</span>
                                    <p className="font-mono text-xs bg-muted p-2 rounded">{user?.uid}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">Authentication Provider</span>
                                    <p>{getAuthProvider()}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">Email Verification</span>
                                    <p>{user?.emailVerified ? "Verified" : "Pending verification"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">Account Type</span>
                                    <p>Standard User</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}