'use client';

import React from 'react';
import { useWedding } from '@/context/WeddingContext';
import { getDaysRemaining } from '@/lib/weddingUtils';
import {
  Calendar,
  Share2,
  SlidersHorizontal,
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Store,
  Users,
  Heart,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'checklist' | 'budget' | 'vendors' | 'guests';
  setActiveTab: (tab: 'dashboard' | 'checklist' | 'budget' | 'vendors' | 'guests') => void;
  onOpenSettings: () => void;
  onOpenCollaboration: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenCollaboration,
}) => {
  const {
    event,
    currentUser,
    partnerUser,
    switchActiveUserRole,
    isCloudConfigured,
    isSyncing,
  } = useWedding();
  const daysInfo = event?.eventDate ? getDaysRemaining(event.eventDate) : null;

  const ownerFirstName = event?.ownerName?.trim().split(' ')[0] || 'Penyelenggara';
  const partnerFirstName =
    partnerUser?.name?.trim().split(' ')[0] ||
    event?.partnerName?.trim().split(' ')[0] ||
    'Pasangan';

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Brand & Event Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="p-1 rounded-md bg-pink-100 text-pink-600">
                  <Heart className="w-3.5 h-3.5 fill-pink-500" />
                </span>
                <span className="font-bold text-emerald-950 tracking-tight text-xs sm:text-sm uppercase">
                  EverAfter
                </span>
                <span className="text-[11px] font-mono text-emerald-900/20">/</span>
              </div>
              <span className="text-xs font-medium text-emerald-950/80 truncate max-w-[130px] sm:max-w-xs md:max-w-sm">
                {event?.title || 'Perencanaan Pernikahan'}
              </span>

              {daysInfo && (
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium glass-inset text-emerald-800 shrink-0">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  <span>
                    {daysInfo.days === 0
                      ? 'Hari H'
                      : daysInfo.isPast
                      ? `H+${daysInfo.days}`
                      : `H-${daysInfo.days} hari`}
                  </span>
                </div>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Active Workspace / Partner Switcher: Green (Owner) & Pink (Partner) */}
              <div className="flex items-center glass-inset p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => switchActiveUserRole('owner')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
                    currentUser.role === 'owner'
                      ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                      : 'text-emerald-900/70 hover:text-emerald-950 hover:bg-emerald-100/50'
                  }`}
                  title="Ruang kerja aktif: Penyelenggara Utama (Hijau)"
                >
                  <span className="hidden sm:inline">{ownerFirstName}</span>
                  <span className="sm:hidden">{ownerFirstName.slice(0, 4)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchActiveUserRole('editor')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
                    currentUser.role === 'editor'
                      ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                      : 'text-rose-900/70 hover:text-rose-950 hover:bg-pink-100/50'
                  }`}
                  title="Ruang kerja aktif: Pasangan (Pink)"
                >
                  <span className="hidden sm:inline">{partnerFirstName}</span>
                  <span className="sm:hidden">{partnerFirstName.slice(0, 4)}</span>
                </button>
              </div>

              {/* Cloud Sync & Collaboration trigger */}
              <button
                type="button"
                onClick={onOpenCollaboration}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isCloudConfigured
                    ? 'glass-inset text-emerald-900 hover:bg-emerald-100/70'
                    : 'glass-inset hover:bg-pink-100/60 text-pink-900'
                }`}
                title={isCloudConfigured ? 'Cloud Sync Aktif - Klik untuk berbagi' : 'Mode Lokal - Klik untuk setup cloud'}
                aria-label="Kolaborasi & Status Cloud"
              >
                {isCloudConfigured ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span className="hidden sm:inline text-[11px] font-medium font-mono">
                      {isSyncing ? 'Syncing...' : 'Online'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-pink-400"></span>
                    <span className="hidden sm:inline text-[11px] font-mono text-pink-700">Lokal</span>
                  </>
                )}
                <Share2 className="w-3.5 h-3.5 text-emerald-800" />
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-lg text-emerald-900/70 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
                title="Pengaturan Proyek & Tanggal"
                aria-label="Pengaturan"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs: Green & Pink styling */}
          <nav className="hidden md:flex space-x-2 border-t border-emerald-900/10 py-1.5 text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-emerald-50/80'
              }`}
            >
              Ringkasan Eksekutif
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'budget'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-pink-50/80'
              }`}
            >
              Buku Anggaran & Kas
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'checklist'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-emerald-50/80'
              }`}
            >
              Checklist Waktu (H-X)
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'vendors'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-pink-50/80'
              }`}
            >
              Vendor & Termin
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'guests'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-emerald-50/80'
              }`}
            >
              Daftar Tamu & RSVP
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t px-2 py-1.5">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-stone-400 hover:text-emerald-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Ringkasan</span>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'budget' ? 'text-rose-600 font-bold' : 'text-stone-400 hover:text-rose-600'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Anggaran</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'checklist' ? 'text-emerald-800 font-bold' : 'text-stone-400 hover:text-emerald-700'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span>Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'vendors' ? 'text-rose-600 font-bold' : 'text-stone-400 hover:text-rose-600'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span>Vendor</span>
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'guests' ? 'text-emerald-800 font-bold' : 'text-stone-400 hover:text-emerald-700'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Tamu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
