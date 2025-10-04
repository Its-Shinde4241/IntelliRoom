import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function NavUser({
  user,
}: {
  user: { displayName: string; email: string; photoURL: string } | null;
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const handleAccountClick = () => {
    navigate('/account'); // Navigate to account page
  };
  const { signOut } = useAuthStore();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth/signin'); // Redirect to sign-in page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  // console.log("NavUser render", user);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || undefined}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.email[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {
                    user?.displayName && user?.displayName != "User"
                      ? user?.displayName
                      : user?.email.split("@")[0]
                  }
                </span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.photoURL || undefined}
                    alt={user?.displayName || undefined}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.displayName
                      ? user?.displayName
                      : user?.email.split("@")[0]}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <SidebarMenuSubButton onClick={handleAccountClick} className="w-full">
                  <BadgeCheck />
                  Account
                </SidebarMenuSubButton>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SidebarMenuSubButton
                onClick={handleLogout}
                className="text-destructive cursor-pointer focus:text-destructive">
                <LogOut className="size-4 !text-destructive" />
                <span className="text-destructive">Log Out</span>
              </SidebarMenuSubButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
