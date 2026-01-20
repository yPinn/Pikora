'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { PageSwitcher } from '@/components/page-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getPlatformFromPath, getSidebarConfig } from '@/lib/sidebar-config';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const platform = getPlatformFromPath(pathname);

  // 如果無法識別平台，使用 facebook 作為預設值
  const data = getSidebarConfig(platform || 'facebook');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <PageSwitcher pages={data.pages} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
