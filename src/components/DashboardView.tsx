'use client';

import React from 'react';
import { useWedding } from '@/context/WeddingContext';
import {
  formatCurrency,
  formatCompactCurrency,
  formatDateIndo,
  getDaysRemaining,
} from '@/lib/weddingUtils';
import {
  Circle,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: 'dashboard' | 'checklist' | 'budget' | 'vendors' | 'guests') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    event,
    financials,
    tasksSummary,
    guestsSummary,
    toggleTask,
    vendors,
  } = useWedding();

  if (!event) return null;

  const daysInfo = getDaysRemaining(event.eventDate);
  const variance = financials.overallVariance;

  // Actual total = Paid + Committed
  const totalActual = financials.totalPaid + financials.totalCommitted;
  const remaining = financials.totalAvailable;

  const paidRatio = financials.totalBudget > 0 ? (financials.totalPaid / financials.totalBudget) * 100 : 0;
  const committedRatio =
    financials.totalBudget > 0 ? (financials.totalCommitted / financials.totalBudget) * 100 : 0;
  const actualRatio = paidRatio + committedRatio;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Executive Meta Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
              Spesifikasi Acara
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-stone-600 capitalize">
              {event.type === 'wedding' ? 'Pernikahan' : 'Lamaran'} — {event.theme}
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-semibold text-stone-900 tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>Tanggal: <strong className="font-medium text-stone-800">{formatDateIndo(event.eventDate)}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>Target Tamu: <strong className="font-medium text-stone-800">{event.estimatedGuests} Pax</strong></span>
          </p>
        </div>

        {/* Time Remaining & Task Progress Metric Box */}
        <div className="grid grid-cols-2 divide-x divide-stone-200 bg-stone-50/80 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-stone-200/80 shrink-0 w-full md:w-auto">
          <div className="text-left pr-3 sm:pr-4">
            <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500">
              Hitung Mundur
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 tracking-tight mt-0.5">
              {daysInfo.days === 0 ? 'Hari H' : daysInfo.isPast ? `+${daysInfo.days}` : daysInfo.days}
              {daysInfo.days !== 0 && <span className="text-xs font-normal text-stone-500 ml-1">hari</span>}
            </div>
          </div>

          <div className="pl-3 sm:pl-6 text-left">
            <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500">
              Progres Tugas
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 tracking-tight mt-0.5">
              {tasksSummary.percentComplete}%
              <span className="text-xs font-normal text-stone-500 ml-1">
                ({tasksSummary.completed}/{tasksSummary.total})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FIRST-CLASS BUDGET & CASHFLOW LEDGER SUMMARY */}
      <section className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-stone-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-900">
                Kesehatan Finansial & Arus Kas
              </h2>
              {/* Variance Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${variance.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${variance.dotColor}`} />
                <span>{variance.label}</span>
                <span className="font-mono tabular-nums font-semibold">
                  ({variance.variancePercentage > 0 ? '+' : ''}
                  {variance.variancePercentage.toFixed(1)}%)
                </span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              Rekonsiliasi pagu anggaran yang direncanakan, pengeluaran aktual, dan komitmen kontrak vendor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('budget')}
            className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-900 self-start sm:self-auto"
          >
            <span>Buka Buku Anggaran</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dense Financial Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-1">
          <div className="p-3 bg-stone-50/50 rounded-lg sm:bg-transparent sm:p-0">
            <div className="text-[11px] sm:text-xs font-medium text-stone-500">Pagu Anggaran</div>
            <div className="text-sm sm:text-xl font-bold font-mono text-stone-900 tabular-nums mt-0.5 truncate" title={formatCurrency(financials.totalBudget)}>
              {formatCurrency(financials.totalBudget)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">Batas pagu disetujui</div>
          </div>

          <div className="p-3 bg-stone-50/50 rounded-lg sm:bg-transparent sm:p-0">
            <div className="text-[11px] sm:text-xs font-medium text-stone-500">Total Realisasi</div>
            <div className="text-sm sm:text-xl font-bold font-mono text-stone-900 tabular-nums mt-0.5 truncate" title={formatCurrency(totalActual)}>
              {formatCurrency(totalActual)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>Bayar: {formatCompactCurrency(financials.totalPaid)}</span>
              <span>•</span>
              <span>Sisa: {formatCompactCurrency(financials.totalCommitted)}</span>
            </div>
          </div>

          <div className="p-3 bg-stone-50/50 rounded-lg sm:bg-transparent sm:p-0">
            <div className="text-[11px] sm:text-xs font-medium text-stone-500">Sisa Anggaran</div>
            <div
              className={`text-sm sm:text-xl font-bold font-mono tabular-nums mt-0.5 truncate ${
                remaining < 0 ? 'text-rose-700' : 'text-stone-900'
              }`}
              title={formatCurrency(remaining)}
            >
              {formatCurrency(remaining)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
              {remaining < 0 ? 'Peringatan defisit' : 'Dana cadangan aman'}
            </div>
          </div>

          <div className="p-3 bg-stone-50/50 rounded-lg sm:bg-transparent sm:p-0">
            <div className="text-[11px] sm:text-xs font-medium text-stone-500">Varians Anggaran</div>
            <div
              className={`text-sm sm:text-xl font-bold font-mono tabular-nums mt-0.5 truncate ${
                variance.classification === 'over'
                  ? 'text-rose-700'
                  : variance.classification === 'under'
                  ? 'text-emerald-700'
                  : 'text-stone-700'
              }`}
              title={`${variance.varianceAmount > 0 ? '+' : ''}${formatCurrency(variance.varianceAmount)}`}
            >
              {variance.varianceAmount > 0 ? '+' : ''}
              {formatCurrency(variance.varianceAmount)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
              {variance.variancePercentage > 0 ? '+' : ''}
              {variance.variancePercentage.toFixed(1)}% vs pagu
            </div>
          </div>
        </div>

        {/* Linear Multi-Segment Health Progress Meter */}
        <div className="space-y-1.5 pt-1 sm:pt-2">
          <div className="flex justify-between text-xs text-stone-500 font-mono">
            <span>Realisasi: {actualRatio.toFixed(1)}%</span>
            <span>
              {remaining >= 0
                ? `${((remaining / (financials.totalBudget || 1)) * 100).toFixed(1)}% Tersedia`
                : 'Defisit'}
            </span>
          </div>

          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex border border-stone-200">
            {/* Paid Segment */}
            <div
              className="bg-stone-800 transition-all duration-300"
              style={{ width: `${Math.min(100, paidRatio)}%` }}
              title={`Sudah Dibayar: ${formatCurrency(financials.totalPaid)}`}
            />
            {/* Committed Segment */}
            <div
              className="bg-stone-400 transition-all duration-300"
              style={{ width: `${Math.min(100 - paidRatio, committedRatio)}%` }}
              title={`Komitmen Kontrak: ${formatCurrency(financials.totalCommitted)}`}
            />
          </div>

          {/* Inline Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-stone-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-stone-800" />
              <span>Sudah Dibayar ({paidRatio.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-stone-400" />
              <span>Komitmen ({committedRatio.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-stone-100 border border-stone-300" />
              <span>Tersedia ({Math.max(0, (100 - actualRatio)).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Split Operational Views: Next Critical Deadlines & Active Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (7 cols): Critical Upcoming Milestones */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-900">
                Tugas Berjalan & Mendesak
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">Daftar kewajiban terdekat</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('checklist')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Lihat Semua ({tasksSummary.pending}) →
            </button>
          </div>

          {tasksSummary.upcomingTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              Tidak ada tugas tertunda. Seluruh jadwal telah selesai.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {tasksSummary.upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-stone-50/50 px-1 sm:px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-stone-400 hover:text-stone-900 transition-colors shrink-0 p-0.5 -ml-0.5"
                      aria-label="Tandai Selesai"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-900 line-clamp-2 sm:truncate">
                        {task.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 text-[10px] sm:text-[11px] text-stone-500">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span className="font-mono text-stone-600 font-medium">
                          Tenggat {formatDateIndo(task.deadlineDate)} (H-{task.relativeDaysBeforeEvent})
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-medium shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : task.priority === 'medium'
                        ? 'bg-stone-100 text-stone-700 border border-stone-200'
                        : 'bg-stone-50 text-stone-500 border border-stone-200'
                    }`}
                  >
                    {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Vendor & Guest Ledger Quick Status */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Active Vendor Commitments */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-900">
                  Buku Vendor
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500">Kontrak aktif & pembayaran berjalan</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('vendors')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Direktori ({vendors.length}) →
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {vendors.slice(0, 3).map((v) => {
                const paid = v.payments.reduce((s, p) => s + p.amount, 0);
                const unbilled = Math.max(0, v.totalContractValue - paid);
                const statusLabel: Record<string, string> = {
                  booked: 'Dipesan',
                  negotiation: 'Negosiasi',
                  contacted: 'Dihubungi',
                  research: 'Penjajakan',
                  paid: 'Lunas',
                  cancelled: 'Batal',
                };
                return (
                  <div key={v.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-stone-900 truncate">
                        {v.name}
                      </div>
                      <div className="text-[11px] text-stone-400 capitalize">{statusLabel[v.status] || v.status}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-medium text-stone-900 tabular-nums">
                        {formatCurrency(v.totalContractValue)}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {unbilled > 0 ? `Sisa: ${formatCompactCurrency(unbilled)}` : 'Lunas'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guest Capacity & RSVP */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-900">
                Jumlah Tamu & Katering
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('guests')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Kelola RSVP →
              </button>
            </div>

            {/* Dense 3-column stats */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2 sm:p-2.5 bg-stone-50 rounded-lg border border-stone-200/80">
                <div className="text-[9px] sm:text-[10px] uppercase text-stone-500 truncate">Target</div>
                <div className="text-sm sm:text-base font-bold text-stone-900 tabular-nums mt-0.5">
                  {event.estimatedGuests}
                </div>
              </div>
              <div className="p-2 sm:p-2.5 bg-stone-50 rounded-lg border border-stone-200/80">
                <div className="text-[9px] sm:text-[10px] uppercase text-emerald-700 truncate">Hadir</div>
                <div className="text-sm sm:text-base font-bold text-emerald-800 tabular-nums mt-0.5">
                  {guestsSummary.confirmedPax}
                </div>
              </div>
              <div className="p-2 sm:p-2.5 bg-stone-50 rounded-lg border border-stone-200/80">
                <div className="text-[9px] sm:text-[10px] uppercase text-stone-500 truncate">Menunggu</div>
                <div className="text-sm sm:text-base font-bold text-stone-700 tabular-nums mt-0.5">
                  {guestsSummary.pendingPax}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
