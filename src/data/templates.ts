import { WeddingTemplate } from '@/types/wedding';

export const WEDDING_TEMPLATE: WeddingTemplate = {
  id: 'template-wedding',
  type: 'wedding',
  title: 'Pernikahan Lengkap (Standard Full Wedding)',
  defaultBudgetAllocations: [
    { categoryName: 'Venue & Katering', percentage: 40, color: '#3b82f6' }, // Blue
    { categoryName: 'Dekorasi & Tata Panggung', percentage: 15, color: '#ec4899' }, // Pink
    { categoryName: 'Dokumentasi (Foto & Video)', percentage: 10, color: '#8b5cf6' }, // Purple
    { categoryName: 'Busana, MUA & Aksesoris', percentage: 12, color: '#f59e0b' }, // Amber
    { categoryName: 'Entertainment & Soundsystem', percentage: 8, color: '#10b981' }, // Emerald
    { categoryName: 'Undangan, Souvenir & Seserahan', percentage: 5, color: '#06b6d4' }, // Cyan
    { categoryName: 'Dana Darurat / Lain-lain', percentage: 10, color: '#64748b' }, // Slate
  ],
  defaultTasks: [
    { title: 'Tentukan tanggal pernikahan & bicarakan dengan kedua keluarga', category: 'Perencanaan Inti', relativeDaysBeforeEvent: 360, priority: 'high' },
    { title: 'Susun estimasi budget awal & pembagian pos pengeluaran', category: 'Keuangan', relativeDaysBeforeEvent: 330, priority: 'high' },
    { title: 'Riset & survei lokasi gedung/venue akad dan resepsi', category: 'Venue & Katering', relativeDaysBeforeEvent: 300, priority: 'high' },
    { title: 'Booking DP venue / gedung pernikahan', category: 'Venue & Katering', relativeDaysBeforeEvent: 270, priority: 'high' },
    { title: 'Pilih & food tasting vendor katering', category: 'Venue & Katering', relativeDaysBeforeEvent: 240, priority: 'high' },
    { title: 'Booking vendor dekorasi & diskusikan konsep pelaminan', category: 'Dekorasi & Tata Panggung', relativeDaysBeforeEvent: 210, priority: 'medium' },
    { title: 'Pilih & booking vendor foto & video dokumentasi', category: 'Dokumentasi (Foto & Video)', relativeDaysBeforeEvent: 180, priority: 'medium' },
    { title: 'Sesi foto prewedding', category: 'Dokumentasi (Foto & Video)', relativeDaysBeforeEvent: 150, priority: 'medium' },
    { title: 'Fitting pertama busana pengantin & orang tua / keluarga', category: 'Busana, MUA & Aksesoris', relativeDaysBeforeEvent: 120, priority: 'medium' },
    { title: 'Booking vendor MUA (Make Up Artist) & hair/hijab stylist', category: 'Busana, MUA & Aksesoris', relativeDaysBeforeEvent: 120, priority: 'high' },
    { title: 'Booking Wedding Organizer (WO) atau tim panitia keluarga', category: 'Perencanaan Inti', relativeDaysBeforeEvent: 90, priority: 'high' },
    { title: 'Booking band musik akustik / MC pernikahan', category: 'Entertainment & Soundsystem', relativeDaysBeforeEvent: 90, priority: 'low' },
    { title: 'Finalisasi daftar tamu undangan (Guest List)', category: 'Tamu & Undangan', relativeDaysBeforeEvent: 75, priority: 'high' },
    { title: 'Desain & cetak/sebar undangan digital & souvenir', category: 'Undangan, Souvenir & Seserahan', relativeDaysBeforeEvent: 60, priority: 'medium' },
    { title: 'Urus berkas administrasi nikah di KUA / Catatan Sipil', category: 'Administrasi & Legal', relativeDaysBeforeEvent: 45, priority: 'high' },
    { title: 'Beli / siapkan cincin kawin dan kotak seserahan', category: 'Undangan, Souvenir & Seserahan', relativeDaysBeforeEvent: 30, priority: 'medium' },
    { title: 'Fitting busana pengantin terakhir (final fitting)', category: 'Busana, MUA & Aksesoris', relativeDaysBeforeEvent: 21, priority: 'medium' },
    { title: 'Technical meeting & gladi resik dengan seluruh vendor dan WO', category: 'Perencanaan Inti', relativeDaysBeforeEvent: 14, priority: 'high' },
    { title: 'Konfirmasi final jumlah pax katering berdasarkan RSVP tamu', category: 'Venue & Katering', relativeDaysBeforeEvent: 7, priority: 'high' },
    { title: 'Pelunasan sisa tagihan seluruh vendor', category: 'Keuangan', relativeDaysBeforeEvent: 3, priority: 'high' },
    { title: 'Hari H: Akad Nikah / Pemberkatan & Resepsi Pernikahan', category: 'Hari H', relativeDaysBeforeEvent: 0, priority: 'high' },
  ],
};

export const ENGAGEMENT_TEMPLATE: WeddingTemplate = {
  id: 'template-engagement',
  type: 'engagement',
  title: 'Acara Lamaran (Engagement Day)',
  defaultBudgetAllocations: [
    { categoryName: 'Venue & Katering Keluarga', percentage: 45, color: '#3b82f6' },
    { categoryName: 'Dekorasi Backdrop Lamaran', percentage: 20, color: '#ec4899' },
    { categoryName: 'Dokumentasi Foto', percentage: 10, color: '#8b5cf6' },
    { categoryName: 'Busana & MUA Lamaran', percentage: 12, color: '#f59e0b' },
    { categoryName: 'Seserahan & Cincin Tunangan', percentage: 8, color: '#06b6d4' },
    { categoryName: 'Lain-lain / Sound / MC', percentage: 5, color: '#64748b' },
  ],
  defaultTasks: [
    { title: 'Pertemuan silaturahmi kedua orang tua & sepakati tanggal lamaran', category: 'Perencanaan', relativeDaysBeforeEvent: 90, priority: 'high' },
    { title: 'Tentukan venue (rumah wanita / resto / function room)', category: 'Venue & Katering', relativeDaysBeforeEvent: 75, priority: 'high' },
    { title: 'Booking vendor backdrop dekorasi lamaran', category: 'Dekorasi Backdrop Lamaran', relativeDaysBeforeEvent: 60, priority: 'medium' },
    { title: 'Pilih busana lamaran (kebaya/batik seragam keluarga)', category: 'Busana & MUA Lamaran', relativeDaysBeforeEvent: 45, priority: 'medium' },
    { title: 'Booking fotografer dokumentasi', category: 'Dokumentasi Foto', relativeDaysBeforeEvent: 30, priority: 'low' },
    { title: 'Beli cincin tunangan & hias kotak seserahan hantaran', category: 'Seserahan & Cincin Tunangan', relativeDaysBeforeEvent: 21, priority: 'high' },
    { title: 'Finalisasi susunan acara (rundown) & juru bicara keluarga', category: 'Perencanaan', relativeDaysBeforeEvent: 10, priority: 'high' },
    { title: 'Konfirmasi porsi katering / prasmanan', category: 'Venue & Katering', relativeDaysBeforeEvent: 5, priority: 'high' },
    { title: 'Hari H: Prosesi Lamaran & Pertunangan', category: 'Hari H', relativeDaysBeforeEvent: 0, priority: 'high' },
  ],
};
