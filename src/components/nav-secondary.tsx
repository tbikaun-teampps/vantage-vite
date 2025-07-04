// components/nav-secondary.tsx
import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavSecondaryItem } from "@/types/sidebar";
import showDisabledToast from "./disabled-toast";
import { type NavSecondaryProps } from "@/types/sidebar";

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const handleItemClick = (item: NavSecondaryItem) => (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      showDisabledToast(item.title, "page");
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url} onClick={handleItemClick(item)}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
