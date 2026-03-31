'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

function deriveAuthBasePath(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  try {
    const { pathname } = new URL(appUrl);
    const base = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    return `${base}/api/auth`;
  } catch {
    return '/api/auth';
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider basePath={deriveAuthBasePath()}>{children}</NextAuthSessionProvider>
  );
}
