'use client';

import { TestingPhaseModal } from '@/components/testing-phase-modal';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <SidebarProvider>
      <TestingPhaseModal />
      {children}
    </SidebarProvider>
  );
}
