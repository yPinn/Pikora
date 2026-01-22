'use client';

import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import { facebookNavConfig } from '@/lib/sidebar-config/facebook';

import { PageSwitcher } from './page-switcher';

import type { Session } from 'next-auth';

export function FacebookSidebar({
  session,
  ...props
}: { session: Session } & React.ComponentProps<typeof Sidebar>) {
  const { isReady } = useFacebookPage();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 w-full items-center px-2">
          {isReady ? (
            <PageSwitcher />
          ) : (
            <div className="flex w-full items-center gap-2 px-1">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={facebookNavConfig.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session.user?.name || 'User',
            email: session.user?.email || '',
            avatar: session.user?.image || '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
