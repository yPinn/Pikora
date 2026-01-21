// facebook-shell.tsx
'use client';

import { FacebookSidebar } from '@/components/facebook/facebook-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import type { FacebookPage } from '@/lib/services/facebook';

import type { Session } from 'next-auth';

interface FacebookShellProps {
  children: React.ReactNode;
  session: Session;
  pages: FacebookPage[];
}

export function FacebookShell({ children, session, pages }: FacebookShellProps) {
  return (
    <>
      <FacebookSidebar pages={pages} session={session} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
