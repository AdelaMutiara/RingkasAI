import { SummarizerPage } from '@/components/summarizer-page';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function Summarizer() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              RingkasAI
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <SummarizerPage />
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                © {new Date().getFullYear()} RingkasAI. Dibangun dengan Next.js dan Genkit.
            </p>
        </div>
      </footer>
    </div>
  );
}
