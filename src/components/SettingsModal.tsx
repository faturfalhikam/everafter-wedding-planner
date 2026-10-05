'use client';

import React, { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { EventTheme } from '@/types/wedding';
import { formatCurrency } from '@/lib/weddingUtils';
import { Calendar, AlertCircle, X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { event, updateEventDetails, resetAllData } = useWedding();

  const [title, setTitle] = useState<string>(event?.title || '');
  const [eventDate, setEventDate] = useState<string>(event?.eventDate || '');
  const [totalBudget, setTotalBudget] = useState<number>(event?.totalBudget || 150000000);
  const [estimatedGuests, setEstimatedGuests] = useState<number>(event?.estimatedGuests || 300);
  const [theme, setTheme] = useState<EventTheme>(event?.theme || 'modern');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!isOpen || !event) return null;

  const dateChanged = eventDate !== event.eventDate;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventDetails({
      title: title.trim(),
      eventDate,
      totalBudget,
      estimatedGuests,
      theme,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    resetAllData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">Pengaturan Proyek</h3>
            <p className="text-xs text-stone-500">Parameter, tanggal acuan, dan pagu anggaran</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
            aria-label="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Judul Acara / Proyek
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none"
              required
            />
          </div>

          {/* Event Anchor Date */}
          <div className="bg-stone-50 p-3 sm:p-3.5 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-stone-900 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-stone-700" />
              <span>Tanggal Acuan Acara (Hari H)</span>
            </div>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-xs font-mono font-medium text-stone-900 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none bg-white"
              required
            />
            {dateChanged && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  Catatan: Mengubah tanggal acuan akan otomatis menggeser tenggat waktu seluruh tugas (H - X).
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Pagu Anggaran Total (Rp)
              </label>
              <input
                type="number"
                step={1000000}
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm sm:text-xs font-mono border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none"
                required
              />
              <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                {formatCurrency(totalBudget)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Target Tamu (Pax)
              </label>
              <input
                type="number"
                value={estimatedGuests}
                onChange={(e) => setEstimatedGuests(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm sm:text-xs font-mono border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Konsep & Tema Acara</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as EventTheme)}
              className="w-full px-3 py-2 text-sm sm:text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none bg-white font-medium"
            >
              <option value="modern">Modern Minimalis</option>
              <option value="traditional">Adat Tradisional Formal</option>
              <option value="outdoor">Garden / Outdoor Terbuka</option>
              <option value="indoor">Grand Hall / Ballroom Indoor</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-3 border-t border-stone-100 gap-2">
            {saveSuccess ? (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Pengaturan tersimpan
              </span>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-stone-600 rounded-lg hover:bg-stone-100 text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-stone-900">Mulai Ulang Proyek</div>
              <div className="text-[11px] text-stone-500">Hapus cache lokal dan kembali ke panduan awal</div>
            </div>
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100 rounded-lg font-medium self-start sm:self-auto"
              >
                Reset Data
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs bg-rose-700 text-white rounded-lg font-semibold"
                >
                  Konfirmasi Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 rounded-lg"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
