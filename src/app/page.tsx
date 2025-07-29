
"use client"
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Zap, FileText, Upload, Link as LinkIcon, Bot, Star, GanttChartSquare, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"

export default function LandingPage() {
    const testimonials = [
        { name: "Andi Pratama", title: "Mahasiswa", text: "\"RingkasAI mengubah cara saya belajar. Meringkas jurnal penelitian yang tadinya butuh berjam-jam, sekarang selesai dalam beberapa menit. Fitur poin penting sangat membantu!\"" },
        { name: "Siti Rahayu", title: "Content Writer", text: "\"Sebagai penulis, saya harus riset banyak artikel setiap hari. Dengan fitur ringkasan dari URL, pekerjaan saya jadi 10x lebih cepat. Sangat direkomendasikan!\"" },
        { name: "Budi Wijaya", title: "Product Manager", text: "\"Saya menggunakan RingkasAI untuk mendapatkan ringkasan dari transkrip video rapat dan interview pengguna. Sangat menghemat waktu dan membantu tim kami fokus pada hal yang penting.\"" },
        { name: "Rina Sari", title: "Peneliti Akademis", text: "\"Alat ini adalah penyelamat. Saya bisa dengan cepat meninjau puluhan artikel dan paper untuk studi literatur saya. Fitur pembuatan pertanyaan juga brilian untuk menguji pemahaman.\"" },
        { name: "Joko Susilo", title: "Digital Marketer", text: "\"Menganalisis konten kompetitor jadi lebih mudah. Saya cukup masukkan URL blog mereka dan langsung dapat poin-poin utamanya. Strategi konten kami jadi lebih tajam berkat ini.\"" },
        { name: "Dewi Lestari", title: "Guru SMA", text: "\"Saya sering menggunakan RingkasAI untuk membuat materi ajar dari berbagai sumber online. Para siswa juga saya anjurkan pakai ini agar mereka bisa belajar lebih efisien.\"" },
        { name: "Agung Nugroho", title: "Pengacara", text: "\"Dalam profesi saya, waktu sangat berharga. Meringkas dokumen hukum yang panjang dan rumit menjadi jauh lebih cepat. Ini benar-benar meningkatkan produktivitas saya.\"" },
        { name: "Fitriani", title: "Penerjemah", text: "\"Sebelum menerjemahkan, saya meringkas dulu teksnya untuk memahami inti sari. Ini membantu saya menjaga konsistensi makna. Alat yang luar biasa.\"" },
        { name: "Heru Wibowo", title: "Analis Bisnis", text: "\"Laporan pasar yang tebal dan penuh data bisa saya dapatkan poin kuncinya dalam sekejap. Membantu saya membuat keputusan bisnis dengan lebih cepat dan berbasis data.\"" },
        { name: "Linda Hartono", title: "Freelancer", text: "\"Sebagai freelancer, saya mengerjakan banyak proyek berbeda. RingkasAI membantu saya cepat 'nyambung' dengan topik baru dengan meringkas materi dari klien. Wajib punya!\"" }
    ];

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
        {/* 1. Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
              Ubah Teks Apapun Menjadi Ringkasan Cerdas, dalam Hitungan Detik.
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              Platform untuk pelajar, peneliti, dan profesional yang ingin memahami informasi lebih cepat. RingkasAI mengubah artikel panjang dan PDF menjadi ringkasan padat.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/summarizer">Coba Ringkas Gratis</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Bagaimana Cara Kerjanya?</h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                Dapatkan ringkasan berkualitas hanya dalam 3 langkah mudah.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-4 rounded-full bg-primary/20 text-primary"><Upload className="h-8 w-8" /></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Langkah 1: Masukkan Konten</h3>
                <p className="text-muted-foreground">Tempel teks, unggah PDF, atau masukkan URL dari website.</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                   <div className="p-4 rounded-full bg-primary/20 text-primary"><Bot className="h-8 w-8" /></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Langkah 2: Pilih Format</h3>
                <p className="text-muted-foreground">Pilih output yang Anda butuhkan: ringkasan, poin-poin penting, atau daftar pertanyaan.</p>
              </div>
              <div className="text-center">
                 <div className="flex justify-center items-center mb-4">
                   <div className="p-4 rounded-full bg-primary/20 text-primary"><FileText className="h-8 w-8" /></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Langkah 3: Dapatkan Hasil</h3>
                <p className="text-muted-foreground">AI kami akan memprosesnya dalam sekejap dan menyajikan hasilnya untuk Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Features to Benefits */}
         <section id="features" className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Dari Fitur Menjadi Manfaat</h2>
              <p className="mt-2 text-muted-foreground">
                Semua yang Anda butuhkan untuk memahami informasi lebih cepat.
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
                  Hemat waktu berjam-jam. Dapatkan ringkasan dalam hitungan detik, bukan jam.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                   <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <GanttChartSquare className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">Multi-Format</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  Tidak hanya ringkasan. Dapatkan juga poin-poin penting atau daftar pertanyaan kunci dari materi Anda.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                   <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <LinkIcon className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">Dukung Berbagai Sumber</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                   Proses teks dari artikel web hanya dengan menempelkan link.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. Deeper Social Proof */}
        <section className="py-20">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Apa Kata Mereka?</h2>
                </div>
                 <Carousel
                    plugins={[
                        Autoplay({
                          delay: 4000,
                        }),
                    ]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full">
                                        <CardContent className="pt-6 h-full flex flex-col justify-between">
                                            <p className="text-muted-foreground mb-4 flex-grow">{testimonial.text}</p>
                                            <div>
                                                <p className="font-bold">{testimonial.name}</p>
                                                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>


        {/* 8. FAQ Section */}
        <section id="faq" className="py-16 bg-background">
          <div className="container max-w-3xl mx-auto">
             <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Pertanyaan Umum</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Apakah RingkasAI gratis digunakan?</AccordionTrigger>
                <AccordionContent>
                  Ya, saat ini RingkasAI sepenuhnya gratis untuk digunakan. Anda bisa meringkas teks, PDF, dan URL tanpa batasan.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Seberapa akurat ringkasan yang dihasilkan?</AccordionTrigger>
                <AccordionContent>
                  AI kami dilatih secara khusus untuk memahami konteks Bahasa Indonesia dan mengekstrak informasi paling penting. Akurasinya sangat tinggi, namun kami selalu merekomendasikan untuk memeriksa kembali hasil untuk dokumen yang sangat krusial.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Apakah data saya aman?</AccordionTrigger>
                <AccordionContent>
                  Kami sangat menjaga privasi Anda. Teks atau dokumen yang Anda unggah hanya diproses untuk keperluan ringkasan dan tidak disimpan di server kami setelah proses selesai.
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="item-4">
                <AccordionTrigger>Jenis URL apa yang didukung?</AccordionTrigger>
                <AccordionContent>
                  Anda dapat menggunakan URL dari halaman web (artikel, blog). AI akan secara otomatis mendeteksi sumber dan mengambil konten yang relevan.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>


        {/* 9. Final CTA Section */}
        <section className="py-20">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Siap Meningkatkan Produktivitas Anda?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Berhenti membuang waktu membaca teks panjang. Mulai meringkas dengan cerdas hari ini.
                </p>
                <div className="mt-8">
                     <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                        <Link href="/summarizer">Mulai Meringkas Gratis</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      {/* 10. Footer */}
      <footer className="py-8 bg-background border-t">
        <div className="container text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">RingkasAI</span>
            </div>
            <div className="flex justify-center gap-4 mb-4">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">Fitur</Link>
                <Link href="#faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Kontak</Link>
            </div>
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} RingkasAI. Dibangun dengan Next.js dan Genkit.
            </p>
             <p className="text-xs text-muted-foreground mt-1">
                <Link href="#" className="hover:underline">Kebijakan Privasi</Link> &middot; <Link href="#" className="hover:underline">Syarat & Ketentuan</Link>
            </p>
        </div>
      </footer>
    </div>
  );
}
