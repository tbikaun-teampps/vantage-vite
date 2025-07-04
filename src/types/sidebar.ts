// types/sidebar.ts
import { SidebarGroup } from "@/components/ui/sidebar";
import  { type Icon } from "@tabler/icons-react";

// Base interface for navigation items
export interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  disabled?: boolean;
}

// Sub-sub navigation item (third level)
export interface NavSubSubItem {
  title: string;
  url: string;
  icon?: Icon;
  disabled?: boolean;
}

// Sub-navigation item that can optionally have sub-items
export interface NavSubItem {
  title: string;
  url: string;
  icon?: Icon;
  disabled?: boolean;
  items?: NavSubSubItem[]; // Add support for third level
}

// Navigation item that can have sub-items
export interface NavItemWithSub extends NavItem {
  items?: NavSubItem[];
}

// User interface (based on the NavUser usage)
export interface User {
  name: string;
  email: string;
  avatar: string;
}

// Secondary navigation item (has required icon)
export interface NavSecondaryItem {
  title: string;
  url: string;
  icon?: Icon;
  disabled?: boolean;
}

// Complete sidebar data structure
export interface SidebarData {
  navMain: NavItemWithSub[];
  navAnalytics: NavItemWithSub[];
  navSettings: NavItemWithSub[];
  navSecondary: NavSecondaryItem[];
  user: User;
}

// Updated component prop interfaces
export interface NavSectionProps {
  title: string;
  items: NavItemWithSub[];
  className?: string;
  disabled?: boolean;
}

export interface NavMainWithActiveProps {
  items: NavItemWithSub[];
}

// Props for individual navigation components
export interface NavUserProps {
  user: User;
}

export interface NavMainProps {
  items: NavItem[];
  disabled?: boolean;
}

export interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavSecondaryItem[];
}