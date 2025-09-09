import { Ellipsis, type LucideIcon, Edit, Trash2, Share } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import { Collapsible } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

export function NavMain({
  rooms,
  onRename,
  onDelete,
  onShare,
}: {
  rooms: {
    title: string;
    id: string;
    icon?: LucideIcon;
    isActive?: boolean;
  }[];
  onRename?: (item: any) => void;
  onDelete?: (item: any) => void;
  onShare?: (item: any) => void;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navigate = useNavigate();
  const location = useLocation();

  // Detect active room from URL
  const activeRoomId = location.pathname.startsWith("/rooms/")
    ? location.pathname.split("/rooms/")[1]
    : null;

  const handleRoomClick = (room: { id: string }) => {
    navigate(`/rooms/${room.id}`);
  };

  const handleRoomSetting = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Rooms</SidebarGroupLabel>
      <SidebarSeparator />
      <SidebarMenu>
        {rooms.map((room) => {
          const isActive = activeRoomId === room.title;

          return (
            <Collapsible
              key={room.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem className="group/room">
                {isCollapsed ? (
                  // Collapsed state
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip={room.title}
                        onClick={() => {
                          handleRoomClick(room);
                          room.isActive = true;
                        }}
                        className={
                          isActive
                            ? "bg-muted text-foreground"
                            : "hover:bg-sidebar-accent"
                        }
                      >
                        {room.icon ? (
                          <room.icon />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md text-foreground text-sm font-medium">
                            {room.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48"
                      side="right"
                    >
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {room.title}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onRename?.(room)}>
                        <Edit className="h-4 w-4" /> Rename Room
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare?.(room)}>
                        <Share className="h-4 w-4" /> Share Room
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(room)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // Expanded state
                  <div className="flex items-center w-full">
                    <SidebarMenuButton
                      tooltip={room.title}
                      className={`flex-1 cursor-pointer ${
                        isActive
                          ? "bg-muted text-foreground"
                          : "hover:bg-sidebar-accent"
                      }`}
                      onClick={() => handleRoomClick(room)}
                    >
                      {room.icon ? (
                        <room.icon />
                      ) : (
                        <div className="flex h-6 items-center justify-center rounded-md bg-background text-foreground text-sm font-medium">
                          {room.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{room.title}</span>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover/room:opacity-100 hover:bg-sidebar-accent transition-all duration-200 cursor-pointer"
                          onClick={handleRoomSetting}
                        >
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48"
                        side="right"
                      >
                        <DropdownMenuItem onClick={() => onRename?.(room)}>
                          <Edit className="h-4 w-4" /> Rename Room
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onShare?.(room)}>
                          <Share className="h-4 w-4" /> Share Room
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(room)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
