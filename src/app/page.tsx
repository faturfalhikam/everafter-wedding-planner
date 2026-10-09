'use client';

import React, { useState } from 'react';
import { WeddingProvider, useWedding } from '@/context/WeddingContext';
import { Navbar } from '@/components/Navbar';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { DashboardView } from '@/components/DashboardView';
import { ChecklistView } from '@/components/ChecklistView';
import { BudgetIntelligenceView } from '@/components/BudgetIntelligenceView';
import { VendorView } from '@/components/VendorView';
import { GuestListView } from '@/components/GuestListView';
import { CollaborationModal } from '@/components/CollaborationModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Loader2, Heart } from 'lucide-react';

/* Mesh gradien pastel (sage / dusty pink / champagne) — sumber efek kaca */
function GradientMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#faf7f7]" aria-hidden="true">
      <div className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-[#d3e4dc] opacity-70 blur-3xl" />
      <div className="absolute top-10 -right-40 h-[34rem] w-[34rem] rounded-full bg-[#fbdce8] opacity-65 blur-3xl" />
      <div className="absolute -bottom-48 left-1/4 h-[36rem] w-[36rem] rounded-full bg-[#f3ece2] opacity-70 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[#e6f0e9] opacity-60 blur-3xl" />
    </div>
  );
}

function WeddingAppContent() {
  const { isOnboarded, isLoading } = useWedding();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'budget' | 'vendors' | 'guests'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCollabOpen, setIsCollabOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <GradientMesh />
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
          <Loader2 className="w-7 h-7 text-emerald-800 animate-spin mb-3" />
          <p className="text-xs font-mono text-emerald-900/70 text-center">Memuat buku kas perencanaan...</p>
        </div>
      </div>
    );
  }

  // If not onboarded yet, show setup wizard
  if (!isOnboarded) {
    return (
      <div className="min-h-screen">
        <GradientMesh />
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-100 selection:text-emerald-950">
      <GradientMesh />
      {/* Top Navigation & Mobile Bottom Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCollaboration={() => setIsCollabOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-8">
        {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
        {activeTab === 'budget' && <BudgetIntelligenceView />}
        {activeTab === 'checklist' && <ChecklistView />}
        {activeTab === 'vendors' && <VendorView />}
        {activeTab === 'guests' && <GuestListView />}
      </main>

      {/* Global Modals */}
      <CollaborationModal isOpen={isCollabOpen} onClose={() => setIsCollabOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Editorial Romantic Green & Pink Footer */}
      <footer className="mt-auto glass-nav border-t py-4 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-emerald-900 tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              EverAfter
            </span>
            <span className="text-pink-300">•</span>
            <span className="text-emerald-900/80">Perencanaan Finansial & Acara Pernikahan</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 font-mono text-[11px] text-emerald-900/60">
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500 inline" /> Tema Sage Green & Dusty Pink
            </span>
            <span className="hidden sm:inline text-pink-300">•</span>
            <span>Sinkronisasi Otomatis Terintegrasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <WeddingProvider>
      <WeddingAppContent />
    </WeddingProvider>
  );
}
