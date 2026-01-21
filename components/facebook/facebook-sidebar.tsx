'use client';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import type { FacebookPage } from '@/lib/services/facebook';
import { facebookNavConfig } from '@/lib/sidebar-config/facebook';

import { FacebookPageSwitcher } from './facebook-page-switcher';

import type { Session } from 'next-auth';

interface FacebookSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session;
  pages: FacebookPage[];
}

export function FacebookSidebar({ session, pages, ...props }: FacebookSidebarProps) {
  // 從 session 取得用戶資料（Server 已驗證，直接使用）
  const user = {
    name: session.user?.name || '用戶',
    email: session.user?.email || '',
    avatar: session.user?.image || '',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <FacebookPageSwitcher pages={pages} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={facebookNavConfig.navMain} />
        <NavProjects projects={facebookNavConfig.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
