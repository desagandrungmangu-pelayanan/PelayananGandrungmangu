'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowRight, BadgeCheck, Landmark, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AboutSection() {
  const firestore = useFirestore();
  const aboutRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: aboutData } = useDoc<{ description?: string; imageUrl?: string }>(aboutRef);
  const description = aboutData?.description || 'Desa Gandrungmangu merupakan wilayah yang berkembang dengan semangat gotong royong, pelayanan publik yang responsif, dan komitmen menjaga kesejahteraan masyarakat melalui tata kelola pemerintahan yang modern dan terbuka.';
  const imageUrl = aboutData?.imageUrl || 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200';

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 -translate-y-3 sm:-translate-y-4 rotate-2 rounded-2xl sm:rounded-[2rem] bg-blue-100/70" />
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-2.5 sm:p-3 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <Image
              src={imageUrl}
              alt="Kantor Desa Gandrungmangu"
              width={900}
              height={700}
              className="h-[240px] sm:h-[360px] lg:h-[420px] w-full rounded-xl sm:rounded-[1.5rem] object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-blue-700">
            <Landmark className="h-3.5 w-3.5 shrink-0" />
            <span>Tentang Desa</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Tentang Desa Gandrungmangu
          </h2>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-lg leading-relaxed sm:leading-8 text-slate-600">
            <p>{description}</p>
            <p>
              Melalui portal yang modern, masyarakat dapat mengakses pelayanan, memahami informasi publik, dan berpartisipasi dalam pembangunan desa secara lebih mudah.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-medium text-slate-700">
              <BadgeCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Layanan resmi desa</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-medium text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Digital dan modern</span>
            </div>
          </div>
          <Link href="/profil-desa" aria-label="Lihat profil desa lengkap" className="inline-block w-full sm:w-auto pt-2">
            <Button className="h-10 sm:h-11 w-full sm:w-auto rounded-full bg-blue-900 px-6 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-950">
              Selengkapnya
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
