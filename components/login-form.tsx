'use client';

import Image from 'next/image';

import { signIn } from 'next-auth/react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const handleFacebookLogin = () => {
    signIn('facebook', { callbackUrl: '/facebook/content/posts' });
  };

  const handleInstagramLogin = () => {
    // Instagram 使用相同的 Facebook OAuth，之後取得 IG 帳號
    signIn('facebook', { callbackUrl: '/instagram/dashboard' });
  };

  const handleThreadsLogin = () => {
    // Threads 使用相同的 Facebook OAuth，之後取得 Threads 帳號
    signIn('facebook', { callbackUrl: '/threads/dashboard' });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex min-h-96 flex-col items-center justify-center gap-8 p-6 md:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-bold">Pikora</h1>
              <p className="text-muted-foreground text-balance">Post the Best, Pikora the Rest</p>
            </div>

            <div className="w-full space-y-3">
              <Button
                className="w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900"
                variant="ghost"
                onClick={handleFacebookLogin}
              >
                <FaFacebook className="size-4 text-blue-600 dark:text-blue-400" />
                Facebook
              </Button>

              <Button
                className="w-full bg-pink-100 hover:bg-pink-200 dark:bg-pink-950 dark:hover:bg-pink-900"
                variant="ghost"
                onClick={handleInstagramLogin}
              >
                <FaInstagram className="size-4 text-pink-600 dark:text-pink-400" />
                Instagram
              </Button>

              <Button
                className="w-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                variant="ghost"
                onClick={handleThreadsLogin}
              >
                <SiThreads className="size-4 text-black dark:text-white" />
                Threads
              </Button>
            </div>
          </div>

          <div className="bg-muted relative hidden md:block md:aspect-square">
            <Image
              fill
              alt="Login background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
              src="/Momonga_1.jpg"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground px-6 text-center text-sm">
        By logging in, you agree to our{' '}
        <a className="underline-offset-2 hover:underline" href="#">
          Terms of Service
        </a>{' '}
        and{' '}
        <a className="underline-offset-2 hover:underline" href="#">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
