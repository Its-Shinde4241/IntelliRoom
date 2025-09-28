"use client"

import * as React from "react"
import { useEffect } from "react"
import {
  CodeXml,
} from "lucide-react"

import { NavRooms } from "@/components/nav-rooms"
import { NavUser } from "@/components/nav-user"
import NavProjects from "./nav-projects"
import NewRoomPopover from "./NewRoomPopover"
import NewProjectPopover from "./NewProjectPopover"
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
import { useProjectStore } from "@/store/projectStore"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const { getUserRooms, createRoom } = useRoomStore()
  const { createFile, activeFile, deleteFile, updateFileName } = useFileStore()
  const {
    projects,
    fetchUserProjects,
    createProject,
    updateProject,
    deleteProject,
    renameProjectFile,
    deleteProjectFile,
    runProject
  } = useProjectStore()

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
    fetchUserProjects()
  }, [user?.uid, getUserRooms, fetchUserProjects])

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
                  <span className="truncate text-xs">Code Smart</span>
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
          <SidebarMenuItem key="newProject">
            <NewProjectPopover onCreateProject={createProject} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent style={{ scrollbarWidth: "none" }}>
        <NavRooms
          // rooms={rooms}
          activeFileId={activeFile?.id as string}
          onAddFile={createFile}
          onDeleteFile={deleteFile}
          onRenameFile={updateFileName}
        />
        <NavProjects
          projects={projects}
          onRenameProject={updateProject}
          onDeleteProject={deleteProject}
          onRenameFile={(projectId, fileId, newName) => renameProjectFile(projectId, fileId, newName)}
          onDeleteFile={(projectId, fileId) => deleteProjectFile(projectId, fileId)}
          onRunProject={runProject}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={mappedUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}