'use client';

import React, { useState } from 'react';
import { useWedding, WizardInput } from '@/context/WeddingContext';
import { EventType, EventTheme } from '@/types/wedding';
import { formatCurrency } from '@/lib/weddingUtils';
import {
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { completeOnboarding } = useWedding();

  const [step, setStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('Menyiapkan ruang kerja...');

  // Form states
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [ownerName, setOwnerName] = useState<string>('Budi Santoso');
  const [partnerName, setPartnerName] = useState<string>('Siti Rahma');
  const [eventDate, setEventDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [totalBudget, setTotalBudget] = useState<number>(150000000);
  const [estimatedGuests, setEstimatedGuests] = useState<number>(300);
  const [theme, setTheme] = useState<EventTheme>('modern');

  const budgetPresets = [
    { label: 'Rp 50 Jt', value: 50000000 },
    { label: 'Rp 100 Jt', value: 100000000 },
    { label: 'Rp 150 Jt', value: 150000000 },
    { label: 'Rp 250 Jt', value: 250000000 },
    { label: 'Rp 500 Jt', value: 500000000 },
  ];

  const guestPresets = [50, 100, 200, 300, 500, 800];

  const themes: { id: EventTheme; label: string; desc: string }[] = [
    {
      id: 'modern',
      label: 'Modern Minimalis',
      desc: 'Garis desain elegan, estetika kontemporer, dan palet warna netral.',
    },
    {
      id: 'traditional',
      label: 'Adat Tradisional Formal',
      desc: 'Prosesi adat sakral, busana warisan budaya, dan tata krama tradisi.',
    },
    {
      id: 'outdoor',
      label: 'Garden / Outdoor Terbuka',
      desc: 'Konsep luar ruangan yang asri dan suasana pesta yang akrab.',
    },
    {
      id: 'indoor',
      label: 'Grand Hall / Ballroom Indoor',
      desc: 'Fasilitas gedung mewah berkapasitas besar dengan tata lampu panggung.',
    },
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      runProcessingAndFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const runProcessingAndFinish = () => {
    setIsProcessing(true);
    setProcessingStatus('Menyiapkan template tugas pernikahan...');

    setTimeout(() => {
      setProcessingStatus('Menghitung alokasi pagu pos anggaran...');
    }, 700);

    setTimeout(() => {
      setProcessingStatus('Menghubungkan linimasa jadwal (H - X hari) ke tanggal acara...');
    }, 1400);

    setTimeout(() => {
      setProcessingStatus('Membuka ruang kerja perencanaan...');
      const wizardData: WizardInput = {
        type: eventType,
        eventDate,
        totalBudget,
        estimatedGuests,
        theme,
        ownerName,
        partnerName,
      };

      setTimeout(() => {
        completeOnboarding(wizardData);
      }, 700);
    }, 2100);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center py-4 sm:py-12 px-3 sm:px-6">
      <div className="max-w-xl w-full glass-card rounded-xl overflow-hidden relative">
        {/* Processing State */}
        {isProcessing && (
          <div className="absolute inset-0 glass-strong z-50 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin mb-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-1">
              Menyiapkan Ruang Kerja
            </h3>
            <p className="text-xs font-mono text-stone-500 mb-4">{processingStatus}</p>
            <div className="w-48 bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-stone-900 animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Wizard Header */}
        <div className="glass-strong border-b p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
              Inisialisasi Proyek
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-stone-500 font-medium">
              Langkah {step} dari 5
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Ruang Perencanaan Acara
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tetapkan pagu anggaran awal, tanggal acuan, dan parameter acara.
          </p>

          {/* Stepper Bar */}
          <div className="grid grid-cols-5 gap-1.5 mt-3 sm:mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-stone-900' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* STEP 1: Scope & Principals */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-2 font-medium">
                  1. Jenis Acara
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEventType('wedding')}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all ${
                      eventType === 'wedding'
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900 shadow-2xs'
                        : 'glass-input hover:border-white'
                    }`}
                  >
                    <div className="font-semibold text-stone-900 text-sm">Resepsi Pernikahan Lengkap</div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Pelaksanaan multi-fase, linimasa H-360 hari, dan pos anggaran komprehensif.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEventType('engagement')}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all ${
                      eventType === 'engagement'
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900 shadow-2xs'
                        : 'glass-input hover:border-white'
                    }`}
                  >
                    <div className="font-semibold text-stone-900 text-sm">Acara Lamaran & Tunangan</div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Silaturahmi keluarga intim, linimasa H-90 hari, fokus pada pos utama.
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Penyelenggara Utama
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Pasangan / Co-Organizer
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Anchor Date */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-1 font-medium">
                  2. Tanggal Acuan Acara (Hari H)
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Tanggal ini menjadi dasar perhitungan otomatis seluruh jadwal tugas (H - X hari).
                </p>

                <div className="p-4 sm:p-5 glass-inset rounded-xl">
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Tanggal Pelaksanaan Acara:
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base font-mono glass-input rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none font-medium"
                    required
                  />
                  <div className="text-[11px] text-stone-500 mt-3 leading-relaxed">
                    Jika tanggal ini diubah di kemudian hari, seluruh tenggat tugas operasional akan otomatis diperbarui.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Planned Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-1 font-medium">
                  3. Pagu Batas Atas Anggaran Total
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Pagu modal awal yang direncanakan. Pos pengadaan akan dialokasikan otomatis.
                </p>

                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-stone-500">
                      IDR
                    </span>
                    <input
                      type="number"
                      step={5000000}
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-2.5 text-base sm:text-lg font-bold font-mono text-stone-900 glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                  <div className="text-xs font-mono font-medium text-stone-700">
                    Format: {formatCurrency(totalBudget)}
                  </div>

                  <div className="pt-2">
                    <span className="block text-[11px] font-mono uppercase text-stone-400 mb-1.5">
                      Pilihan Cepat:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {budgetPresets.map((b) => (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => setTotalBudget(b.value)}
                          className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                            totalBudget === b.value
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white/60 hover:bg-white/85 text-stone-700 border-white/60'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Headcount */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-1 font-medium">
                  4. Target Jumlah Tamu Undangan
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Perkiraan pax tamu untuk kapasitas gedung dan perhitungan porsi katering.
                </p>

                <div className="space-y-3">
                  <input
                    type="number"
                    value={estimatedGuests}
                    onChange={(e) => setEstimatedGuests(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-base sm:text-lg font-bold font-mono text-stone-900 glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />

                  <div>
                    <span className="block text-[11px] font-mono uppercase text-stone-400 mb-1.5">
                      Pilihan Cepat:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {guestPresets.map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setEstimatedGuests(count)}
                          className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                            estimatedGuests === count
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white/60 hover:bg-white/85 text-stone-700 border-white/60'
                          }`}
                        >
                          {count} pax
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Event Concept / Format */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-1 font-medium">
                  5. Format & Konsep Acara
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Pilih kerangka konsep acara untuk menentukan prioritas tugas dan alokasi.
                </p>

                <div className="space-y-2">
                  {themes.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id)}
                      className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        theme === th.id
                          ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900 shadow-2xs'
                          : 'glass-input hover:border-white'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-semibold text-stone-900 text-xs sm:text-sm">{th.label}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{th.desc}</div>
                      </div>
                      {theme === th.id && (
                        <Check className="w-4 h-4 text-stone-900 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/60 gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              <span>{step === 5 ? 'Buka Ruang Kerja Acara' : 'Lanjutkan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
