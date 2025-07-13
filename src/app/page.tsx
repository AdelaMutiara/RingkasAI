import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { CheckCircle, Zap, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 14h4" />
              <path d="M9 17h2" />
            </svg>
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
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
              Ringkas Teks Bahasa Indonesia dengan Cepat
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Ubah teks panjang menjadi ringkasan yang padat dan mudah dipahami dengan bantuan AI canggih. Hemat waktu dan fokus pada hal terpenting.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/summarizer">Coba Sekarang</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Fitur Unggulan</h2>
              <p className="mt-2 text-muted-foreground">
                Apa yang membuat RingkasAI pilihan terbaik.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="items-center">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <Zap className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">Cepat & Efisien</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  Dapatkan ringkasan dalam hitungan detik. Proses cepat tanpa mengurangi kualitas.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                   <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">Akurasi Tinggi</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  AI kami dilatih khusus untuk memahami konteks Bahasa Indonesia dan mempertahankan informasi kunci.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                   <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <FileText className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">Analisis Kata</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  Lihat perbandingan jumlah kata sebelum dan sesudah diringkas untuk mengukur efektivitas.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Siap untuk Memulai?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Coba RingkasAI sekarang dan rasakan kemudahan meringkas teks.
                </p>
                <div className="mt-8">
                     <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                        <Link href="/summarizer">Mulai Meringkas Gratis</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="py-6 md:px-8 md:py-0 bg-background">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                Dibangun dengan Next.js dan Genkit.
            </p>
        </div>
      </footer>
    </div>
  );
}
