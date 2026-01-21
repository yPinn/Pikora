import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { AuthenticatedLayoutClient } from './layout-client';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <AuthenticatedLayoutClient session={session}>{children}</AuthenticatedLayoutClient>;
}
