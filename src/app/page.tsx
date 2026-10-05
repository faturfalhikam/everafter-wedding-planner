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
import { Loader2 } from 'lucide-react';

function WeddingAppContent() {
  const { isOnboarded, isLoading } = useWedding();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'budget' | 'vendors' | 'guests'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCollabOpen, setIsCollabOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <Loader2 className="w-6 h-6 text-stone-700 animate-spin mb-3" />
        <p className="text-xs font-mono text-stone-500 text-center">Memuat buku kas perencanaan...</p>
      </div>
    );
  }

  // If not onboarded yet, show setup wizard
  if (!isOnboarded) {
    return <OnboardingWizard />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
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

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
              EverAfter
            </span>
            <span className="text-stone-300">•</span>
            <span>Aplikasi Perencanaan Finansial & Acara Pernikahan</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 font-mono text-[11px] text-stone-400">
            <span>Pencatatan Lokal Terekonsiliasi</span>
            <span className="hidden sm:inline">•</span>
            <span>Seluruh angka diaudit otomatis</span>
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
