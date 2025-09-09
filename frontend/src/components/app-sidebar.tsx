"use client";

import * as React from "react";
import { BookOpen, Bot, CodeXml, Settings2 } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { AppLogo } from "./AppLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";

// This is sample data.
const data = {
  rooms: [
    {
      title: "room1",
      id: "1",
      // icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "room2",
      id: "2",
      icon: Bot,
    },
    {
      title: "Room3",
      id: "3",
      icon: BookOpen,
    },
    {
      title: "Room4",
      id: "1",
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      id: "2",
      isActive: false,
    },
    {
      name: "Sales & Marketing",
      id: "3",
      isActive: true,
    },
    {
      name: "Travel",
      id: "4",
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  return (
    <Sidebar collapsible="icon" {...props} className="group relative">
      <SidebarHeader>
        <AppLogo name="INTELLIROOM" logo={CodeXml} />
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent>
        <NavMain rooms={data.rooms} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="pb-3">
        <SidebarSeparator />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
