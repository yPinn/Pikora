'use client';

import { SidebarInset } from '@/components/ui/sidebar';
import { FacebookPageStore } from '@/contexts/facebook-page-store';
import type { FacebookPage } from '@/lib/services/facebook';

import { FacebookSidebar } from './sidebar';

import type { Session } from 'next-auth';

interface ShellProps {
  children: React.ReactNode;
  session: Session;
  pages: FacebookPage[];
}

export function Shell({ children, session, pages }: ShellProps) {
  return (
    <FacebookPageStore pages={pages}>
      <FacebookSidebar session={session} />
      <SidebarInset>{children}</SidebarInset>
    </FacebookPageStore>
  );
}
