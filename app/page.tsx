import Link from 'next/link';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="gap-section flex flex-col items-center">
        <h1 className="text-hero font-bold">Pikora</h1>
        <p className="text-muted-foreground text-body">Post the Best, Pikora the Rest.</p>
        <div className="gap-page flex items-center">
          <Button asChild>
            <Link href="/login">登入</Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </main>
  );
}
