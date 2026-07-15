'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquareWarning, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ComplaintSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.06)]"
      >
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-blue-50 opacity-60" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-12 translate-y-12 rounded-full bg-amber-50 opacity-50" />

        <div className="relative grid items-center gap-6 sm:gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-12 lg:p-12">
          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-blue-700">
              <MessageSquareWarning className="h-3.5 w-3.5 shrink-0" />
              <span>Pengaduan Warga</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Sampaikan Aspirasi Anda
              </h2>
              <p className="max-w-2xl text-xs sm:text-base leading-relaxed sm:leading-7 text-slate-600">
                Punya keluhan, saran, atau masukan untuk kemajuan Desa Gandrungmangu?
                Sampaikan langsung secara online dan kami akan menindaklanjuti setiap laporan yang masuk.
              </p>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Aman & Terjamin</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-600">
                <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Ditindaklanjuti Cepat</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Analisis AI Otomatis</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 lg:items-center w-full lg:w-auto pt-2 lg:pt-0">
            <div className="hidden sm:flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-blue-900 text-white shadow-xl shadow-blue-900/20">
              <MessageSquareWarning className="h-7 w-7 sm:h-9 sm:w-9" />
            </div>
            <Link href="/pengaduan" aria-label="Buat pengaduan warga" className="w-full sm:w-auto">
              <Button className="h-11 w-full sm:w-auto rounded-full bg-blue-900 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-950 shadow-[0_12px_30px_rgba(30,58,138,0.2)]">
                Buat Pengaduan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
