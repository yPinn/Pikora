'use client';

import Image from 'next/image';

import { signIn } from 'next-auth/react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import momonga1 from '@/public/Momonga_1.jpg';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  const handleFacebookLogin = () => {
    signIn('facebook', { callbackUrl: `${appUrl}/facebook/content/posts` });
  };

  const handleInstagramLogin = () => {
    // Instagram 使用相同的 Facebook OAuth，之後取得 IG 帳號
    signIn('facebook', { callbackUrl: `${appUrl}/instagram/dashboard` });
  };

  const handleThreadsLogin = () => {
    // Threads 使用相同的 Facebook OAuth，之後取得 Threads 帳號
    signIn('facebook', { callbackUrl: `${appUrl}/threads/dashboard` });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex min-h-96 flex-col items-center justify-center gap-8 p-6 md:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-hero font-bold">Pikora</h1>
              <p className="text-muted-foreground text-balance">Post the Best, Pikora the Rest</p>
            </div>

            <div className="w-full space-y-3">
              <Button
                className="bg-facebook/15 hover:bg-facebook/25 text-facebook w-full"
                variant="ghost"
                onClick={handleFacebookLogin}
              >
                <FaFacebook className="size-4" />
                Facebook
              </Button>

              <Button
                className="bg-instagram/15 hover:bg-instagram/25 text-instagram w-full"
                variant="ghost"
                onClick={handleInstagramLogin}
              >
                <FaInstagram className="size-4" />
                Instagram
              </Button>

              <Button
                className="bg-threads/10 hover:bg-threads/20 text-threads w-full"
                variant="ghost"
                onClick={handleThreadsLogin}
              >
                <SiThreads className="size-4" />
                Threads
              </Button>
            </div>
          </div>

          <div className="bg-muted relative hidden md:block md:aspect-square">
            <Image
              fill
              priority
              alt="Login background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
              sizes="(max-width: 768px) 0vw, 50vw"
              src={momonga1}
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-body px-6 text-center">
        登入即表示您同意我們的{' '}
        <a className="underline-offset-2 hover:underline" href={`${appUrl}/terms`}>
          服務條款
        </a>{' '}
        和{' '}
        <a className="underline-offset-2 hover:underline" href={`${appUrl}/privacy`}>
          隱私政策
        </a>
        。
      </div>
    </div>
  );
}
