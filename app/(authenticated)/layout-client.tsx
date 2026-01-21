'use client';

import { SidebarProvider } from '@/components/ui/sidebar';

import type { Session } from 'next-auth';

interface AuthenticatedLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

export function AuthenticatedLayoutClient({
  children,
  session: _session,
}: AuthenticatedLayoutClientProps) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
