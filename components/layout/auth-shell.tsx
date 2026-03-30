'use client';

import { SidebarProvider } from '@/components/ui/sidebar';

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
