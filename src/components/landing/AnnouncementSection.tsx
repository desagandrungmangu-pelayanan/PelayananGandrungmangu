'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemoFirebase, useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { ArrowRight, Megaphone, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Announcement } from '@/lib/types';
import { formatDisplayDate } from './landing-utils';

export function AnnouncementSection() {
  const firestore = useFirestore();
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('publishDate', 'desc'), limit(1));
  }, [firestore]);

  const { data: announcements, isLoading, error } = useCollection<Announcement>(announcementsQuery);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-blue-700">Pengumuman Terbaru</p>
          <h2 className="mt-2 sm:mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Informasi Penting Desa
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg leading-relaxed sm:leading-8 text-slate-600">
            Pengumuman dan informasi terkini dari Pemerintah Desa Gandrungmangu.
          </p>
        </div>
        <Link href="/pengumuman" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">
          Lihat semua pengumuman
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="mt-8 sm:mt-12 space-y-4">
        {isLoading ? (
          <div className="rounded-2xl sm:rounded-[1.5rem] border border-blue-900/20 bg-white p-5 sm:p-6 shadow-[0_20px_45px_rgba(15,23,42,0.04)]">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-7 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-2xl sm:rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-xs sm:text-sm text-amber-700">
            Pengumuman sedang tidak dapat dimuat saat ini.
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="rounded-2xl sm:rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-600">
            Belum ada pengumuman publik yang dibagikan.
          </div>
        ) : (
          announcements.slice(0, 1).map((announcement) => (
            <motion.article
              key={announcement.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3 }}
              className="group relative overflow-hidden flex flex-col gap-4 rounded-2xl sm:rounded-[1.5rem] border border-blue-900/20 hover:border-blue-700/40 bg-white p-5 sm:p-6 md:p-8 shadow-[0_20px_45px_rgba(15,23,42,0.04)] transition-all duration-300 md:flex-row md:items-start md:justify-between"
            >
              {/* Glowing Corner Accent */}
              <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-600/5 blur-xl transition-all duration-500 group-hover:bg-blue-600/10 group-hover:scale-125" />
              
              {/* Subtle Dot Grid pattern */}
              <div className="absolute right-5 top-5 text-slate-200 transition-colors duration-300 group-hover:text-blue-200/50 pointer-events-none">
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <pattern id="announcement-dots-latest" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="40" height="40" fill="url(#announcement-dots-latest)" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between w-full">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-900 group-hover:text-white">
                    <Megaphone className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold text-blue-700 text-[10px] sm:text-xs">Pengumuman Terbaru</span>
                      <span>{formatDisplayDate(announcement.publishDate)}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-900">{announcement.title}</h3>
                    <p className="max-w-3xl text-xs sm:text-sm leading-relaxed sm:leading-7 text-slate-600 line-clamp-3">{announcement.content}</p>
                  </div>
                </div>
                <Link href={`/pengumuman/${announcement.id}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors self-start md:self-center shrink-0 pt-1 md:pt-0">
                  Baca selengkapnya
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </section>
  );
}
