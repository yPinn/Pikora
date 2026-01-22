'use client';

import { SidebarProvider } from '@/components/ui/sidebar';

import type { Session } from 'next-auth';

interface AuthShellProps {
  children: React.ReactNode;
  session: Session;
}

export function AuthShell({ children, session: _session }: AuthShellProps) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
