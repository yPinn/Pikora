'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const basePath =
    process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'production' ? '/pikora/api/auth' : '/api/auth';
  return <NextAuthSessionProvider basePath={basePath}>{children}</NextAuthSessionProvider>;
}
