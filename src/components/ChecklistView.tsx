'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { formatDateIndo } from '@/lib/weddingUtils';
import { EventTask } from '@/types/wedding';
import {
  Circle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
} from 'lucide-react';

export const ChecklistView: React.FC = () => {
  const { event, tasks, toggleTask, addTask, updateTask, deleteTask } = useWedding();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<EventTask | null>(null);

  // Form input states
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Perencanaan Inti');
  const [formRelativeDays, setFormRelativeDays] = useState<number>(60);
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'completed'
          ? t.isCompleted
          : !t.isCompleted;
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [tasks, selectedCategory, selectedStatus, searchQuery]);

  // Grouped for Timeline View by relative periods
  const timelineGroups = useMemo(() => {
    const groups: { label: string; periodDays: string; tasks: EventTask[] }[] = [
      { label: 'Fase 1: Fondasi & Kesepakatan (> 180 Hari)', periodDays: '> 180 Hari', tasks: [] },
      { label: 'Fase 2: Pemilihan Vendor (90 - 180 Hari)', periodDays: '90 - 180 Hari', tasks: [] },
      { label: 'Fase 3: Koordinasi & Undangan (30 - 90 Hari)', periodDays: '30 - 90 Hari', tasks: [] },
      { label: 'Fase 4: Gladi Bersih & Fitting (7 - 30 Hari)', periodDays: '7 - 30 Hari', tasks: [] },
      { label: 'Fase 5: Pekan Acara & Pelaksanaan (≤ 7 Hari)', periodDays: '≤ 7 Hari', tasks: [] },
    ];

    filteredTasks.forEach((t) => {
      const days = t.relativeDaysBeforeEvent;
      if (days > 180) groups[0].tasks.push(t);
      else if (days > 90) groups[1].tasks.push(t);
      else if (days > 30) groups[2].tasks.push(t);
      else if (days > 7) groups[3].tasks.push(t);
      else groups[4].tasks.push(t);
    });

    return groups.filter((g) => g.tasks.length > 0);
  }, [filteredTasks]);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormCategory(categories[0] || 'Perencanaan Inti');
    setFormRelativeDays(60);
    setFormPriority('medium');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: EventTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormRelativeDays(task.relativeDaysBeforeEvent);
    setFormPriority(task.priority);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        category: formCategory,
        relativeDaysBeforeEvent: formRelativeDays,
        priority: formPriority,
      });
    } else {
      if (!event) return;
      addTask({
        title: formTitle.trim(),
        category: formCategory,
        relativeDaysBeforeEvent: formRelativeDays,
        deadlineDate: event.eventDate,
        isCompleted: false,
        priority: formPriority,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
              Jadwal Proyek
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-medium text-stone-600">Formula Hari Relatif (H - X)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight mt-0.5">
            Linimasa Operasional & Daftar Tugas
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tenggat waktu otomatis menyesuaikan apabila tanggal acara diubah.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Filter and Query Bar */}
      <div className="glass-card rounded-xl p-3 sm:p-4 space-y-2.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas atau kategori..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-2 text-sm sm:text-xs glass-input rounded-lg font-medium"
            >
              <option value="all">Semua Kategori ({tasks.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'pending' | 'completed')}
              className="w-full sm:w-auto px-2.5 py-2 text-sm sm:text-xs glass-input rounded-lg font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Belum Selesai</option>
              <option value="completed">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Phased Task Groups */}
      <div className="space-y-4 sm:space-y-5">
        {timelineGroups.length === 0 ? (
          <div className="glass-card rounded-xl p-8 sm:p-12 text-center text-xs text-stone-400">
            Tidak ada tugas yang sesuai dengan kriteria filter yang dipilih.
          </div>
        ) : (
          timelineGroups.map((group, gIdx) => (
            <div key={gIdx} className="glass-strong rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-emerald-50/60 to-pink-50/40 border-b border-emerald-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 truncate">
                    {group.label}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-stone-500 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold shrink-0">
                  {group.tasks.filter((t) => t.isCompleted).length}/{group.tasks.length} Selesai
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`py-3 px-3.5 sm:px-5 flex items-start justify-between gap-3 transition-colors ${
                      task.isCompleted ? 'bg-stone-50/40 text-stone-400' : 'hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-stone-400 hover:text-stone-900 transition-colors shrink-0 p-1 -ml-1 rounded"
                        title={task.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                        aria-label="Toggle Status Tugas"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs sm:text-sm font-medium line-clamp-2 ${
                            task.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-[10px] sm:text-[11px] text-stone-500">
                          <span className="px-1.5 py-0.2 rounded bg-white/50 text-stone-600 border border-white/60 font-sans">
                            {task.category}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-stone-600">
                            Tenggat: {formatDateIndo(task.deadlineDate)}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-stone-400">
                            H-{task.relativeDaysBeforeEvent}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 pt-0.5">
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded font-medium ${
                          task.priority === 'high'
                            ? 'bg-pink-100 text-pink-800 border border-pink-200 font-semibold'
                            : task.priority === 'medium'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-white/50 text-stone-500 border border-white/60'
                        }`}
                      >
                        {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded"
                        title="Ubah Tugas"
                        aria-label="Ubah Tugas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                        title="Hapus Tugas"
                        aria-label="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                {editingTask ? 'Ubah Rincian Tugas' : 'Tambah Tugas Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Deskripsi / Nama Tugas
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Konfirmasi final porsi katering"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Contoh: Venue & Katering"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Jadwal Relatif (H - X hari)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={formRelativeDays}
                    onChange={(e) => setFormRelativeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm sm:text-xs font-mono glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                    Contoh: 30 = 30 hari sebelum acara
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium"
                  >
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                </div>
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
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
