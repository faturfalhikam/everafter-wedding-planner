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
  Cloud,
  CloudOff,
  RefreshCw,
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Brand & Event Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-baseline gap-1.5 sm:gap-2 shrink-0">
                <span className="font-semibold text-stone-900 tracking-tight text-xs sm:text-sm uppercase">
                  EverAfter
                </span>
                <span className="text-[11px] font-mono text-stone-300">/</span>
              </div>
              <span className="text-xs font-medium text-stone-600 truncate max-w-[130px] sm:max-w-xs md:max-w-sm">
                {event?.title || 'Perencanaan Pernikahan'}
              </span>

              {daysInfo && (
                <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                  <Calendar className="w-3 h-3 text-stone-500" />
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
              {/* Active Workspace / Partner Switcher */}
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => switchActiveUserRole('owner')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors ${
                    currentUser.role === 'owner'
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Ruang kerja aktif: Penyelenggara Utama"
                >
                  <span className="hidden sm:inline">{ownerFirstName}</span>
                  <span className="sm:hidden">{ownerFirstName.slice(0, 4)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchActiveUserRole('editor')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors ${
                    currentUser.role === 'editor'
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Ruang kerja aktif: Pasangan"
                >
                  <span className="hidden sm:inline">{partnerFirstName}</span>
                  <span className="sm:hidden">{partnerFirstName.slice(0, 4)}</span>
                </button>
              </div>

              {/* Cloud Sync & Collaboration trigger */}
              <button
                type="button"
                onClick={onOpenCollaboration}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isCloudConfigured
                    ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
                title={isCloudConfigured ? 'Cloud Sync Aktif - Klik untuk berbagi' : 'Mode Lokal - Klik untuk setup cloud'}
                aria-label="Kolaborasi & Status Cloud"
              >
                {isCloudConfigured ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline text-[11px] font-medium font-mono">
                      {isSyncing ? 'Syncing...' : 'Online'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span className="hidden sm:inline text-[11px] font-mono text-stone-600">Lokal</span>
                  </>
                )}
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Pengaturan Proyek & Tanggal"
                aria-label="Pengaturan"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex space-x-2 border-t border-stone-100 py-1.5 text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Ringkasan Eksekutif
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'budget'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Buku Anggaran & Kas
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'checklist'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Checklist Waktu (H-X)
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'vendors'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Vendor & Termin
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'guests'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Daftar Tamu & RSVP
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-stone-900 font-semibold' : 'text-stone-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Ringkasan</span>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'budget' ? 'text-stone-900 font-semibold' : 'text-stone-400'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Anggaran</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'checklist' ? 'text-stone-900 font-semibold' : 'text-stone-400'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span>Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'vendors' ? 'text-stone-900 font-semibold' : 'text-stone-400'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span>Vendor</span>
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'guests' ? 'text-stone-900 font-semibold' : 'text-stone-400'
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
