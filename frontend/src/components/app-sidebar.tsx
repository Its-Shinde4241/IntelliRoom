"use client"

import * as React from "react"
import { useEffect } from "react"
import {
  CodeXml,
  FolderPlus,
  Layout,
  FolderIcon,
} from "lucide-react"

import { NavRooms } from "@/components/nav-rooms"
import { NavUser } from "@/components/nav-user"
import NavProjects from "./nav-projects"
import NewRoomPopover from "./NewRoomPopover"
import SearchRoomDialog from "./SearchRoomDialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/authStore"
import useRoomStore from "@/store/roomStore"
import useFileStore from "@/store/fileStore"

// Sample projects data - Fixed icon types
const projectsData = [
  {
    id: "project1",
    name: "Landing Page",
    icon: Layout, // Changed from string to LucideIcon
    files: [
      { type: "html" as const, id: "html1", name: "index.html" },
      { type: "css" as const, id: "css1", name: "styles.css" },
      { type: "js" as const, id: "js1", name: "main.js" },
    ],
  },
  {
    id: "project2",
    name: "Portfolio",
    icon: FolderIcon, // Changed from string to LucideIcon
    files: [
      { type: "html" as const, id: "html2", name: "portfolio.html" },
      { type: "css" as const, id: "css2", name: "portfolio.css" },
      { type: "js" as const, id: "js2", name: "portfolio.js" },
    ],
  },
]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const { rooms, getUserRooms, deleteRoom, updateRoom, createRoom } = useRoomStore()
  const { createFile, activeFile, deleteFile, updateFileName } = useFileStore()

  // Map user to expected shape for NavUser
  const mappedUser = (user && (user?.displayName || user?.email || user?.photoURL))
    ? {
      displayName: user.displayName || "User",
      email: user.email || "",
      photoURL: user.photoURL || "",
    }
    : null

  useEffect(() => {
    getUserRooms(user?.uid as string)
  }, [user?.uid, getUserRooms])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <CodeXml className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">INTELLIROOM</span>
                  <span className="truncate text-xs">Code Together</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Action buttons */}
        <SidebarMenu>
          <SidebarMenuItem>
            <NewRoomPopover
              onCreateRoom={(roomName, password) => {
                createRoom(roomName, password, user?.uid)
              }}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SearchRoomDialog />
          </SidebarMenuItem>
          <SidebarMenuItem key={"refresh"}>
            <SidebarMenuButton
              variant={"outline"}
              onClick={() => window.location.reload()} tooltip="Refresh">
              <FolderPlus className="size-4" />
              <span><b>New Project</b></span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent style={{ scrollbarWidth: "none" }}>
        <NavRooms
          rooms={rooms}
          activeFileId={activeFile?.id as string}
          onAddFile={createFile}
          onRenameRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          onDeleteFile={deleteFile}
          onRenameFile={updateFileName}
        />
        <NavProjects projects={projectsData} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={mappedUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}