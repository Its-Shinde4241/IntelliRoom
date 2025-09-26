import * as React from "react";
import { useEffect } from "react";
import {
  CodeXml,
  FileCode,
  FolderIcon,
  Layout,
  Plus,
  Search,
  FolderPlus,
} from "lucide-react";

import { NavRooms } from "@/components/nav-rooms";
import { NavUser } from "@/components/nav-user";
import { AppLogo } from "./AppLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import NavProjects from "./nav-projects";

// This is sample data.
const data = {
  projectsData: [
    {
      id: "project1",
      name: "Landing Page",
      icon: Layout,
      files: [
        { type: "html", id: "html1", name: "index.html" },
        { type: "css", id: "css1", name: "styles.css" },
        { type: "js", id: "js1", name: "main.js" },
      ],
    },
    {
      id: "project2",
      name: "Portfolio",
      icon: FolderIcon,
      files: [
        { type: "html", id: "html2", name: "portfolio.html" },
        { type: "css", id: "css2", name: "portfolio.css" },
        { type: "js", id: "js2", name: "portfolio.js" },
      ],
    },
    {
      id: "project3",
      name: "Blog",
      icon: FileCode,
      files: [
        { type: "html", id: "html3", name: "blog.html" },
        { type: "css", id: "css3", name: "blog.css" },
        { type: "js", id: "js3", name: "blog.js" },
      ],
    },
  ],
};

import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import useRoomStore from "@/store/roomStore";
import useFileStore from "@/store/fileStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const { rooms, getUserRooms, deleteRoom, updateRoom } = useRoomStore();
  const { createFile, activeFile, deleteFile, updateFileName } = useFileStore();

  const projectsData = data.projectsData.map((project) => ({
    ...project,
    files: project.files.map((file) => ({
      ...file,
      type: file.type as "html" | "css" | "js",
    })),
  }));

  // Map user to expected shape for NavUser
  const mappedUser =
    (user && user?.displayName) || user?.email || user?.photoURL
      ? {
          displayName: user.displayName || "User",
          email: user.email || "",
          photoURL: user.photoURL || "",
        }
      : null;

  useEffect(() => {
    // console.log("Fetching rooms for user:", user?.uid);
    getUserRooms(user?.uid as string);
  }, [user?.uid, getUserRooms]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="group relative h-screen flex flex-col"
    >
      <SidebarHeader>
        <AppLogo name="INTELLIROOM" logo={CodeXml} />
        <SidebarSeparator />
        {/* Top Actions */}
        {/* Top Actions */}
        <SidebarGroup className="p-2 group-data-[collapsible=icon]:p-1">
          <SidebarMenu>
            {/* New Room Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  /* Handle new room creation */
                  console.log("New Room Clicked");
                }}
                tooltip="New Room"
              >
                <Plus className="h-4 w-4" />
                <span>New Room</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Search Rooms Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  /* Handle room search */
                  console.log("Search Rooms Clicked");
                }}
                tooltip="Search Rooms"
              >
                <Search className="h-4 w-4" />
                <span>Search Rooms</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* New Project Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  /* Handle new project creation */
                  console.log("New Project Clicked");
                }}
                tooltip="New Project"
              >
                <FolderPlus className="h-4 w-4" />
                <span>New Project</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent
        className="flex flex-col flex-grow"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="pr-2 group-data-[collapsible=icon]:pr-1">
          <ScrollArea className="flex-1">
            <div className="p-2 group-data-[collapsible=icon]:p-1">
              <NavRooms
                rooms={rooms}
                activeFileId={activeFile?.id as string}
                onAddFile={createFile}
                onRenameRoom={updateRoom}
                onDeleteRoom={deleteRoom}
                onDeleteFile={deleteFile}
                onRenameFile={updateFileName}
              />
            </div>
            <div className="p-2 group-data-[collapsible=icon]:p-1">
              <NavProjects projects={projectsData} />
            </div>
          </ScrollArea>
        </div>
      </SidebarContent>
      <SidebarFooter className="pb-3">
        <SidebarSeparator />
        <NavUser user={mappedUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
