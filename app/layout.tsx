import { Geist, Geist_Mono } from 'next/font/google';

import { SessionProvider } from '@/components/session-provider';
import { ThemeProvider } from '@/components/theme-provider';

import type { Metadata } from 'next';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pikora',
  description: 'Post the Best, Pikora the Rest',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html suppressHydrationWarning lang="en">
        <head />
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              {children}
            </ThemeProvider>
          </SessionProvider>
        </body>
      </html>
    </>
  );
}
