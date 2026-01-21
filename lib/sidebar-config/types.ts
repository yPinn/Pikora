import type { LucideIcon } from 'lucide-react';

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavProject {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface Page {
  name: string;
  logo: LucideIcon;
  role: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarConfig {
  user: User;
  pages: Page[];
  navMain: NavMainItem[];
  projects: NavProject[];
}

export type Platform = 'facebook' | 'instagram' | 'threads';
