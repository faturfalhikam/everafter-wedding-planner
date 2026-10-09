'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/weddingUtils';
import { Vendor, VendorStatus, PaymentType } from '@/types/wedding';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Phone,
  User,
  DollarSign,
} from 'lucide-react';

export const VendorView: React.FC = () => {
  const {
    vendors,
    budgetCategories,
    addVendor,
    updateVendor,
    deleteVendor,
    addVendorPayment,
  } = useWedding();

  const [selectedStatusTab, setSelectedStatusTab] = useState<VendorStatus | 'all'>('all');

  // Vendor Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vName, setVName] = useState<string>('');
  const [vCategoryId, setVCategoryId] = useState<string>('');
  const [vContactPerson, setVContactPerson] = useState<string>('');
  const [vPhone, setVPhone] = useState<string>('');
  const [vContractValue, setVContractValue] = useState<number>(10000000);
  const [vStatus, setVStatus] = useState<VendorStatus>('negotiation');
  const [vNotes, setVNotes] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [activeVendorForPayment, setActiveVendorForPayment] = useState<Vendor | null>(null);
  const [pAmount, setPAmount] = useState<number>(5000000);
  const [pType, setPType] = useState<PaymentType>('dp1');
  const [pDate, setPDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pNotes, setPNotes] = useState<string>('');

  const statuses: { id: VendorStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Vendor' },
    { id: 'booked', label: 'Dipesan / Kontrak' },
    { id: 'negotiation', label: 'Dalam Negosiasi' },
    { id: 'contacted', label: 'Sudah Dihubungi' },
    { id: 'research', label: 'Dalam Penjajakan' },
    { id: 'paid', label: 'Lunas' },
    { id: 'cancelled', label: 'Dibatalkan' },
  ];

  const filteredVendors = useMemo(() => {
    if (selectedStatusTab === 'all') return vendors;
    return vendors.filter((v) => v.status === selectedStatusTab);
  }, [vendors, selectedStatusTab]);

  const handleOpenAddVendorModal = () => {
    setEditingVendor(null);
    setVName('');
    setVCategoryId(budgetCategories[0]?.id || '');
    setVContactPerson('');
    setVPhone('');
    setVContractValue(15000000);
    setVStatus('negotiation');
    setVNotes('');
    setIsVendorModalOpen(true);
  };

  const handleOpenEditVendorModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVName(vendor.name);
    setVCategoryId(vendor.categoryId);
    setVContactPerson(vendor.contactPerson);
    setVPhone(vendor.phone);
    setVContractValue(vendor.totalContractValue);
    setVStatus(vendor.status);
    setVNotes(vendor.notes || '');
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) return;

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name: vName.trim(),
        categoryId: vCategoryId,
        contactPerson: vContactPerson.trim(),
        phone: vPhone.trim(),
        totalContractValue: vContractValue,
        status: vStatus,
        notes: vNotes.trim(),
      });
    } else {
      addVendor({
        categoryId: vCategoryId,
        name: vName.trim(),
        contactPerson: vContactPerson.trim(),
        phone: vPhone.trim(),
        totalContractValue: vContractValue,
        status: vStatus,
        notes: vNotes.trim(),
      });
    }
    setIsVendorModalOpen(false);
  };

  const handleOpenPaymentModal = (vendor: Vendor) => {
    setActiveVendorForPayment(vendor);
    const paidSoFar = vendor.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = Math.max(0, vendor.totalContractValue - paidSoFar);
    setPAmount(remaining > 0 ? remaining : 5000000);
    setPType(vendor.payments.length === 0 ? 'dp1' : remaining <= 0 ? 'adhoc' : 'pelunasan');
    setPDate(new Date().toISOString().split('T')[0]);
    setPNotes('');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVendorForPayment) return;

    addVendorPayment(activeVendorForPayment.id, {
      amount: pAmount,
      paymentDate: pDate,
      type: pType,
      notes: pNotes.trim(),
    });
    setIsPaymentModalOpen(false);
  };

  const getStageBadge = (vendor: Vendor) => {
    switch (vendor.status) {
      case 'booked':
        return vendor.payments.length === 0
          ? 'bg-amber-100 text-amber-800 border border-amber-200 font-medium'
          : 'bg-emerald-800 text-white font-medium';
      case 'paid':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium';
      case 'negotiation':
        return 'bg-white/60 text-stone-800 border border-white/60';
      case 'contacted':
        return 'bg-white/50 text-stone-700 border border-white/60';
      case 'research':
        return 'bg-white/50 text-stone-500 border border-white/60';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  const getStageLabel = (vendor: Vendor) => {
    switch (vendor.status) {
      case 'booked':
        return vendor.payments.length === 0 ? 'Belum Dibayar' : 'Dipesan';
      case 'paid':
        return 'Lunas';
      case 'negotiation':
        return 'Negosiasi';
      case 'contacted':
        return 'Dihubungi';
      case 'research':
        return 'Penjajakan';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return vendor.status;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
              Direktori & Pengadaan Vendor
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-medium text-stone-600">Siklus Kontrak</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight mt-0.5">
            Kontrak Vendor & Termin Pembayaran
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Vendor terkontrak langsung terhubung dengan pos komitmen anggaran dan jadwal pembayaran.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddVendorModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Vendor</span>
        </button>
      </div>

      {/* Stage Filter Tabs (Menu Status Vendor) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0">
        {statuses.map((s) => {
          const count =
            s.id === 'all'
              ? vendors.length
              : vendors.filter((v) => v.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStatusTab(s.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedStatusTab === s.id
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white/60 hover:bg-white/85 text-stone-600 border border-white/60'
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedStatusTab === s.id ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE CARDS VIEW: Nyaman & Responsif untuk HP */}
      <div className="md:hidden space-y-3">
        {filteredVendors.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-xs text-stone-400">
            Tidak ada vendor pada tahapan ini.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const cat = budgetCategories.find((c) => c.id === vendor.categoryId);
            const totalPaid = vendor.payments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = Math.max(0, vendor.totalContractValue - totalPaid);

            return (
              <div
                key={vendor.id}
                className="glass-card rounded-xl p-4 space-y-3"
              >
                {/* Header: Name, Category, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-stone-900 text-sm truncate">
                      {vendor.name}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {cat?.name || 'Kategori Umum'}
                    </div>
                    {vendor.notes && (
                      <div className="text-[11px] text-stone-400 mt-1 line-clamp-2 italic">
                        {vendor.notes}
                      </div>
                    )}
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider shrink-0 ${getStageBadge(
                      vendor
                    )}`}
                  >
                    {getStageLabel(vendor)}
                  </span>
                </div>

                {/* Contact info row if available */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 glass-inset p-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {vendor.isDirectExpense || vendor.contactPerson === '-'
                        ? 'Pengadaan Mandiri'
                        : vendor.contactPerson || '—'}
                    </span>
                  </div>

                  {vendor.phone && vendor.phone !== '-' && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a
                        href={`tel:${vendor.phone}`}
                        className="font-mono text-stone-700 underline hover:text-stone-900"
                      >
                        {vendor.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Financial 3-column stats mini-grid */}
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono glass-inset p-2.5 rounded-lg">
                  <div>
                    <div className="text-[9px] uppercase font-sans text-stone-400">Kontrak</div>
                    <div className="font-bold text-stone-900 text-xs sm:text-sm mt-0.5 truncate">
                      {formatCompactCurrency(vendor.totalContractValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-sans text-stone-400">Terbayar</div>
                    <div className="font-bold text-emerald-800 text-xs sm:text-sm mt-0.5 truncate">
                      {formatCompactCurrency(totalPaid)}
                    </div>
                    <div className="text-[9px] text-stone-400 font-sans">{vendor.payments.length}x</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-sans text-stone-400">Sisa</div>
                    <div className={`font-bold text-xs sm:text-sm mt-0.5 truncate ${remaining > 0 ? 'text-stone-800' : 'text-emerald-700'}`}>
                      {remaining > 0 ? formatCompactCurrency(remaining) : 'Lunas'}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(vendor)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white shadow-2xs rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>+ Bayar Termin</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditVendorModal(vendor)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Ubah Vendor"
                      aria-label="Ubah Vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteVendor(vendor.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Vendor"
                      aria-label="Hapus Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW: Rapi & Komprehensif untuk Layar Lebar */}
      <div className="hidden md:block glass-strong rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/50 border-b border-white/60 text-stone-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Vendor & Pos Kategori</th>
                <th className="py-3 px-4 font-semibold">Kontak / PIC</th>
                <th className="py-3 px-4 font-semibold text-center">Tahapan Kontrak</th>
                <th className="py-3 px-4 font-semibold text-right">Nilai Kontrak</th>
                <th className="py-3 px-4 font-semibold text-right">Sudah Dibayar</th>
                <th className="py-3 px-4 font-semibold text-right">Sisa Komitmen</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-sans text-stone-400">
                    Tidak ada vendor pada tahapan ini.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => {
                  const cat = budgetCategories.find((c) => c.id === vendor.categoryId);
                  const totalPaid = vendor.payments.reduce((sum, p) => sum + p.amount, 0);
                  const remaining = Math.max(0, vendor.totalContractValue - totalPaid);

                  return (
                    <tr key={vendor.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Category */}
                      <td className="py-3.5 px-4 font-sans font-medium text-stone-900">
                        <div className="text-xs font-semibold">{vendor.name}</div>
                        <div className="text-[11px] text-stone-500">
                          {cat?.name || 'Kategori Umum'}
                        </div>
                        {vendor.notes && (
                          <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                            {vendor.notes}
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 font-sans text-stone-600">
                        <div className="text-xs">
                          {vendor.isDirectExpense || vendor.contactPerson === '-'
                            ? 'Pengadaan Mandiri'
                            : vendor.contactPerson || '—'}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {vendor.isDirectExpense || vendor.phone === '-'
                            ? 'Belanja Langsung'
                            : vendor.phone || '—'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider ${getStageBadge(
                            vendor
                          )}`}
                        >
                          {getStageLabel(vendor)}
                        </span>
                      </td>

                      {/* Total Contract */}
                      <td className="py-3.5 px-4 text-right tabular-nums text-stone-900 font-medium">
                        {formatCurrency(vendor.totalContractValue)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-right tabular-nums text-emerald-700">
                        {formatCurrency(totalPaid)}
                        <span className="block text-[10px] text-stone-400">
                          {vendor.payments.length} termin
                        </span>
                      </td>

                      {/* Unpaid */}
                      <td className="py-3.5 px-4 text-right tabular-nums text-stone-700 font-medium">
                        {formatCurrency(remaining)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(vendor)}
                            className="px-2 py-1 text-[11px] font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                            title="Catat Pembayaran Termin"
                          >
                            + Bayar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditVendorModal(vendor)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                            title="Ubah Vendor"
                            aria-label="Ubah Vendor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVendor(vendor.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus Vendor"
                            aria-label="Hapus Vendor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Ubah Vendor */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                {editingVendor ? 'Ubah Informasi Vendor' : 'Tambah Vendor Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsVendorModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nama Vendor / Layanan</label>
                <input
                  type="text"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="Contoh: Sanggar Rias Anggun Kemala"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Pos Anggaran</label>
                  <select
                    value={vCategoryId}
                    onChange={(e) => setVCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {budgetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tahapan Kontrak</label>
                  <select
                    value={vStatus}
                    onChange={(e) => setVStatus(e.target.value as VendorStatus)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="research">Penjajakan Awal</option>
                    <option value="contacted">Sudah Dihubungi</option>
                    <option value="negotiation">Negosiasi Harga</option>
                    <option value="booked">Terkontrak / Dipesan</option>
                    <option value="paid">Lunas</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Kontak PIC</label>
                  <input
                    type="text"
                    value={vContactPerson}
                    onChange={(e) => setVContactPerson(e.target.value)}
                    placeholder="Nama PIC"
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">No. WhatsApp / Telp</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Nilai Kesepakatan Kontrak (Rp)</label>
                <input
                  type="number"
                  step={500000}
                  value={vContractValue}
                  onChange={(e) => setVContractValue(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                  Terbilang: {formatCurrency(vContractValue)}
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Catatan Kesepakatan & Paket</label>
                <textarea
                  rows={2}
                  value={vNotes}
                  onChange={(e) => setVNotes(e.target.value)}
                  placeholder="Detail paket, bonus, atau syarat pembatalan..."
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  {editingVendor ? 'Simpan Perubahan' : 'Tambahkan Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bayar Termin Vendor */}
      {isPaymentModalOpen && activeVendorForPayment && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  Catat Pembayaran Termin
                </h3>
                <p className="text-[11px] text-stone-500 truncate max-w-[220px]">
                  {activeVendorForPayment.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Jenis Termin</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value as PaymentType)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="dp1">DP 1 (Booking)</option>
                    <option value="dp2">DP 2 (Termin)</option>
                    <option value="pelunasan">Pelunasan</option>
                    <option value="adhoc">Biaya Tambahan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={pDate}
                    onChange={(e) => setPDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Nominal Pembayaran (Rp)</label>
                <input
                  type="number"
                  step={500000}
                  value={pAmount}
                  onChange={(e) => setPAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold"
                  required
                />
                <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                  Terbilang: {formatCurrency(pAmount)}
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">No. Kuitansi / Catatan Bank</label>
                <input
                  type="text"
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  placeholder="Contoh: Bukti Transfer BCA ref #8762"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
