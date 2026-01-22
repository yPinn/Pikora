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
        {isReady ? (
          <PageSwitcher />
        ) : (
          <div className="flex h-12 w-full items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        )}
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
