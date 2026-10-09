'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { Guest, GuestGroup, RSVPStatus } from '@/types/wedding';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Phone,
} from 'lucide-react';

export const GuestListView: React.FC = () => {
  const { event, guests, guestsSummary, addGuest, updateGuest, deleteGuest } = useWedding();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRSVP, setSelectedRSVP] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [gName, setGName] = useState<string>('');
  const [gGroup, setGGroup] = useState<GuestGroup>('Teman');
  const [gPax, setGPax] = useState<number>(2);
  const [gRSVP, setGRSVP] = useState<RSVPStatus>('pending');
  const [gPhone, setGPhone] = useState<string>('');
  const [gNotes, setGNotes] = useState<string>('');

  const groups: GuestGroup[] = ['Keluarga', 'Teman', 'VIP', 'Kantor / Rekan'];

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.phone && g.phone.includes(searchQuery));
      const matchGroup = selectedGroup === 'all' || g.group === selectedGroup;
      const matchRSVP = selectedRSVP === 'all' || g.rsvpStatus === selectedRSVP;
      return matchSearch && matchGroup && matchRSVP;
    });
  }, [guests, searchQuery, selectedGroup, selectedRSVP]);

  const handleOpenAddModal = () => {
    setEditingGuest(null);
    setGName('');
    setGGroup('Teman');
    setGPax(2);
    setGRSVP('pending');
    setGPhone('');
    setGNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setGName(guest.name);
    setGGroup(guest.group);
    setGPax(guest.pax);
    setGRSVP(guest.rsvpStatus);
    setGPhone(guest.phone || '');
    setGNotes(guest.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim()) return;

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        name: gName.trim(),
        group: gGroup,
        pax: gPax,
        rsvpStatus: gRSVP,
        phone: gPhone.trim(),
        notes: gNotes.trim(),
      });
    } else {
      addGuest({
        name: gName.trim(),
        group: gGroup,
        pax: gPax,
        rsvpStatus: gRSVP,
        phone: gPhone.trim(),
        notes: gNotes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleQuickRSVP = (guestId: string, status: RSVPStatus) => {
    updateGuest(guestId, { rsvpStatus: status });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
              Manajemen Tamu & Kehadiran
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-medium text-stone-600">
              Target Kapasitas: {event?.estimatedGuests || 300} Pax
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight mt-0.5">
            Daftar Tamu & Rekonsiliasi RSVP
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Porsi prasmanan katering dan tata kursi dihitung dari Pax Terkonfirmasi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tamu Undangan</span>
        </button>
      </div>

      {/* Inline Summary Metrics (Clean Responsive Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 font-mono">
        <div className="glass-card rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-sans text-stone-500">Total Undangan</div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 tabular-nums mt-0.5">
            {guestsSummary.totalGuests}{' '}
            <span className="text-xs font-normal text-stone-400">undangan</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 font-sans truncate">
            {guestsSummary.totalPax} total perkiraan pax
          </div>
        </div>

        <div className="glass-card rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-sans text-emerald-800 font-medium">Konfirmasi Hadir</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-800 tabular-nums mt-0.5">
            {guestsSummary.confirmedPax}{' '}
            <span className="text-xs font-normal text-stone-400">pax</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 mt-0.5 font-sans truncate">
            {event?.estimatedGuests
              ? `${((guestsSummary.confirmedPax / event.estimatedGuests) * 100).toFixed(0)}% dari kapasitas`
              : 'Terkonfirmasi'}
          </div>
        </div>

        <div className="glass-card rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-sans text-pink-700 font-medium">Menunggu Respon</div>
          <div className="text-lg sm:text-xl font-bold text-pink-800 tabular-nums mt-0.5">
            {guestsSummary.pendingPax}{' '}
            <span className="text-xs font-normal text-stone-400">pax</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 font-sans truncate">Menunggu RSVP</div>
        </div>

        <div className="glass-card rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-sans text-stone-500">Tidak Hadir</div>
          <div className="text-lg sm:text-xl font-bold text-stone-400 tabular-nums mt-0.5">
            {guestsSummary.declinedPax}{' '}
            <span className="text-xs font-normal text-stone-400">pax</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 font-sans truncate">Berhalangan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl p-3 sm:p-4 space-y-2.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tamu atau no. telepon..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="flex items-center gap-1.5">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-2 text-sm sm:text-xs glass-input rounded-lg font-medium"
            >
              <option value="all">Semua Kelompok ({guests.length})</option>
              {groups.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedRSVP}
              onChange={(e) => setSelectedRSVP(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-2 text-sm sm:text-xs glass-input rounded-lg font-medium"
            >
              <option value="all">Semua RSVP</option>
              <option value="confirmed">Konfirmasi Hadir</option>
              <option value="pending">Menunggu</option>
              <option value="declined">Tidak Hadir</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE GUEST CARDS: Tampilan Nyaman & Mudah Dioperasikan di Layar HP */}
      <div className="md:hidden space-y-3">
        {filteredGuests.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-xs text-stone-400">
            Tidak ada tamu yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="glass-card rounded-xl p-4 space-y-3"
            >
              {/* Top Row: Name, Group, Pax */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-stone-900 text-sm">
                    {guest.name}
                  </div>
                  {guest.notes && (
                    <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                      {guest.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-white/50 text-stone-700 text-[10px] font-medium border border-white/60">
                    {guest.group}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-mono font-bold">
                    {guest.pax} Pax
                  </span>
                </div>
              </div>

              {/* Phone row if available */}
              {guest.phone && (
                <div className="flex items-center gap-1.5 text-xs text-stone-600 glass-inset px-2.5 py-1.5 rounded-lg">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a
                    href={`tel:${guest.phone}`}
                    className="font-mono text-stone-800 underline hover:text-stone-900"
                  >
                    {guest.phone}
                  </a>
                </div>
              )}

              {/* RSVP Segmented Control with Prominent Touch Targets */}
              <div className="pt-1">
                <div className="text-[10px] font-mono text-stone-400 uppercase mb-1">
                  Status RSVP:
                </div>
                <div className="grid grid-cols-3 gap-1 bg-white/45 p-1 rounded-lg border border-white/60 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickRSVP(guest.id, 'confirmed')}
                    className={`py-2 px-1 rounded-md text-[11px] font-semibold transition-all text-center ${
                      guest.rsvpStatus === 'confirmed'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ✓ Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRSVP(guest.id, 'pending')}
                    className={`py-2 px-1 rounded-md text-[11px] font-semibold transition-all text-center ${
                      guest.rsvpStatus === 'pending'
                        ? 'bg-pink-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Menunggu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRSVP(guest.id, 'declined')}
                    className={`py-2 px-1 rounded-md text-[11px] font-semibold transition-all text-center ${
                      guest.rsvpStatus === 'declined'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ✕ Batal
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(guest)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteGuest(guest.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP GUEST TABLE: Tampilan Tabel Standar Layar Lebar */}
      <div className="hidden md:block glass-strong rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/50 border-b border-white/60 text-stone-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Tamu / Rombongan</th>
                <th className="py-3 px-4 font-semibold">Kelompok Tamu</th>
                <th className="py-3 px-4 font-semibold text-center">Jumlah Pax</th>
                <th className="py-3 px-4 font-semibold">No. Kontak</th>
                <th className="py-3 px-4 font-semibold text-center">Rekonsiliasi RSVP</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-stone-400">
                    Tidak ada tamu yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-medium text-stone-900">
                      <div>{guest.name}</div>
                      {guest.notes && (
                        <div className="text-[11px] text-stone-400 mt-0.5">{guest.notes}</div>
                      )}
                    </td>

                    {/* Group */}
                    <td className="py-3.5 px-4 text-stone-600">
                      <span className="px-2 py-0.5 rounded bg-white/50 text-stone-700 text-[11px] font-medium border border-white/60">
                        {guest.group}
                      </span>
                    </td>

                    {/* Pax */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-900 tabular-nums">
                      {guest.pax}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">
                      {guest.phone ? (
                        <a href={`tel:${guest.phone}`} className="hover:underline">
                          {guest.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* RSVP Toggle Buttons (Menu RSVP Cepat) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center bg-white/50 p-0.5 rounded border border-white/60 text-xs">
                        <button
                          type="button"
                          onClick={() => handleQuickRSVP(guest.id, 'confirmed')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            guest.rsvpStatus === 'confirmed'
                              ? 'bg-emerald-700 text-white font-semibold'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickRSVP(guest.id, 'pending')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            guest.rsvpStatus === 'pending'
                              ? 'bg-pink-600 text-white font-semibold'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          Menunggu
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickRSVP(guest.id, 'declined')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            guest.rsvpStatus === 'declined'
                              ? 'bg-rose-700 text-white font-semibold'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          Batal
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(guest)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                          title="Ubah Tamu"
                          aria-label="Ubah Tamu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGuest(guest.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus Tamu"
                          aria-label="Hapus Tamu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Guest */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                {editingGuest ? 'Ubah Data Tamu' : 'Tambah Tamu Undangan'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nama Tamu / Rombongan
                </label>
                <input
                  type="text"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  placeholder="Contoh: Bpk. Bambang & Keluarga"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Kelompok
                  </label>
                  <select
                    value={gGroup}
                    onChange={(e) => setGGroup(e.target.value as GuestGroup)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium"
                  >
                    {groups.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Jumlah Pax (Porsi)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={gPax}
                    onChange={(e) => setGPax(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm sm:text-xs font-mono glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Status RSVP
                  </label>
                  <select
                    value={gRSVP}
                    onChange={(e) => setGRSVP(e.target.value as RSVPStatus)}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium"
                  >
                    <option value="pending">Menunggu Konfirmasi</option>
                    <option value="confirmed">Konfirmasi Hadir</option>
                    <option value="declined">Tidak Hadir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={gPhone}
                    onChange={(e) => setGPhone(e.target.value)}
                    placeholder="081..."
                    className="w-full px-3 py-2 text-sm sm:text-xs font-mono glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={gNotes}
                  onChange={(e) => setGNotes(e.target.value)}
                  placeholder="Contoh: Meja VIP / Alergi seafood"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  Simpan Tamu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
