'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowRight, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SambutanSection() {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ kadesPhotoUrl?: string }>(profileRef);
  const imageUrl = profileData?.kadesPhotoUrl || "https://picsum.photos/seed/kades/600/800";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="grid items-stretch gap-8 sm:gap-10 lg:grid-cols-12">
        {/* Foto Kades */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-4 flex justify-center"
        >
          <Card className="w-full max-w-[280px] sm:max-w-[340px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-lg flex flex-col">
            <div className="aspect-[3/4] relative bg-slate-100 flex-grow">
              <Image
                src={imageUrl}
                alt="Foto Kepala Desa Gandrungmangu"
                fill
                sizes="(max-w-768px) 100vw, 340px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
            <div className="p-4 sm:p-6 text-center bg-blue-950 text-white">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-display italic">NURYANI</h3>
              <p className="text-[9px] font-bold text-amber-300 uppercase tracking-[0.25em] sm:tracking-[0.3em] mt-1">Kepala Desa Gandrungmangu</p>
            </div>
          </Card>
        </motion.div>

        {/* Narasi Sambutan */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-8 flex flex-col justify-center space-y-4 sm:space-y-6"
        >
          <div className="flex items-center">
            <Badge className="bg-blue-50 text-blue-700 font-black uppercase text-[10px] tracking-widest px-3.5 py-1 sm:px-4 sm:py-1.5 border border-blue-200/50 shadow-sm rounded-full">
              <User className="h-3 w-3 mr-1 text-blue-600 inline" /> Profil & Sambutan
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tight">
            Melayani dengan <span className="text-blue-700 not-italic">Hati</span>, Membangun dengan <span className="text-amber-500">Inovasi</span>.
          </h2>

          <div className="prose prose-slate max-w-none">
            <p className="text-sm sm:text-lg leading-relaxed text-slate-600 font-medium italic border-l-4 border-amber-500 pl-3.5 sm:pl-4 py-1">
              "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi digital Desa Gandrungmangu. Website ini adalah perwujudan dari visi kami untuk menciptakan transparansi dan kemudahan layanan bagi seluruh warga."
            </p>
            <p className="mt-3 sm:mt-4 text-slate-600 text-xs sm:text-base leading-relaxed">
              Di era transformasi digital ini, kecepatan informasi dan kemudahan akses layanan adalah kunci kemajuan wilayah. Kami menghadirkan sistem layanan mandiri ini agar warga dapat mengurus berbagai kebutuhan administrasi dari mana saja secara cepat dan terbuka.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
            {["Transparansi", "Efisiensi", "Digitalisasi"].map(tag => (
              <div key={tag} className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-slate-50 border rounded-full text-[9px] font-black uppercase tracking-widest text-blue-900">
                <CheckCircle2 className="h-3 w-3 text-amber-500" /> {tag}
              </div>
            ))}
          </div>

          <div className="pt-2 sm:pt-4">
            <Link href="/profil-desa" aria-label="Baca selengkapnya tentang profil desa" className="inline-block w-full sm:w-auto">
              <Button className="h-10 sm:h-11 w-full sm:w-auto rounded-full bg-blue-900 px-6 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-950">
                Selengkapnya
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
