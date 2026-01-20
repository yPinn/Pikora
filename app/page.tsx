import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">Pikora</h1>
        <p className="text-muted-foreground text-lg">Post the Best, Pikora the Rest.</p>
        <ModeToggle />
      </div>
    </main>
  );
}
