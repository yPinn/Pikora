import { Caveat, Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import { SessionProvider } from '@/components/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

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

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
});

const delaGothicOne = localFont({
  src: '../public/fonts/DelaGothicOne-Regular.woff2',
  variable: '--font-dela-gothic-one',
  weight: '400',
  display: 'swap',
});

const description =
  '整合 Facebook、Instagram、Threads，密碼學安全抽獎，讓每場社群活動更省力、更公正。';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://pikora.app'),
  title: {
    default: 'Pikora — 跨平台社群抽獎工具',
    template: '%s | Pikora',
  },
  description,
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'Pikora',
    description,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html suppressHydrationWarning data-scroll-behavior="smooth" lang="zh-TW">
        <head />
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${delaGothicOne.variable} antialiased`}
        >
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              {children}
              <Toaster />
            </ThemeProvider>
          </SessionProvider>
        </body>
      </html>
    </>
  );
}
