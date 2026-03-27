import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/layout/auth-shell';
import { auth } from '@/lib/auth';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <AuthShell session={session}>{children}</AuthShell>;
}
