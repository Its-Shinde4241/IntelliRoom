import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppLogo({
  name,
  logo: Logo,
  tagline,
  classname,
}: {
  name: string;
  logo: React.ElementType;
  tagline?: string;
  classname?: string;
}) {
  return (
    <SidebarMenu className={`${classname}`}>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{name}</span>
            {tagline && (
              <span className="truncate text-xs text-sidebar-foreground/60">
                {tagline}
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
