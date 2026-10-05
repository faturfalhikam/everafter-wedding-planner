'use client';

import React, { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import {
  Copy,
  Check,
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  Share2,
  Download,
  AlertCircle,
  ExternalLink,
  Users,
} from 'lucide-react';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose }) => {
  const {
    event,
    currentUser,
    partnerUser,
    invitePartner,
    switchActiveUserRole,
    isCloudConfigured,
    isSyncing,
    cloudShareCode,
    lastSyncedAt,
    syncError,
    loadPlanFromCloud,
    syncNow,
  } = useWedding();

  const [partnerNameInput, setPartnerNameInput] = useState<string>(
    partnerUser?.name || event?.partnerName || 'Siti Rahma'
  );
  const [partnerEmailInput, setPartnerEmailInput] = useState<string>(
    partnerUser?.email || 'siti@example.com'
  );
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load external plan input
  const [inputCode, setInputCode] = useState<string>('');
  const [loadStatus, setLoadStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  // Origin URL for share link
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://everafter.app';
  const shareIdentifier = cloudShareCode || event?.id || '';
  const inviteLink = `${currentOrigin}/?plan=${encodeURIComponent(shareIdentifier)}&role=editor`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareIdentifier);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  const handleSaveInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerNameInput.trim()) return;

    invitePartner(partnerNameInput.trim(), partnerEmailInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoadStatus(null);
    const res = await loadPlanFromCloud(inputCode.trim());
    if (res.success) {
      setLoadStatus({ message: res.message || 'Rencana berhasil dimuat!', isError: false });
      setInputCode('');
    } else {
      setLoadStatus({ message: res.message || 'Gagal memuat rencana.', isError: true });
    }
  };

  const handleTriggerSync = async () => {
    setIsManualSyncing(true);
    await syncNow();
    setIsManualSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-700" />
              Kolaborasi & Sinkronisasi Cloud
            </h3>
            <p className="text-xs text-stone-500">Kelola bersama persiapan acara dengan pasangan</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud Status Banner */}
        <div className="mt-4">
          {isCloudConfigured ? (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Cloud className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                    Cloud Supabase Terhubung
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </p>
                  <p className="text-[11px] text-emerald-700 truncate">
                    {isSyncing
                      ? 'Sedang menyinkronkan data...'
                      : lastSyncedAt
                      ? `Tersinkron ${lastSyncedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      : 'Otomatis tersimpan online'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing || isManualSyncing}
                className="px-2.5 py-1.5 text-xs font-medium bg-white text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100/60 transition-colors shrink-0 flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isSyncing || isManualSyncing ? 'animate-spin' : ''}`}
                />
                <span>Sync</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <CloudOff className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-950">
                    Mode Penyimpanan Lokal (Browser)
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Data saat ini tersimpan di browser Anda. Hubungkan ke Supabase gratis agar bisa berbagi link secara online dengan pasangan dan update real-time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSetupGuide(!showSetupGuide)}
                    className="mt-2 text-xs font-semibold text-amber-900 underline hover:text-amber-950 inline-flex items-center gap-1"
                  >
                    <span>{showSetupGuide ? 'Tutup Panduan' : 'Lihat Cara Setup Supabase'}</span>
                  </button>
                </div>
              </div>

              {showSetupGuide && (
                <div className="mt-3 pt-3 border-t border-amber-200/80 text-[11px] text-stone-700 space-y-1.5">
                  <p className="font-semibold text-stone-900">Langkah Cepat Setup:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-stone-600">
                    <li>Buka <b>supabase.com</b> dan buat proyek gratis baru.</li>
                    <li>Buka menu <b>SQL Editor</b>, tempel skrip dari file <code className="bg-white px-1 py-0.5 rounded border border-amber-200">supabase/schema.sql</code>, lalu klik Run.</li>
                    <li>Buka menu <b>Project Settings → API</b>, salin <b>Project URL</b> dan <b>Anon Key</b>.</li>
                    <li>Masukkan ke file <code className="bg-white px-1 py-0.5 rounded border border-amber-200">.env.local</code> di folder proyek ini.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {syncError && (
            <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{syncError}</span>
            </div>
          )}
        </div>

        {/* Share Section (If Cloud Configured) */}
        {isCloudConfigured && (
          <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-stone-600" /> Bagikan Akses Pasangan
              </span>
              <span className="text-[10px] font-mono bg-stone-200 text-stone-800 px-2 py-0.5 rounded font-semibold">
                Kode: {cloudShareCode || event?.id}
              </span>
            </div>

            {/* Quick Share Code */}
            <div>
              <label className="block text-[11px] text-stone-500 mb-1">
                Kode Akses Singkat (bisa dikirim via WhatsApp/Chat):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={cloudShareCode || event?.id || ''}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 font-mono font-bold tracking-wider select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1"
                >
                  {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedCode ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Direct URL */}
            <div>
              <label className="block text-[11px] text-stone-500 mb-1 font-mono">
                Tautan Langsung (Pasangan tinggal klik untuk langsung masuk):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-stone-200 rounded-lg text-stone-600 select-all font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1"
                >
                  {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedLink ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles overview & Switcher */}
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-semibold text-stone-800 uppercase font-mono tracking-wider">
            Peran Aktif di Perangkat Ini
          </div>
          {/* Primary Owner */}
          <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-stone-900 truncate">
                  {event?.ownerName || 'Penyelenggara'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                  Utama (Owner)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Otoritas penuh administrasi & proyek</p>
            </div>

            <button
              type="button"
              onClick={() => switchActiveUserRole('owner')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
                currentUser.role === 'owner'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {currentUser.role === 'owner' ? 'Aktif' : 'Pilih'}
            </button>
          </div>

          {/* Partner / Editor */}
          <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-stone-900 truncate">
                  {partnerUser?.name || event?.partnerName || 'Pasangan'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                  Pasangan (Editor)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Akses penuh ke anggaran, tugas, & vendor</p>
            </div>

            <button
              type="button"
              onClick={() => switchActiveUserRole('editor')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
                currentUser.role === 'editor'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {currentUser.role === 'editor' ? 'Aktif' : 'Pilih'}
            </button>
          </div>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleSaveInvite} className="mt-4 space-y-2.5 pt-3 border-t border-stone-100">
          <div className="text-[11px] font-semibold text-stone-800 uppercase font-mono tracking-wider">
            Identitas Profil Pasangan
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Nama Pasangan</label>
              <input
                type="text"
                value={partnerNameInput}
                onChange={(e) => setPartnerNameInput(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Email Pasangan</label>
              <input
                type="email"
                value={partnerEmailInput}
                onChange={(e) => setPartnerEmailInput(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-1 gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Profil berhasil diperbarui
              </span>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto sm:ml-auto px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors text-center"
            >
              Perbarui Data
            </button>
          </div>
        </form>

        {/* Load Plan by Code Section */}
        {isCloudConfigured && (
          <form onSubmit={handleLoadPlan} className="mt-4 pt-3 border-t border-stone-100">
            <label className="block text-[11px] font-semibold text-stone-800 uppercase font-mono tracking-wider mb-1">
              Buka / Sinkronkan Rencana Lain via Kode
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Jika pasangan Anda sudah membuat rencana di perangkatnya, masukkan kode akses rencana di sini:
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Contoh: WED-8AK2"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-800 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isSyncing || !inputCode.trim()}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Buka</span>
              </button>
            </div>

            {loadStatus && (
              <p
                className={`text-xs mt-1.5 flex items-center gap-1 ${
                  loadStatus.isError ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {loadStatus.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{loadStatus.message}</span>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
