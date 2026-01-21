import Link from 'next/link';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">Pikora</h1>
        <p className="text-muted-foreground text-lg">Post the Best, Pikora the Rest.</p>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/login">登入</Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </main>
  );
}
