"use client";

import * as React from "react";
import {
  CodeXml,
  FileCode,
  FileText,
  FolderIcon,
  Layout,
  Terminal,
  Plus,
  Search,
  FolderPlus,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { AppLogo } from "./AppLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import NavProjects from "./nav-projects";

// This is sample data.
const data = {
  roomsData: [
    {
      id: "1",
      title: "Main Room",
      icon: Terminal,
      files: [
        { id: "1", name: "chat", type: "cpp" },
        { id: "2", name: "notes", type: "java" },
        { id: "3", name: "script", type: "python" },
      ],
      isActive: true,
    },
    {
      id: "2",
      title: "Docs Room",
      icon: FileText,
      files: [
        { id: "4", name: "documentation", type: "python" },
        { id: "5", name: "api-spec", type: "javascript" },
      ],
    },
  ],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

  // Map projectsData to ensure 'type' is a valid union and icon is passed correctly
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
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          photoURL: user.photoURL ?? "",
        }
      : null;
  // console.log("AppSidebar user", mappedUser);
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
        <SidebarGroup className="flex flex-col gap-2 p-2">
          {/* New Room Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                onClick={() => {
                  /* Handle new room creation */
                  console.log("New Room Clicked");
                }}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  New Room
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="group-data-[state=expanded]:hidden"
            >
              New Room
            </TooltipContent>
          </Tooltip>

          {/* Search Rooms Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                onClick={() => {
                  /* Handle room search */
                  console.log("Search Rooms Clicked");
                }}
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Search Rooms
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="group-data-[state=expanded]:hidden"
            >
              Search Rooms
            </TooltipContent>
          </Tooltip>

          {/* New Project Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                onClick={() => {
                  /* Handle new project creation */
                  console.log("New Project Clicked");
                }}
              >
                <FolderPlus className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  New Project
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="group-data-[state=expanded]:hidden"
            >
              New Project
            </TooltipContent>
          </Tooltip>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent
        className="flex flex-col flex-grow"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="pr-2">
          <ScrollArea className="flex-1">
            <NavMain rooms={data.roomsData} />
            <NavProjects projects={projectsData} />
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
