'use client';

import React, { useMemo, useState, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  Users, Home, UserCheck, UserPlus,
  Download, FileDown, Filter, Calendar,
  MapPin, Loader2, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLORS = ['#1e293b', '#eab308', '#059669', '#3b82f6', '#8b5cf6', '#f43f5e'];

export function StatisticsDashboard() {
  const [filterDusun, setFilterDusun] = useState('Semua Wilayah');
  const [filterTahun, setFilterTahun] = useState('2024');
  const [isExporting, setIsExporting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  // Ambil data statistik agregat dari dokumen tunggal (1 read, hemat kuota Firestore)
  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'statistics');
  }, [firestore]);

  const { data: statsDoc, isLoading: statsLoading } = useDoc<any>(statsRef);

  // LOGIKA AGREGASI DATA
  const stats = useMemo(() => {
    if (!statsDoc) return null;

    let targetStats = statsDoc;
    if (filterDusun !== 'Semua Wilayah') {
      targetStats = statsDoc.dusunData?.[filterDusun] || {
        total: 0,
        totalKK: 0,
        malePercent: 0,
        femalePercent: 0,
        ageData: [
          { name: 'Anak (0-14)', value: 0 },
          { name: 'Produktif (15-64)', value: 0 },
          { name: 'Lansia (65+)', value: 0 },
        ],
        eduData: [
          { name: 'SD', value: 0 },
          { name: 'SMP', value: 0 },
          { name: 'SMA', value: 0 },
          { name: 'Diploma/Sarjana', value: 0 },
          { name: 'Lainnya', value: 0 },
        ],
        jobData: [
          { name: 'Petani', value: 0 },
          { name: 'Buruh', value: 0 },
          { name: 'Swasta', value: 0 },
          { name: 'Pelajar', value: 0 },
          { name: 'PNS/TNI', value: 0 },
          { name: 'Lainnya', value: 0 },
        ],
        rwData: [],
        rtData: [],
      };
    }

    const total = targetStats.total || 0;
    const totalKK = targetStats.totalKK || 0;
    const malePercent = targetStats.malePercent || 0;
    const femalePercent = targetStats.femalePercent || 0;
    const male = targetStats.male ?? Math.round((total * malePercent) / 100);
    const female = targetStats.female ?? (total - male);

    const ageData = targetStats.ageGroupData || targetStats.ageData || [
      { name: 'Anak (0-14)', value: 0 },
      { name: 'Produktif (15-64)', value: 0 },
      { name: 'Lansia (65+)', value: 0 },
    ];
    const eduData = targetStats.educationData || targetStats.eduData || [
      { name: 'SD', value: 0 },
      { name: 'SMP', value: 0 },
      { name: 'SMA', value: 0 },
      { name: 'Diploma/Sarjana', value: 0 },
      { name: 'Lainnya', value: 0 },
    ];
    const jobData = targetStats.occupationData || targetStats.jobData || [
      { name: 'Petani', value: 0 },
      { name: 'Buruh', value: 0 },
      { name: 'Swasta', value: 0 },
      { name: 'Pelajar', value: 0 },
      { name: 'PNS/TNI', value: 0 },
      { name: 'Lainnya', value: 0 },
    ];

    let dusunData = targetStats.dusunData;
    if (!Array.isArray(dusunData)) {
      if (statsDoc.dusunData && typeof statsDoc.dusunData === 'object') {
        dusunData = Object.keys(statsDoc.dusunData).map(k => ({
          name: k,
          value: statsDoc.dusunData[k]?.total || 0,
        }));
      } else {
        dusunData = [];
      }
    }

    return {
      total,
      totalKK,
      male,
      female,
      malePercent,
      femalePercent,
      ageData,
      ageGroupData: ageData,
      eduData,
      educationData: eduData,
      jobData,
      occupationData: jobData,
      dusunData,
      rwData: targetStats.rwData || [],
      rtData: targetStats.rtData || [],
      mutationData: statsDoc.mutationData || [
        { month: 'Jan', lahir: 12, mati: 5, datang: 8, pindah: 4 },
        { month: 'Feb', lahir: 15, mati: 3, datang: 10, pindah: 6 },
        { month: 'Mar', lahir: 10, mati: 7, datang: 12, pindah: 2 },
        { month: 'Apr', lahir: 18, mati: 4, datang: 6, pindah: 8 },
        { month: 'Mei', lahir: 14, mati: 2, datang: 15, pindah: 5 },
      ]
    };
  }, [statsDoc, filterDusun]);

  const handleDownloadExcel = () => {
    if (!stats) return;
    const ws = XLSX.utils.json_to_sheet(stats.rwData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statistik");
    XLSX.writeFile(wb, `Statistik_Gandrungmangu_${filterDusun}.xlsx`);
    toast({ title: "Berhasil Unduh", description: "Data statistik telah disimpan dalam format Excel." });
  };

  const handleDownloadPDF = async () => {
    if (!stats) return;
    setIsExporting(true);
    toast({
      title: "Memproses Cetak Laporan",
      description: "Menyiapkan dokumen PDF Laporan Kependudukan...",
    });

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("LAPORAN DEMOGRAFI & KEPENDUDUKAN", 14, 22);
      doc.setFontSize(11);
      doc.text(`Desa Gandrungmangu - Wilayah: ${filterDusun} (Tahun ${filterTahun})`, 14, 30);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

      autoTable(doc, {
        startY: 44,
        head: [['Indikator Kependudukan', 'Jumlah (Jiwa)', 'Keterangan']],
        body: [
          ['Total Penduduk', stats.total.toLocaleString('id-ID'), 'Total Terdaftar'],
          ['Total Kepala Keluarga (KK)', stats.totalKK.toLocaleString('id-ID'), 'Kartu Keluarga'],
          ['Laki-Laki', `${stats.male.toLocaleString('id-ID')} (${stats.malePercent}%)`, 'Laki-laki'],
          ['Perempuan', `${stats.female.toLocaleString('id-ID')} (${stats.femalePercent}%)`, 'Perempuan'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
      });

      if (stats.dusunData.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [['Nama Dusun', 'Jumlah Penduduk (Jiwa)']],
          body: stats.dusunData.map((d: any) => [d.name, d.value.toLocaleString('id-ID')]),
          theme: 'striped',
          headStyles: { fillColor: [30, 58, 138] },
        });
      }

      doc.save(`Laporan_Kependudukan_Desa_Gandrungmangu_${filterTahun}.pdf`);

      toast({
        title: "Berhasil Diunduh",
        description: "Laporan PDF telah tersimpan di perangkat Anda.",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengunduh PDF",
        description: "Terjadi kesalahan saat menggenerasi file PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (!stats) return;

    try {
      const summarySheet = XLSX.utils.json_to_sheet([
        { Indikator: 'Total Penduduk', Jumlah: stats.total, Keterangan: 'Jiwa' },
        { Indikator: 'Total KK', Jumlah: stats.totalKK, Keterangan: 'KK' },
        { Indikator: 'Laki-Laki', Jumlah: stats.male, Keterangan: `${stats.malePercent}%` },
        { Indikator: 'Perempuan', Jumlah: stats.female, Keterangan: `${stats.femalePercent}%` },
      ]);

      const dusunSheet = XLSX.utils.json_to_sheet(stats.dusunData.map((d: any) => ({ Dusun: d.name, Penduduk: d.value })));
      const ageSheet = XLSX.utils.json_to_sheet(stats.ageGroupData.map((d: any) => ({ 'Kelompok Usia': d.name, Jumlah: d.value })));
      const eduSheet = XLSX.utils.json_to_sheet(stats.educationData.map((d: any) => ({ Pendidikan: d.name, Jumlah: d.value })));
      const occSheet = XLSX.utils.json_to_sheet(stats.occupationData.map((d: any) => ({ Pekerjaan: d.name, Jumlah: d.value })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan");
      XLSX.utils.book_append_sheet(wb, dusunSheet, "Per Dusun");
      XLSX.utils.book_append_sheet(wb, ageSheet, "Kelompok Usia");
      XLSX.utils.book_append_sheet(wb, eduSheet, "Pendidikan");
      XLSX.utils.book_append_sheet(wb, occSheet, "Pekerjaan");

      XLSX.writeFile(wb, `Data_Kependudukan_Desa_Gandrungmangu_${filterTahun}.xlsx`);

      toast({
        title: "Excel Berhasil Diunduh",
        description: "File Excel spreadsheet kependudukan berhasil disimpan.",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengunduh Excel",
        description: "Terjadi kesalahan saat membuat file spreadsheet.",
        variant: "destructive",
      });
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-10">
          <Skeleton className="h-[400px] rounded-[3rem]" />
          <Skeleton className="h-[400px] rounded-[3rem]" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6 my-12">
        <BarChart3 className="h-16 w-16 text-blue-600 animate-pulse" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Statistik Belum Tersedia</h2>
        <p className="text-slate-500 leading-relaxed font-medium">
          Data grafik dan statistik demografi belum dibuat atau sedang diperbarui oleh administrator.
          Silakan hubungi admin atau perbarui database kependudukan di Dashboard Admin untuk memicu kalkulasi awal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12" ref={reportRef}>
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em]">
            <BarChart3 className="h-3 w-3" />
            Data Transparansi Publik
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight font-display italic">
            Statistik <span className="text-primary not-italic">Kependudukan</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Visualisasi data demografi desa secara real-time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Filter Wilayah</label>
            <Select value={filterDusun} onValueChange={setFilterDusun}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl border-slate-200">
                <MapPin className="h-4 w-4 mr-2 text-primary/40" />
                <SelectValue placeholder="Pilih Dusun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua Wilayah">Seluruh Desa</SelectItem>
                <SelectItem value="Dusun I">Dusun I</SelectItem>
                <SelectItem value="Dusun II">Dusun II</SelectItem>
                <SelectItem value="Dusun III">Dusun III</SelectItem>
                <SelectItem value="Dusun IV">Dusun IV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Periode</label>
            <Select value={filterTahun} onValueChange={setFilterTahun}>
              <SelectTrigger className="w-[120px] h-12 rounded-xl border-slate-200">
                <Calendar className="h-4 w-4 mr-2 text-primary/40" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleDownloadPDF} variant="outline" className="h-12 px-6 rounded-xl border-blue-600 text-blue-600 font-bold hover:bg-blue-50">
            <FileDown className="h-4 w-4 mr-2" />
            Cetak PDF
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Penduduk', value: stats?.total.toLocaleString('id-ID'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Keluarga (KK)', value: stats?.totalKK.toLocaleString('id-ID'), icon: Home, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Laki-Laki (%)', value: `${stats?.malePercent}%`, icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Perempuan (%)', value: `${stats?.femalePercent}%`, icon: UserPlus, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((card, i) => (
          <Card key={i} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={cn("p-4 rounded-3xl transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight mt-1">{card.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS GRID 1: DEMOGRAFI & USIA */}
      <div className="grid lg:grid-cols-2 gap-10">
        <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-10">
            <CardTitle className="text-xl font-black uppercase italic">Komposisi Gender</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rasio Laki-laki vs Perempuan</CardDescription>
          </CardHeader>
          <CardContent className="p-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Laki-Laki', value: stats?.male },
                    { name: 'Perempuan', value: stats?.female }
                  ]}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#1e3a8a" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-10">
            <CardTitle className="text-xl font-black uppercase italic">Distribusi Usia</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kelompok Usia Produktif & Non-Produktif</CardDescription>
          </CardHeader>
          <CardContent className="p-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.ageGroupData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS GRID 2: WILAYAH & PERTUMBUHAN */}
      <div className="grid lg:grid-cols-2 gap-10">
        <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-10">
            <CardTitle className="text-xl font-black uppercase italic">Sebaran per RW</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kepadatan Penduduk Tiap RW</CardDescription>
          </CardHeader>
          <CardContent className="p-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.rwData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a8a" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-10">
            <CardTitle className="text-xl font-black uppercase italic">Mutasi & Dinamika Penduduk</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Data Kumulatif 5 Bulan Terakhir</CardDescription>
          </CardHeader>
          <CardContent className="p-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.mutationData}>
                <CartesianGrid vertical={false} opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                <YAxis hide />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="lahir" stroke="#1e3a8a" strokeWidth={4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mati" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="datang" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pindah" stroke="#eab308" strokeWidth={4} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* FOOTER STATS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-10 bg-slate-900 rounded-[3rem] text-white">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Akurasi & Integritas</p>
          <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
            Sumber Data: Sistem Informasi Desa (SID) Gandrungmangu Digital. <br className="hidden sm:block" />
            Data diperbarui secara otomatis berdasarkan pendaftaran penduduk terbaru.
          </p>
        </div>
        <Button onClick={handleDownloadExcel} className="h-14 px-10 rounded-2xl bg-secondary text-primary font-black uppercase tracking-widest hover:bg-yellow-600 transition-all shadow-xl shadow-secondary/20">
          <Download className="h-5 w-5 mr-3" />
          Unduh Data (.XLSX)
        </Button>
      </div>
    </div>
  );
}
