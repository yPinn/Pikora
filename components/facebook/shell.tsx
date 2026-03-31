'use client';

import { PageTransition } from '@/components/layout/page-transition';
import { SidebarInset } from '@/components/ui/sidebar';
import { FacebookPageStore } from '@/contexts/facebook-page-store';
import type { FacebookPage } from '@/lib/services/facebook';

import { FacebookSidebar } from './sidebar';

interface ShellUser {
  name: string;
  email: string;
  avatarUrl: string;
}

interface ShellProps {
  children: React.ReactNode;
  user: ShellUser;
  pages: FacebookPage[];
}

export function Shell({ children, user, pages }: ShellProps) {
  return (
    <FacebookPageStore pages={pages}>
      <FacebookSidebar user={user} />
      <SidebarInset className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PageTransition>{children}</PageTransition>
      </SidebarInset>
    </FacebookPageStore>
  );
}
