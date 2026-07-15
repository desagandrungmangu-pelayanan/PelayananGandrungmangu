'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  Users,
  History,
  Map as MapIcon,
  Milestone,
  Zap,
  Image as ImageIcon,
  PlayCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Landmark,
  UserCircle2,
  Calendar,
  Compass,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { VillageMap } from '@/components/village-map';

type Official = {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  category: 'perangkat' | 'bpd' | 'rtrw';
};

export default function ProfilDesaPage() {
  const [activeTab, setActiveTab] = useState('sambutan');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firestore = useFirestore();

  // Data for Kenali Kami (Tab 2)
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, isLoading: isLoadingOfficials } = useCollection<Official>(officialsQuery);

  // Get news data for Dokumentasi Kegiatan (Tab 7 - Galeri)
  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('updatedAt', 'desc'));
  }, [firestore]);

  const { data: newsData, isLoading: isLoadingNews } = useCollection<any>(newsQuery);

  // Get village profile data for video URL
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ youtubeVideoUrl?: string; kadesPhotoUrl?: string }>(profileRef);

  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    const videoId = match ? match[1] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const youtubeEmbedUrl = getYoutubeEmbedUrl(profileData?.youtubeVideoUrl);

  const processedOfficials = useMemo(() => {
    if (!officials) return { perangkat: [], bpd: [], rtrwGroups: [] };

    const getPerangkatRank = (pos: string) => {
      const p = pos.toLowerCase();
      if (p.includes('staf') || p.includes('staff')) return 5;
      if (p.includes('kepala desa') || p.includes('kades')) return 1;
      if (p.includes('sekretaris') || p.includes('sekdes')) return 2;
      if (p.includes('kasi') || p.includes('kaur')) return 3;
      if (p.includes('kadus') || p.includes('kepala dusun')) return 4;
      return 6;
    };

    const perangkat = officials
      .filter(o => o.category === 'perangkat')
      .sort((a, b) => getPerangkatRank(a.position) - getPerangkatRank(b.position));

    const bpd = officials
      .filter(o => o.category === 'bpd')
      .sort((a, b) => {
        if (a.position.toLowerCase().includes('ketua') && !b.position.toLowerCase().includes('ketua')) return -1;
        if (!a.position.toLowerCase().includes('ketua') && b.position.toLowerCase().includes('ketua')) return 1;
        return a.name.localeCompare(b.name);
      });

    const rtrwRaw = officials.filter(o => o.category === 'rtrw');
    const rwGroups: Record<string, Official[]> = {};

    rtrwRaw.forEach(item => {
      const rwMatch = item.position.match(/RW\s?(\d+)/i);
      const rwNum = rwMatch ? rwMatch[1].padStart(2, '0') : '99';
      if (!rwGroups[rwNum]) rwGroups[rwNum] = [];
      rwGroups[rwNum].push(item);
    });

    const sortedRwKeys = Object.keys(rwGroups).sort();
    const rtrwGroups = sortedRwKeys.map(key => {
      return {
        rwLabel: `Wilayah RW ${key}`,
        members: rwGroups[key].sort((a, b) => {
          if (a.position.toLowerCase().includes('ketua rw') && !b.position.toLowerCase().includes('ketua rw')) return -1;
          if (!a.position.toLowerCase().includes('ketua rw') && b.position.toLowerCase().includes('ketua rw')) return 1;
          const rtA = a.position.match(/RT\s?(\d+)/i)?.[1] || '0';
          const rtB = b.position.match(/RT\s?(\d+)/i)?.[1] || '0';
          return parseInt(rtA) - parseInt(rtB);
        })
      };
    });

    return { perangkat, bpd, rtrwGroups };
  }, [officials]);
  const tabs = [
    { id: 'sambutan', label: 'Profil & Sambutan', icon: User },
    { id: 'kenali', label: 'Kenali Kami', icon: Users },
    { id: 'sejarah', label: 'Sejarah Desa', icon: History },
    { id: 'peta', label: 'Peta & Batas', icon: MapIcon },
    { id: 'wilayah', label: 'Data Wilayah', icon: Milestone },
    { id: 'potensi', label: 'Potensi Unggulan', icon: Zap },
    { id: 'galeri', label: 'Galeri Media', icon: ImageIcon },
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-slate-100 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Beranda</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* SIDEBAR NAVIGATION (Desktop) / TOP SCROLL (Mobile) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 z-40">
            {/* Desktop Navigation List */}
            <div className="hidden lg:flex bg-white rounded-[2.5rem] p-4 border shadow-sm flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 whitespace-nowrap w-full group text-left",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  <tab.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-secondary" : "text-slate-400")} />
                  <span className="font-black uppercase text-[10px] tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Dropdown Selector */}
            <div className="block lg:hidden w-full relative mb-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-between bg-primary text-white px-5 py-4 rounded-xl shadow-md font-black uppercase text-[10px] tracking-wider"
              >
                <div className="flex items-center gap-3">
                  {React.createElement(activeTabObj.icon, { className: "h-5 w-5 text-secondary" })}
                  <span>{activeTabObj.label}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isMenuOpen && "rotate-180")} />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 z-50 bg-white border rounded-xl shadow-xl overflow-hidden py-1 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {tabs.map((tab) => {
                      const isCurrent = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-3.5 text-left text-xs font-bold transition-colors",
                            isCurrent ? "bg-slate-50 text-primary" : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <tab.icon className={cn("h-4 w-4 shrink-0", isCurrent ? "text-primary" : "text-slate-400")} />
                          <span className="uppercase tracking-wider">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="hidden lg:block mt-8 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Akses Cepat</p>
                <h4 className="text-xl font-display font-semibold italic">Butuh bantuan administrasi?</h4>
                <Link href="/layanan-surat">
                  <Button className="bg-secondary text-primary font-black uppercase text-[10px] tracking-widest w-full h-12 rounded-xl mt-4">
                    Buka Layanan Surat
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-9 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'sambutan' && <SambutanTab kadesPhotoUrl={profileData?.kadesPhotoUrl} />}
            {activeTab === 'kenali' && <KenaliTab data={processedOfficials} isLoading={isLoadingOfficials} />}
            {activeTab === 'sejarah' && <SejarahTab />}
            {activeTab === 'peta' && <PetaTab />}
            {activeTab === 'wilayah' && <WilayahTab />}
            {activeTab === 'potensi' && <PotensiTab />}
            {activeTab === 'galeri' && <GaleriTab youtubeEmbedUrl={youtubeEmbedUrl} newsData={newsData} isLoadingNews={isLoadingNews} />}
          </main>
        </div>
      </div>

      <footer className="bg-primary text-white/40 py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Pemerintah Desa Gandrungmangu Digital Portal
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- TAB COMPONENTS ---

function SambutanTab({ kadesPhotoUrl }: { kadesPhotoUrl?: string }) {
  const imageUrl = kadesPhotoUrl || "https://picsum.photos/seed/kades/600/800";
  return (
    <div className="grid md:grid-cols-12 gap-8 items-stretch">
      <div className="md:col-span-4 lg:col-span-4">
        <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-xl bg-white sticky top-28">
          <div className="aspect-[3/4] relative bg-slate-100">
            <img
              src={imageUrl}
              alt="Kepala Desa"
              className="w-full h-full object-cover"
              data-ai-hint="official portrait"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          </div>
          <div className="p-6 md:p-8 text-center bg-primary text-white">
            <h3 className="text-xl font-black uppercase tracking-tight font-display italic">NURYANI</h3>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mt-1">Kepala Desa Gandrungmangu</p>
          </div>
        </Card>
      </div>
      <div className="md:col-span-8 lg:col-span-8 bg-white p-6 md:p-16 rounded-3xl md:rounded-[4rem] border shadow-sm space-y-8">
        <div className="space-y-4">
          <Badge className="bg-blue-50 text-blue-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
            Sambutan Resmi
          </Badge>
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tighter">
            Melayani dengan <span className="text-primary not-italic">Hati</span>, Membangun dengan <span className="text-secondary">Inovasi</span>.
          </h2>
        </div>
        <div className="prose prose-slate max-w-none">
          <p className="text-sm md:text-lg leading-relaxed text-slate-600 font-medium italic border-l-4 md:border-l-8 border-secondary pl-4 md:pl-8 py-2">
            "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi digital Desa Gandrungmangu. Website ini adalah perwujudan dari visi kami untuk menciptakan transparansi dan kemudahan layanan bagi seluruh warga."
          </p>
          <div className="space-y-6 text-slate-700 text-sm md:text-lg leading-relaxed pt-6">
            <p>
              Di era transformasi digital ini, kami menyadari bahwa kecepatan informasi dan kemudahan akses layanan adalah kunci kemajuan sebuah wilayah. Desa Gandrungmangu tidak ingin tertinggal. Kami hadirkan sistem layanan mandiri ini agar warga dapat mengurus administrasi dari mana saja, kapan saja.
            </p>
            <p>
              Portal ini tidak hanya tentang surat-menyurat, tapi juga tentang keterbukaan anggaran desa, promosi produk UMKM warga, dan penyebaran berita kegiatan pembangunan desa secara real-time. Mari bersama-sama kita bangun Gandrungmangu menjadi desa yang mandiri, cerdas, dan bermartabat.
            </p>
          </div>
        </div>
        <div className="pt-6 flex flex-wrap gap-2 sm:gap-4">
          {["Transparansi", "Efisiensi", "Gotong Royong", "Digitalisasi"].map(tag => (
            <div key={tag} className="flex items-center gap-2 px-5 py-2 bg-slate-50 border rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
              <CheckCircle2 className="h-3 w-3 text-secondary" /> {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KenaliTab({ data, isLoading }: { data: any, isLoading: boolean }) {
  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-slate-900 uppercase font-display italic">Struktur <span className="text-primary not-italic">Pemerintahan</span></h2>
        <p className="text-slate-500 font-medium text-lg border-l-4 border-secondary pl-4 uppercase tracking-tight">Mengenal Pelayan Masyarakat Desa Gandrungmangu</p>
      </div>

      <div className="space-y-20">
        {/* PERANGKAT DESA */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg"><UserCircle2 className="h-6 w-6" /></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Perangkat Desa</h3>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {data.perangkat.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          )}
        </section>

        {/* BPD */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary text-primary rounded-2xl shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">BPD Desa</h3>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {data.bpd.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          )}
        </section>

        {/* RT/RW GROUPS */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg"><Landmark className="h-6 w-6" /></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Lembaga Kemasyarakatan (RT/RW)</h3>
          </div>
          <div className="space-y-10 md:space-y-16">
            {data.rtrwGroups.map((group: any, i: number) => (
              <div key={i} className="space-y-8 p-6 md:p-10 bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-100" />
                  <Badge className="bg-slate-100 text-slate-400 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] px-4 md:px-8 py-1.5 md:py-2 rounded-full border">
                    {group.rwLabel}
                  </Badge>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                  {group.members.map((o: Official) => <OfficialCard key={o.id} official={o} isSmall />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SejarahTab() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="text-center space-y-4">
        <Badge className="bg-blue-50 text-blue-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Sejarah Desa
        </Badge>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase font-display italic tracking-tight">
          Selayang Pandang <span className="text-primary not-italic">Sejarah Desa Gandrungmangu</span>
        </h2>
        <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
      </div>

      {/* MAIN CONTENT CARD */}
      <Card className="rounded-3xl md:rounded-[3.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-8 md:p-14 space-y-8 text-slate-700 text-base md:text-lg leading-relaxed font-normal">
          <p>
            Desa Gandrungmangu merupakan salah satu desa yang berada di wilayah Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah. Berlokasi di pusat kecamatan, desa ini sejak dahulu memiliki peran strategis sebagai pusat pemerintahan, perdagangan, pendidikan, dan pelayanan masyarakat. Posisinya yang berada pada jalur penghubung Jawa Tengah dan Jawa Barat menjadikan Desa Gandrungmangu berkembang sebagai kawasan yang dinamis dengan aktivitas ekonomi dan sosial yang terus tumbuh.
          </p>

          <p>
            Sejarah awal Desa Gandrungmangu belum terdokumentasikan secara lengkap dalam sumber tertulis. Namun berdasarkan cerita yang berkembang di tengah masyarakat, wilayah ini telah dihuni sejak ratusan tahun silam dan menjadi bagian dari perkembangan kawasan barat Kabupaten Cilacap yang memiliki keterkaitan erat dengan budaya Jawa dan Sunda. Pengaruh budaya tersebut masih dapat dijumpai dalam tradisi, bahasa, kesenian, serta nilai-nilai kehidupan masyarakat yang diwariskan dari generasi ke generasi.
          </p>

          <p>
            Sebagai desa yang tumbuh di kawasan agraris, kehidupan masyarakat Gandrungmangu sejak dahulu bertumpu pada sektor pertanian, perkebunan, peternakan, dan perdagangan. Semangat gotong royong, musyawarah, serta kebersamaan menjadi fondasi utama dalam membangun kehidupan sosial yang harmonis. Nilai-nilai tersebut tetap terpelihara hingga kini dan menjadi bagian penting dalam setiap proses pembangunan desa.
          </p>

          <p>
            Memasuki era modern, Desa Gandrungmangu terus bertransformasi menjadi desa yang maju dan adaptif terhadap perkembangan teknologi. Berbagai inovasi pelayanan publik berbasis digital dikembangkan untuk memberikan kemudahan, kecepatan, serta transparansi kepada masyarakat, tanpa meninggalkan kearifan lokal yang telah menjadi identitas desa selama bertahun-tahun.
          </p>

          <p>
            Kini, Desa Gandrungmangu terus melangkah menuju desa yang mandiri, maju, dan sejahtera melalui pembangunan yang berkelanjutan di berbagai bidang, mulai dari pemerintahan, infrastruktur, pendidikan, kesehatan, ekonomi, hingga pemberdayaan masyarakat. Dengan semangat kebersamaan dan pelayanan yang prima, Pemerintah Desa Gandrungmangu berkomitmen mewujudkan tata kelola pemerintahan yang profesional, transparan, akuntabel, dan berorientasi pada kesejahteraan seluruh warga.
          </p>

          {/* HIGHLIGHT / QUOTE BOX */}
          <div className="mt-10 p-6 md:p-8 bg-slate-900 text-white rounded-2xl md:rounded-3xl border-l-8 border-secondary space-y-3 shadow-lg">
            <p className="text-lg md:text-xl font-bold italic tracking-wide text-secondary">
              &quot;Melestarikan sejarah, menjaga budaya, membangun masa depan.&quot;
            </p>
            <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
              Itulah semangat yang menjadi pijakan Desa Gandrungmangu dalam menghadapi tantangan zaman, sekaligus mewariskan nilai-nilai luhur kepada generasi penerus.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PetaTab() {
  return (
    <div className="space-y-10">
      {/* SECTION TITLE & DESCRIPTION */}
      <div className="space-y-3">
        <Badge className="bg-blue-50 text-blue-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Geografis & Pemetaan
        </Badge>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase font-display italic tracking-tight">
          Peta & <span className="text-primary not-italic">Batas Wilayah</span>
        </h2>
        <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed max-w-3xl">
          Berdasarkan peta administrasi wilayah Kecamatan Gandrungmangu dan data spasial, Desa Gandrungmangu memiliki batas wilayah yang strategis berada di pusat Kecamatan Gandrungmangu.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* MAP DISPLAY & ALAMAT BALAI DESA */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-xl h-[380px] sm:h-[500px] md:h-[580px] relative group">
            <VillageMap />
            <div className="absolute top-4 md:top-8 left-4 md:left-8 pointer-events-none z-10">
              <Badge className="bg-primary text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest px-4 md:px-6 py-1.5 md:py-2 rounded-full border-none shadow-2xl">
                Live Map Interface
              </Badge>
            </div>
          </Card>

          {/* ALAMAT KANTOR BALAI DESA */}
          <Card className="rounded-3xl md:rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight font-display">Kantor Kepala Desa Gandrungmangu</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Jl. Raya No. 101, Desa Gandrungmangu, Kecamatan Gandrungmangu, Kabupaten Cilacap, Jawa Tengah 53254.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* SIDE INFOS (BATAS WILAYAH & KOORDINAT) */}
        <div className="lg:col-span-5 space-y-6">
          {/* BATAS WILAYAH */}
          <Card className="rounded-3xl md:rounded-[2.5rem] border-none bg-primary text-white overflow-hidden shadow-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Geografis</p>
                <h3 className="text-2xl font-display font-semibold italic">Batas Wilayah Desa</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { dir: 'UTARA', label: 'Desa Cinangsi' },
                  { dir: 'SELATAN', label: 'Desa Gandrungmanis' },
                  { dir: 'TIMUR', label: 'Desa Muktisari' },
                  { dir: 'BARAT', label: 'Desa Bulusari' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/5 min-w-0 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                      {item.dir[0]}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{item.dir}</p>
                      <p className="font-bold text-xs sm:text-[13px] text-slate-100 leading-snug break-words">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/70 leading-relaxed italic border-t border-white/10 pt-4">
                Batas wilayah tersebut sesuai dengan posisi Desa Gandrungmangu sebagai desa yang berada di pusat Kecamatan Gandrungmangu.
              </p>
            </CardContent>
          </Card>

          {/* TITIK KOORDINAT */}
          <Card className="rounded-3xl md:rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/20 text-primary rounded-2xl shrink-0">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Titik Koordinat Balai Desa</h4>
                <p className="text-xs text-slate-500 font-medium">Data pemetaan digital terverifikasi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[9px] font-sans font-black text-slate-400 uppercase block tracking-wider">Latitude</span>
                <span className="font-bold text-slate-800 text-sm block">-7.5110</span>
                <span className="text-[10px] text-primary font-semibold block">7°30&apos;40&quot; LS</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[9px] font-sans font-black text-slate-400 uppercase block tracking-wider">Longitude</span>
                <span className="font-bold text-slate-800 text-sm block">108.8469</span>
                <span className="text-[10px] text-primary font-semibold block">108°50&apos;49&quot; BT</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WilayahTab() {
  const dusunList = [
    {
      name: 'DUSUN MARGAMULYA',
      rw: 'RW 01',
      rtCount: 10,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05', 'RT 06', 'RT 07', 'RT 08', 'RT 09', 'RT 10'],
      color: 'bg-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700'
    },
    {
      name: 'DUSUN BULUWANGI',
      rw: 'RW 02',
      rtCount: 7,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05', 'RT 06', 'RT 07'],
      color: 'bg-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700'
    },
    {
      name: 'DUSUN GANDRUNGMANGUN',
      rw: 'RW 03',
      rtCount: 6,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05', 'RT 06'],
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700'
    },
    {
      name: 'DUSUN KEBON ARUM',
      rw: 'RW 04',
      rtCount: 5,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05'],
      color: 'bg-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      name: 'DUSUN KEBANARAN',
      rw: 'RW 05',
      rtCount: 5,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05'],
      color: 'bg-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700'
    },
    {
      name: 'DUSUN KEDUNGREJA',
      rw: 'RW 06',
      rtCount: 5,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05'],
      color: 'bg-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    {
      name: 'DUSUN CIAWITALI',
      rw: 'RW 07',
      rtCount: 5,
      rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05'],
      color: 'bg-cyan-600',
      badgeBg: 'bg-cyan-50 text-cyan-700'
    },
  ];

  const totalRt = dusunList.reduce((acc, curr) => acc + curr.rtCount, 0);

  return (
    <div className="space-y-12">
      {/* HEADER & SUMMARY CARDS */}
      <div className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <Badge className="bg-blue-50 text-blue-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
            Struktur Administratif
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase font-display italic tracking-tight">
            Data <span className="text-primary not-italic">Wilayah Desa</span>
          </h2>
          <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed">
            Distribusi pembagian wilayah administratif Desa Gandrungmangu mencakup 7 Dusun, 7 Rukun Warga (RW), dan 43 Rukun Tetangga (RT).
          </p>
        </div>

        {/* SUMMARY NUMBERS */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-1 text-center md:text-left">
            <p className="text-3xl md:text-5xl font-black text-primary tracking-tight font-display">{dusunList.length}</p>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">Total Dusun</p>
          </div>
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-1 text-center md:text-left">
            <p className="text-3xl md:text-5xl font-black text-secondary tracking-tight font-display">7</p>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">Total RW</p>
          </div>
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-1 text-center md:text-left">
            <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display">{totalRt}</p>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">Total RT</p>
          </div>
        </div>
      </div>

      {/* DUSUN CARDS LIST */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {dusunList.map((dusun, i) => (
          <Card key={i} className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group flex flex-col justify-between">
            <div>
              <div className={cn("h-3 w-full", dusun.color)} />
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge className={cn("font-black uppercase text-[10px] tracking-widest px-3 py-1 border-none mb-2", dusun.badgeBg)}>
                      {dusun.rw}
                    </Badge>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">{dusun.name}</h3>
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Milestone className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Daftar Rukun Tetangga (RT)</span>
                    <span className="text-primary font-black">{dusun.rtCount} RT</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {dusun.rts.map((rt) => (
                      <span key={rt} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                        {rt}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PotensiTab() {
  const potentials = [
    { title: 'Pertanian Utama', desc: 'Lahan sawah seluas 500+ hektar yang menghasilkan padi kualitas premium serta komoditas palawija unggulan.', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'UMKM Mandiri', desc: 'Produk olahan makanan lokal seperti keripik dan kerajinan tangan hasil karya ibu-ibu PKK desa.', icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Wisata Alam', desc: 'Potensi wisata agro dan river tubing yang sedang dikembangkan untuk menarik minat wisatawan daerah.', icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Budaya Lokal', desc: 'Tradisi gotong royong yang kuat serta pelestarian seni banyumasan yang tetap eksis di tengah warga.', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase font-display italic">Potensi <span className="text-primary not-italic">Unggulan</span></h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Aset Ekonomi & Kekayaan Budaya Gandrungmangu</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {potentials.map((item, i) => (
          <Card key={i} className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group flex flex-col h-full">
            <CardContent className="p-6 md:p-10 flex flex-col h-full space-y-6">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="h-8 w-8" />
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="text-xl font-black uppercase tracking-tight text-slate-800 leading-tight">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
              <div className="w-8 h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GaleriTab({ youtubeEmbedUrl, newsData, isLoadingNews }: { youtubeEmbedUrl: string | null, newsData?: any[] | null, isLoadingNews?: boolean }) {
  // Filter news yang memiliki imageUrl untuk dokumentasi kegiatan
  const documentationPhotos = useMemo(() => {
    if (!newsData) return [];
    return newsData
      .filter(news => news.imageUrl && news.mediaType !== 'video')
      .map(news => ({
        url: news.imageUrl,
        title: news.title,
        date: news.date,
      }));
  }, [newsData]);

  return (
    <div className="space-y-16">
      {/* Video Profile Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><PlayCircle className="h-6 w-6" /></div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">Video Profil Resmi Desa</h3>
        </div>
        <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-2xl aspect-video bg-slate-900 group">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Profil Desa Gandrungmangu"
              className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[240px] md:min-h-[320px] items-center justify-center bg-slate-950 text-center text-slate-200">
              <div className="space-y-3 px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <p className="text-base md:text-lg font-semibold">Video profil desa belum dikonfigurasi.</p>
                <p className="text-xs md:text-sm text-slate-300">Silakan atur tautan YouTube di halaman Pengaturan Admin.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Photo Gallery Grid - Dokumentasi Kegiatan dari Berita */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl"><ImageIcon className="h-6 w-6" /></div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Dokumentasi Kegiatan</h3>
        </div>

        {isLoadingNews ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl md:rounded-[2rem]" />
            ))}
          </div>
        ) : documentationPhotos.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">Belum ada dokumentasi kegiatan.</p>
            <p className="text-slate-400 text-sm">Foto dokumentasi akan muncul ketika berita dengan foto ditambahkan.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {documentationPhotos.map((photo, i) => (
              <div key={i} className="rounded-2xl md:rounded-[2rem] overflow-hidden border-4 border-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group relative">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white text-sm font-semibold line-clamp-2">{photo.title}</p>
                  {photo.date && (
                    <p className="text-white/70 text-xs mt-1">{photo.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-10">
          <Link href="/BeritaDesa">
            <Button variant="outline" className="rounded-xl font-bold gap-2 border-primary text-primary h-12 px-10">
              Lihat Seluruh Berita
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Reuse OfficialCard for internal Kenali tab
function OfficialCard({ official, isSmall = false }: { official: Official, isSmall?: boolean }) {
  return (
    <div className={`group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
      <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
        {official.imageUrl ? (
          <img src={official.imageUrl} alt={official.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <UserCircle2 className="h-16 w-16 text-primary/10" />
          </div>
        )}
      </div>
      <div className={`${isSmall ? 'p-4' : 'p-6'} space-y-2`}>
        <div className="w-10 h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
        <h3 className={`${isSmall ? 'text-[11px]' : 'text-sm'} font-black text-slate-900 uppercase leading-tight line-clamp-2`}>
          {official.name}
        </h3>
        <p className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-bold text-primary uppercase tracking-widest italic`}>
          {official.position}
        </p>
      </div>
    </div>
  );
}
