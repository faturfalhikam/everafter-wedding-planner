'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/context/WeddingContext';
import {
  formatCurrency,
  formatDateIndo,
} from '@/lib/weddingUtils';
import { BudgetCategory, Vendor, PaymentType } from '@/types/wedding';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Receipt,
  Check,
  ChevronDown,
  ChevronUp,
  Wallet,
  ShoppingBag,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Info,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_PRESETS = [
  { name: 'Venue & Gedung Acara', defaultBudget: 35000000, icon: '🏛️' },
  { name: 'Katering & Prasmanan', defaultBudget: 45000000, icon: '🍽️' },
  { name: 'Dekorasi & Tata Pelaminan', defaultBudget: 20000000, icon: '💐' },
  { name: 'Dokumentasi Foto & Video', defaultBudget: 15000000, icon: '📸' },
  { name: 'Busana, MUA & Rias Pengantin', defaultBudget: 12000000, icon: '👗' },
  { name: 'Undangan, Souvenir & Aksesoris', defaultBudget: 7500000, icon: '💌' },
  { name: 'Cincin Kawin, Mahar & Seserahan', defaultBudget: 15000000, icon: '💍' },
  { name: 'Hiburan Musik, Band & Sound', defaultBudget: 8000000, icon: '🎶' },
  { name: 'Sewa Mobil & Transportasi', defaultBudget: 5000000, icon: '🚗' },
  { name: 'Dana Cadangan / Tak Terduga', defaultBudget: 10000000, icon: '🛡️' },
];

export const BudgetIntelligenceView: React.FC = () => {
  const {
    event,
    financials,
    budgetCategories,
    vendors,
    updateEventDetails,
    updateBudgetCategory,
    addBudgetCategory,
    deleteBudgetCategory,
    addBudgetItem,
    updateBudgetItem,
    settleBudgetItemPayment,
    deleteVendor,
    addVendorPayment,
    deleteVendorPayment,
    applyRecommendedAllocation,
  } = useWedding();

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseTab, setExpenseTab] = useState<'direct' | 'vendor'>('direct');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [isTotalBudgetModalOpen, setIsTotalBudgetModalOpen] = useState<boolean>(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState<boolean>(false);
  const [settlingItem, setSettlingItem] = useState<Vendor | null>(null);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState<boolean>(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<Vendor | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'payment' | 'item';
    categoryId?: string;
    vendorId?: string;
    paymentId?: string;
    title: string;
    amount?: number;
  } | null>(null);

  // Category Table State
  const [categoryFilterTab, setCategoryFilterTab] = useState<'all' | 'unpaid' | 'over' | 'safe'>('all');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Category Modal Form State
  const [catName, setCatName] = useState<string>('');
  const [catBudget, setCatBudget] = useState<number>(15000000);

  // Total Budget Modal Form State
  const [eventTotalBudget, setEventTotalBudget] = useState<number>(event?.totalBudget || 100000000);
  const [autoRebalanceAfterSave, setAutoRebalanceAfterSave] = useState<boolean>(false);

  // Form State: Add Budget Item (Direct Expense / Budgeting)
  const [directTitle, setDirectTitle] = useState<string>('');
  const [directCategoryId, setDirectCategoryId] = useState<string>('');
  const [directBudgetAmount, setDirectBudgetAmount] = useState<number>(500000);
  const [directIsPaid, setDirectIsPaid] = useState<boolean>(false); // DEFAULT: Belum Dibayar
  const [directPaidAmount, setDirectPaidAmount] = useState<number>(500000);
  const [directPaymentDate, setDirectPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [directDueDate, setDirectDueDate] = useState<string>('');
  const [directNotes, setDirectNotes] = useState<string>('');

  // Form State: Settle Item Payment (Bayar / Lunasi)
  const [settleAmount, setSettleAmount] = useState<number>(500000);
  const [settleIsFull, setSettleIsFull] = useState<boolean>(true);
  const [settleDate, setSettleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [settleNotes, setSettleNotes] = useState<string>('');

  // Form State: Edit Item Details
  const [editItemTitle, setEditItemTitle] = useState<string>('');
  const [editItemCategoryId, setEditItemCategoryId] = useState<string>('');
  const [editItemBudget, setEditItemBudget] = useState<number>(500000);
  const [editItemDueDate, setEditItemDueDate] = useState<string>('');
  const [editItemNotes, setEditItemNotes] = useState<string>('');

  // Form State: Pay Existing Contract Vendor
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [vendorPaymentAmount, setVendorPaymentAmount] = useState<number>(5000000);
  const [vendorPaymentType, setVendorPaymentType] = useState<PaymentType>('dp1');
  const [vendorPaymentDate, setVendorPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendorPaymentNotes, setVendorPaymentNotes] = useState<string>('');

  // Section 5 State: Items Tab vs Cashflow Ledger
  const [section5Tab, setSection5Tab] = useState<'items' | 'cashflow'>('items');
  const [itemsFilterStatus, setItemsFilterStatus] = useState<'all' | 'unpaid' | 'dp' | 'paid'>('all');
  const [itemsSearch, setItemsSearch] = useState<string>('');
  const [itemsCategoryFilter, setItemsCategoryFilter] = useState<string>('all');

  // Ledger Search & Filter State
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('all');

  // Overall financial calculations
  const totalActual = financials.totalPaid + financials.totalCommitted;
  const remaining = financials.totalAvailable;
  const utilizationPercentage =
    financials.totalBudget > 0 ? (totalActual / financials.totalBudget) * 100 : 0;

  // Compile all disbursements with vendor ID & payment ID for deletion & search
  const allDisbursements = useMemo(() => {
    return vendors
      .flatMap((v) =>
        v.payments.map((p) => {
          const categoryName =
            financials.categoryBreakdown.find((c) => c.category.id === v.categoryId)?.category
              .name || 'Umum';
          const isDirectExpense = v.isDirectExpense || v.id.startsWith('vendor-expense-');
          return {
            ...p,
            vendorId: v.id,
            vendorName: v.name,
            categoryId: v.categoryId,
            categoryName,
            isDirectExpense,
          };
        })
      )
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [vendors, financials]);

  // Filtered ledger transactions
  const filteredDisbursements = useMemo(() => {
    return allDisbursements.filter((item) => {
      const matchSearch =
        ledgerSearch.trim() === '' ||
        item.vendorName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(ledgerSearch.toLowerCase()));

      const matchCategory =
        ledgerCategoryFilter === 'all' || item.categoryId === ledgerCategoryFilter;

      const matchType =
        ledgerTypeFilter === 'all' ||
        (ledgerTypeFilter === 'direct' && item.isDirectExpense) ||
        item.type === ledgerTypeFilter;

      return matchSearch && matchCategory && matchType;
    });
  }, [allDisbursements, ledgerSearch, ledgerCategoryFilter, ledgerTypeFilter]);

  // Enhanced Items List (All vendors & budget items with full status analysis)
  const allItemsWithAnalysis = useMemo(() => {
    return vendors.map((v) => {
      const category = budgetCategories.find((c) => c.id === v.categoryId);
      const paid = v.payments.reduce((s, p) => s + p.amount, 0);
      const budget = v.estimatedBudget || v.totalContractValue;
      const remainingUnpaid = Math.max(0, v.totalContractValue - paid);

      // Status classification
      let itemStatus: 'unpaid' | 'dp' | 'paid' = 'unpaid';
      if (v.status === 'paid' || (v.totalContractValue > 0 && paid >= v.totalContractValue)) {
        itemStatus = 'paid';
      } else if (paid > 0) {
        itemStatus = 'dp';
      } else {
        itemStatus = 'unpaid';
      }

      // Variance analysis (Realisasi vs Budget)
      const varianceAmount = paid - budget; // > 0 means over budget, < 0 means under budget
      const isSettled = itemStatus === 'paid';

      return {
        ...v,
        categoryName: category?.name || 'Kategori Umum',
        budget,
        paid,
        remainingUnpaid,
        itemStatus,
        varianceAmount,
        isSettled,
      };
    });
  }, [vendors, budgetCategories]);

  // Filtered Items List for Section 5 Tab 1
  const filteredItems = useMemo(() => {
    return allItemsWithAnalysis.filter((item) => {
      const matchStatus =
        itemsFilterStatus === 'all' || item.itemStatus === itemsFilterStatus;

      const matchCategory =
        itemsCategoryFilter === 'all' || item.categoryId === itemsCategoryFilter;

      const matchSearch =
        itemsSearch.trim() === '' ||
        item.name.toLowerCase().includes(itemsSearch.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(itemsSearch.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(itemsSearch.toLowerCase()));

      return matchStatus && matchCategory && matchSearch;
    });
  }, [allItemsWithAnalysis, itemsFilterStatus, itemsCategoryFilter, itemsSearch]);

  // Filtered categories for Section 4
  const filteredCategoryBreakdown = useMemo(() => {
    return financials.categoryBreakdown.filter((item) => {
      if (categoryFilterTab === 'unpaid') {
        return item.committed > 0;
      }
      if (categoryFilterTab === 'over') {
        return item.variance.classification === 'over';
      }
      if (categoryFilterTab === 'safe') {
        return item.variance.classification === 'under';
      }
      return true;
    });
  }, [financials.categoryBreakdown, categoryFilterTab]);

  // Category Over / Warning / Safe Stats
  const categoryStats = useMemo(() => {
    let safeCount = 0;
    let overCount = 0;
    let onTargetCount = 0;

    financials.categoryBreakdown.forEach((item) => {
      if (item.variance.classification === 'over') overCount++;
      else if (item.variance.classification === 'under') safeCount++;
      else onTargetCount++;
    });

    return { safeCount, overCount, onTargetCount };
  }, [financials.categoryBreakdown]);

  // Counts for items tabs
  const itemsStats = useMemo(() => {
    let unpaidCount = 0;
    let dpCount = 0;
    let paidCount = 0;

    allItemsWithAnalysis.forEach((i) => {
      if (i.itemStatus === 'unpaid') unpaidCount++;
      else if (i.itemStatus === 'dp') dpCount++;
      else if (i.itemStatus === 'paid') paidCount++;
    });

    return { total: allItemsWithAnalysis.length, unpaidCount, dpCount, paidCount };
  }, [allItemsWithAnalysis]);

  // Handler: Open Add Budget Item / Expense Modal
  const handleOpenExpenseModal = (preselectedCategory?: BudgetCategory, preselectedVendor?: Vendor) => {
    const defaultCatId = preselectedCategory?.id || budgetCategories[0]?.id || '';
    setDirectCategoryId(defaultCatId);

    if (preselectedVendor) {
      setExpenseTab('vendor');
      setSelectedVendorId(preselectedVendor.id);
      const paid = preselectedVendor.payments.reduce((s, p) => s + p.amount, 0);
      const rem = Math.max(0, preselectedVendor.totalContractValue - paid);
      setVendorPaymentAmount(rem > 0 ? rem : 2000000);
      setVendorPaymentType(
        preselectedVendor.payments.length === 0 ? 'dp1' : rem <= 0 ? 'adhoc' : 'pelunasan'
      );
    } else {
      // Default to adding a budget item
      setExpenseTab('direct');
      setDirectTitle('');
      setDirectBudgetAmount(500000);
      setDirectIsPaid(false); // Default: Belum Dibayar
      setDirectPaidAmount(500000);
      setDirectPaymentDate(new Date().toISOString().split('T')[0]);
      setDirectDueDate('');
      setDirectNotes('');
    }

    setIsExpenseModalOpen(true);
  };

  // Handler: Save Add Budget Item / Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseTab === 'direct') {
      if (!directTitle.trim() || !directCategoryId || directBudgetAmount <= 0) return;

      addBudgetItem({
        categoryId: directCategoryId,
        title: directTitle.trim(),
        budgetAmount: directBudgetAmount,
        isPaid: directIsPaid,
        paidAmount: directIsPaid ? directPaidAmount : undefined,
        paymentDate: directIsPaid ? directPaymentDate : undefined,
        dueDate: !directIsPaid && directDueDate ? directDueDate : undefined,
        notes: directNotes.trim() || undefined,
      });
    } else {
      if (!selectedVendorId || vendorPaymentAmount <= 0) return;
      addVendorPayment(selectedVendorId, {
        amount: vendorPaymentAmount,
        paymentDate: vendorPaymentDate,
        type: vendorPaymentType,
        notes: vendorPaymentNotes.trim() || undefined,
      });
    }
    setIsExpenseModalOpen(false);
  };

  // Handler: Open Settle Item Payment Modal (Bayar / Lunasi)
  const handleOpenSettleModal = (item: Vendor) => {
    setSettlingItem(item);
    const paidSoFar = item.payments.reduce((s, p) => s + p.amount, 0);
    const budget = item.estimatedBudget || item.totalContractValue;
    const remainingUnpaid = Math.max(0, item.totalContractValue - paidSoFar);

    // Default settle amount = remaining debt, or if 0, original budget
    const defaultAmount = remainingUnpaid > 0 ? remainingUnpaid : budget;
    setSettleAmount(defaultAmount);
    setSettleIsFull(true);
    setSettleDate(new Date().toISOString().split('T')[0]);
    setSettleNotes('');
    setIsSettleModalOpen(true);
  };

  // Handler: Save Settle Payment
  const handleSaveSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingItem || settleAmount <= 0) return;

    settleBudgetItemPayment(settlingItem.id, {
      amount: settleAmount,
      paymentDate: settleDate,
      isFullPayment: settleIsFull,
      notes: settleNotes.trim() || undefined,
    });

    setIsSettleModalOpen(false);
    setSettlingItem(null);
  };

  // Handler: Open Edit Budget Item Modal
  const handleOpenEditItemModal = (item: Vendor) => {
    setEditingBudgetItem(item);
    setEditItemTitle(item.name);
    setEditItemCategoryId(item.categoryId);
    setEditItemBudget(item.estimatedBudget || item.totalContractValue);
    setEditItemDueDate(item.dueDate || '');
    setEditItemNotes(item.notes || '');
    setIsEditItemModalOpen(true);
  };

  // Handler: Save Edit Budget Item
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudgetItem || !editItemTitle.trim() || editItemBudget <= 0) return;

    updateBudgetItem(editingBudgetItem.id, {
      title: editItemTitle.trim(),
      categoryId: editItemCategoryId,
      budgetAmount: editItemBudget,
      dueDate: editItemDueDate || undefined,
      notes: editItemNotes.trim() || undefined,
    });

    setIsEditItemModalOpen(false);
    setEditingBudgetItem(null);
  };

  // Handler: Category Add / Edit
  const handleOpenAddCategoryModal = (preset?: typeof CATEGORY_PRESETS[0]) => {
    setEditingCategory(null);
    setCatName(preset ? preset.name : '');
    setCatBudget(preset ? preset.defaultBudget : 15000000);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: BudgetCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatBudget(cat.allocatedBudget);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || catBudget <= 0) return;

    if (editingCategory) {
      updateBudgetCategory(editingCategory.id, catBudget, catName.trim());
    } else {
      addBudgetCategory(catName.trim(), catBudget);
    }
    setIsCategoryModalOpen(false);
  };

  // Handler: Total Budget Modal
  const handleOpenTotalBudgetModal = () => {
    setEventTotalBudget(event?.totalBudget || financials.totalBudget || 100000000);
    setAutoRebalanceAfterSave(false);
    setIsTotalBudgetModalOpen(true);
  };

  const handleSaveTotalBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventTotalBudget <= 0) return;

    updateEventDetails({ totalBudget: eventTotalBudget });
    if (autoRebalanceAfterSave) {
      applyRecommendedAllocation();
    }
    setIsTotalBudgetModalOpen(false);
  };

  // Handler: Delete Triggers
  const handleTriggerDeleteCategory = (cat: BudgetCategory) => {
    setDeleteTarget({
      type: 'category',
      categoryId: cat.id,
      title: `Pos Rencana: ${cat.name}`,
    });
    setIsDeleteConfirmOpen(true);
  };

  const handleTriggerDeleteItem = (item: Vendor) => {
    setDeleteTarget({
      type: 'item',
      vendorId: item.id,
      title: item.name,
      amount: item.estimatedBudget || item.totalContractValue,
    });
    setIsDeleteConfirmOpen(true);
  };

  const handleTriggerDeletePayment = (item: typeof allDisbursements[0]) => {
    setDeleteTarget({
      type: 'payment',
      vendorId: item.vendorId,
      paymentId: item.id,
      title: `${item.vendorName} (${formatCurrency(item.amount)})`,
      amount: item.amount,
    });
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'category' && deleteTarget.categoryId) {
      deleteBudgetCategory(deleteTarget.categoryId);
    } else if (deleteTarget.type === 'item' && deleteTarget.vendorId) {
      deleteVendor(deleteTarget.vendorId);
    } else if (
      deleteTarget.type === 'payment' &&
      deleteTarget.vendorId &&
      deleteTarget.paymentId
    ) {
      deleteVendorPayment(deleteTarget.vendorId, deleteTarget.paymentId);
    }

    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. HEADER & ACTION BAR */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-stone-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
                <Wallet className="w-3 h-3 text-stone-500" />
                Budgeting & Buku Kas Acara
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Audit Real-Time
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight mt-1.5">
              Anggaran & Pembukuan Acara
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Rencanakan alokasi biaya per item belanja, kelola status belum dibayar/lunas, dan
              catat mutasi uang keluar secara akurat dan transparan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Primary Action: Tambah Item Rencana / Belanja */}
            <button
              type="button"
              onClick={() => handleOpenExpenseModal()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Tambah Item / Belanja</span>
            </button>

            {/* Secondary Action: Tambah Pos Rencana */}
            <button
              type="button"
              onClick={() => handleOpenAddCategoryModal()}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 glass-input hover:bg-white/80 text-stone-700 text-xs font-medium rounded-lg transition-colors"
            >
              <span>+ Pos Baru</span>
            </button>

            {/* Tertiary Action: Atur Target Total */}
            <button
              type="button"
              onClick={handleOpenTotalBudgetModal}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2.5 sm:py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors"
              title="Atur ulang total target anggaran pernikahan"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ubah Total Target</span>
            </button>
          </div>
        </div>

        {/* 2. RINGKASAN FINANSIAL UTAMA (4 PILAR BUDGETING) */}
        <div className="pt-4 sm:pt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Target Total Anggaran */}
            <div className="glass-inset rounded-lg p-3 sm:p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-stone-500 mb-1">
                <span>Target Anggaran</span>
                <button
                  type="button"
                  onClick={handleOpenTotalBudgetModal}
                  className="text-[10px] sm:text-[11px] text-stone-600 hover:text-stone-900 underline font-sans"
                >
                  Ubah
                </button>
              </div>
              <div className="text-base sm:text-2xl font-bold font-mono text-stone-900 tracking-tight truncate" title={formatCurrency(financials.totalBudget)}>
                {formatCurrency(financials.totalBudget)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                Pagu maksimal biaya
              </p>
            </div>

            {/* Sudah Dibayar (Realisasi Uang Keluar) */}
            <div className="glass-inset rounded-lg p-3 sm:p-4">
              <div className="text-[11px] sm:text-xs font-medium text-stone-500 mb-1 flex items-center justify-between">
                <span>Sudah Dibayar</span>
                <span className="text-[9px] sm:text-[10px] font-mono bg-emerald-100/70 text-emerald-800 px-1 py-0.5 rounded font-medium">
                  Kas
                </span>
              </div>
              <div className="text-base sm:text-2xl font-bold font-mono text-stone-900 tracking-tight truncate" title={formatCurrency(financials.totalPaid)}>
                {formatCurrency(financials.totalPaid)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                {allDisbursements.length} transaksi kas
              </p>
            </div>

            {/* Belum Dibayar (Komitmen & Rencana Belanja) */}
            <div className="glass-inset rounded-lg p-3 sm:p-4">
              <div className="text-[11px] sm:text-xs font-medium text-stone-500 mb-1 flex items-center justify-between">
                <span>Belum Dibayar</span>
                <span className="text-[9px] sm:text-[10px] font-mono bg-amber-100/70 text-amber-800 px-1 py-0.5 rounded font-medium">
                  {itemsStats.unpaidCount + itemsStats.dpCount} item
                </span>
              </div>
              <div className="text-base sm:text-2xl font-bold font-mono text-amber-800 tracking-tight truncate" title={formatCurrency(financials.totalCommitted)}>
                {formatCurrency(financials.totalCommitted)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                Rencana & sisa kontrak
              </p>
            </div>

            {/* Sisa Budget yang Masih Bebas */}
            <div
              className={`border rounded-lg p-3 sm:p-4 ${
                remaining < 0
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-emerald-50/40 border-emerald-200'
              }`}
            >
              <div className="text-[11px] sm:text-xs font-medium text-stone-600 mb-1 flex items-center justify-between">
                <span>Sisa Budget Bebas</span>
                <span
                  className={`text-[9px] sm:text-[10px] font-mono px-1 py-0.5 rounded ${
                    remaining < 0
                      ? 'bg-rose-100 text-rose-800 font-bold'
                      : 'bg-emerald-100 text-emerald-800 font-medium'
                  }`}
                >
                  {remaining < 0 ? 'Defisit' : 'Tersedia'}
                </span>
              </div>
              <div
                className={`text-base sm:text-2xl font-bold font-mono tracking-tight truncate ${
                  remaining < 0 ? 'text-rose-700' : 'text-stone-900'
                }`}
                title={formatCurrency(remaining)}
              >
                {formatCurrency(remaining)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                {remaining < 0
                  ? '⚠️ Melebihi batas anggaran'
                  : 'Dana aman belum teralokasi'}
              </p>
            </div>
          </div>

          {/* Bar Pemakaian Budget Keseluruhan */}
          <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1 max-w-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700">
                  Total Terpakai:{' '}
                  <span className="font-mono font-bold text-stone-900">
                    {formatCurrency(totalActual)}
                  </span>
                </span>
                <span className="font-mono text-stone-500 font-medium">
                  {utilizationPercentage.toFixed(1)}% dari Target
                </span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    utilizationPercentage > 100
                      ? 'bg-rose-500'
                      : utilizationPercentage > 85
                      ? 'bg-amber-500'
                      : 'bg-stone-800'
                  }`}
                  style={{ width: `${Math.min(100, utilizationPercentage)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${
                  utilizationPercentage > 100
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : utilizationPercentage > 85
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    utilizationPercentage > 100
                      ? 'bg-rose-500'
                      : utilizationPercentage > 85
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>
                  {utilizationPercentage > 100
                    ? 'Melebihi Target (Boncos)'
                    : utilizationPercentage > 85
                    ? 'Waspada (Mendekati Batas)'
                    : 'Kondisi Keuangan Aman'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PANDUAN PINTAR & TIPS CALON PENGANTIN */}
      <div className="bg-gradient-to-r from-emerald-50/60 via-pink-50/40 to-emerald-50/60 border border-emerald-200/60 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-800 text-white rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-pink-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-900 flex flex-wrap items-center gap-2">
              <span>Konsep Budgeting Fleksibel</span>
              <span className="text-[10px] font-mono bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-medium">
                {itemsStats.unpaidCount} Item Belum Bayar
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Anda bisa memasukkan item belanja (misal: <em>Beli Sepatu Seserahan</em>) dengan target budget terlebih dahulu. Saat barang dibeli, Anda bisa mengupdate pembayarannya dengan nominal riil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Apakah Anda ingin menerapkan proporsi pembagian standar pernikahan pada pos anggaran Anda?'
                )
              ) {
                applyRecommendedAllocation();
              }
            }}
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg border border-stone-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
            <span>Terapkan Proporsi Standar</span>
          </button>
        </div>
      </div>

      {/* 4. POS RENCANA BIAYA (RESPONSIVE CARDS PADA MOBILE, TABEL PADA DESKTOP) */}
      <div className="glass-strong rounded-xl overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              Rincian Pos Alokasi Biaya
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Pantau alokasi per pos kategori dan kelola item belanja/vendor di dalamnya.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setCategoryFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilterTab === 'all'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Semua Pos ({financials.categoryBreakdown.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilterTab('unpaid')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilterTab === 'unpaid'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Ada Belum Dibayar
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilterTab('over')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilterTab === 'over'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
            >
              Over Target ({categoryStats.overCount})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilterTab('safe')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilterTab === 'safe'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
            >
              Aman ({categoryStats.safeCount})
            </button>
          </div>
        </div>

        {/* MOBILE CARD VIEW: Nyaman & Ergonomis pada Ukuran Layar HP */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredCategoryBreakdown.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              Tidak ada pos biaya pada filter ini.
            </div>
          ) : (
            filteredCategoryBreakdown.map((item) => {
              const totalLineActual = item.paid + item.committed;
              const v = item.variance;
              const utilization =
                item.category.allocatedBudget > 0
                  ? Math.min(100, (totalLineActual / item.category.allocatedBudget) * 100)
                  : 0;
              const isExpanded = expandedCategoryId === item.category.id;

              return (
                <div key={item.category.id} className="p-4 space-y-3">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 text-sm truncate">
                          {item.category.name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {item.vendors.length} item terdaftar
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium border shrink-0 ${v.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${v.dotColor}`} />
                      <span>{v.label}</span>
                    </span>
                  </div>

                  {/* 2x2 Financial Metrics Grid on Mobile */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50/70 p-3 rounded-lg border border-stone-200/80">
                    <div>
                      <div className="text-[10px] text-stone-400">Target Rencana</div>
                      <div className="font-mono font-semibold text-stone-900 text-xs sm:text-sm truncate">
                        {formatCurrency(item.category.allocatedBudget)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Total Terpakai</div>
                      <div className="font-mono font-bold text-stone-900 text-xs sm:text-sm truncate">
                        {formatCurrency(totalLineActual)}
                      </div>
                      <div className="text-[9px] text-stone-400">{utilization.toFixed(0)}% terpakai</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Sudah Dibayar</div>
                      <div className="font-mono font-medium text-emerald-800 text-xs sm:text-sm truncate">
                        {formatCurrency(item.paid)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Sisa Pos</div>
                      <div
                        className={`font-mono font-semibold text-xs sm:text-sm truncate ${
                          item.available < 0 ? 'text-rose-700' : 'text-stone-800'
                        }`}
                      >
                        {formatCurrency(item.available)}
                      </div>
                      {item.available < 0 && (
                        <span className="text-[9px] text-rose-600 block">Over budget!</span>
                      )}
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className={`h-full ${utilization > 100 ? 'bg-rose-500' : 'bg-stone-800'}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>

                  {/* Actions & Accordion Button Row */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : item.category.id)}
                      className="text-xs text-stone-700 font-medium inline-flex items-center gap-1 hover:text-stone-900 p-1 -ml-1"
                    >
                      <span>{isExpanded ? 'Tutup rincian' : `Lihat rincian (${item.vendors.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenExpenseModal(item.category)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 text-white rounded text-[11px] font-medium transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Item</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditCategoryModal(item.category)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded"
                        title="Ubah Pos"
                        aria-label="Ubah Pos"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerDeleteCategory(item.category)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus Pos"
                        aria-label="Hapus Pos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Accordion Items */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-stone-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                        <span>Daftar Item Belanja di Pos Ini:</span>
                        <button
                          type="button"
                          onClick={() => handleOpenExpenseModal(item.category)}
                          className="text-[11px] text-stone-900 underline font-semibold"
                        >
                          + Tambah Item
                        </button>
                      </div>

                      {item.vendors.length === 0 ? (
                        <div className="py-3 text-center text-xs text-stone-400 glass-inset rounded border border-dashed">
                          Belum ada item belanja. Klik &quot;+ Item&quot; untuk menambahkan.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.vendors.map((v) => {
                            const vPaid = v.payments.reduce((s, p) => s + p.amount, 0);
                            const vBudget = v.estimatedBudget || v.totalContractValue;
                            const vRemaining = Math.max(0, v.totalContractValue - vPaid);
                            const isPaid = v.status === 'paid' || (v.totalContractValue > 0 && vPaid >= v.totalContractValue);
                            const isPartial = !isPaid && vPaid > 0;
                            const diff = vPaid - vBudget;

                            return (
                              <div
                                key={v.id}
                                className="p-3 glass-inset rounded-lg space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="font-semibold text-stone-900 text-xs">
                                      {v.name}
                                    </div>
                                    <div className="text-[10px] text-stone-400 mt-0.5">
                                      {v.notes || 'Tanpa catatan'}
                                    </div>
                                  </div>

                                  {isPaid ? (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                                      Lunas
                                    </span>
                                  ) : isPartial ? (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-50 text-pink-800 border border-pink-200 shrink-0">
                                      DP
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                      Belum Bayar
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-stone-600 font-mono glass-inset p-2 rounded">
                                  <div>
                                    <span className="text-stone-400 text-[10px] block">Target</span>
                                    <span>{formatCurrency(vBudget)}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 text-[10px] block">Dibayar</span>
                                    <span className="text-emerald-800 font-semibold">{formatCurrency(vPaid)}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 text-[10px] block">Sisa</span>
                                    <span className="text-stone-800 font-semibold">{formatCurrency(vRemaining)}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                  {isPaid && diff !== 0 ? (
                                    <span className={`text-[10px] font-medium ${diff < 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                      {diff < 0 ? `Hemat ${formatCurrency(Math.abs(diff))}` : `Over ${formatCurrency(diff)}`}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      {v.dueDate ? `Tenggat ${formatDateIndo(v.dueDate)}` : ''}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1.5 ml-auto">
                                    {!isPaid && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenSettleModal(v)}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-600 hover:bg-pink-700 text-white shadow-xs rounded text-[11px] font-medium"
                                      >
                                        <DollarSign className="w-3 h-3" />
                                        <span>Bayar</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditItemModal(v)}
                                      className="p-1 text-stone-400 hover:text-stone-700"
                                      aria-label="Ubah Item"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleTriggerDeleteItem(v)}
                                      className="p-1 text-stone-400 hover:text-rose-600"
                                      aria-label="Hapus Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Mobile Table Footer Summary Card */}
          <div className="p-4 bg-stone-100/70 border-t-2 border-stone-200 font-mono text-xs space-y-1.5">
            <div className="font-sans font-semibold text-stone-900 uppercase text-[10px]">
              Total Rekonsiliasi Seluruh Pos:
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Target Anggaran:</span>
              <span className="font-bold">{formatCurrency(financials.totalBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Sudah Dibayar:</span>
              <span className="font-bold text-emerald-800">{formatCurrency(financials.totalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Belum Dibayar:</span>
              <span className="font-bold text-amber-800">{formatCurrency(financials.totalCommitted)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-1">
              <span className="text-stone-700 font-sans font-medium">Sisa Anggaran Bebas:</span>
              <span className={`font-bold ${remaining < 0 ? 'text-rose-700' : 'text-stone-900'}`}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW: Rapi & Lengkap untuk Layar Lebar */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Pos Kebutuhan Biaya</th>
                <th className="py-3.5 px-4 font-semibold text-right">Target Rencana</th>
                <th className="py-3.5 px-4 font-semibold text-right">Sudah Dibayar</th>
                <th className="py-3.5 px-4 font-semibold text-right">Belum Dibayar</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Terpakai</th>
                <th className="py-3.5 px-4 font-semibold text-right">Sisa Pos</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status Pos</th>
                <th className="py-3.5 px-4 font-semibold text-right min-w-[140px]">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCategoryBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-stone-400">
                    Tidak ada pos biaya pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredCategoryBreakdown.map((item) => {
                  const totalLineActual = item.paid + item.committed;
                  const v = item.variance;
                  const utilization =
                    item.category.allocatedBudget > 0
                      ? Math.min(100, (totalLineActual / item.category.allocatedBudget) * 100)
                      : 0;
                  const isExpanded = expandedCategoryId === item.category.id;

                  return (
                    <React.Fragment key={item.category.id}>
                      <tr
                        className={`hover:bg-stone-50/80 transition-colors ${
                          isExpanded ? 'bg-stone-50/90' : ''
                        }`}
                      >
                        {/* Nama Pos */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.category.color || '#6366f1' }}
                            />
                            <div>
                              <div className="font-semibold text-stone-900 text-xs sm:text-sm">
                                {item.category.name}
                              </div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                                <span>{item.vendors.length} item/belanja</span>
                                <span>•</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedCategoryId(isExpanded ? null : item.category.id)
                                  }
                                  className="text-stone-700 hover:text-stone-900 font-medium inline-flex items-center gap-0.5"
                                >
                                  <span>{isExpanded ? 'Tutup rincian' : 'Lihat rincian'}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Target Rencana */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-stone-900">
                          {formatCurrency(item.category.allocatedBudget)}
                        </td>

                        {/* Sudah Dibayar */}
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-800 font-medium">
                          {formatCurrency(item.paid)}
                        </td>

                        {/* Belum Dibayar (Komitmen) */}
                        <td className="py-3.5 px-4 text-right font-mono text-stone-600">
                          {item.committed > 0 ? (
                            <span className="text-amber-800 font-medium">
                              {formatCurrency(item.committed)}
                            </span>
                          ) : (
                            <span className="text-stone-400">Rp 0 (Lunas)</span>
                          )}
                        </td>

                        {/* Total Terpakai */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                          <div>{formatCurrency(totalLineActual)}</div>
                          <div className="text-[10px] text-stone-400 font-sans">
                            {utilization.toFixed(0)}% terpakai
                          </div>
                        </td>

                        {/* Sisa Pos */}
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-semibold ${
                            item.available < 0 ? 'text-rose-700' : 'text-stone-800'
                          }`}
                        >
                          <div>{formatCurrency(item.available)}</div>
                          {item.available < 0 && (
                            <span className="text-[10px] text-rose-600 font-sans block">
                              Over budget!
                            </span>
                          )}
                        </td>

                        {/* Status Rencana Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium border ${v.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${v.dotColor}`} />
                            <span>{v.label}</span>
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Tombol Tambah Item di Pos Ini */}
                            <button
                              type="button"
                              onClick={() => handleOpenExpenseModal(item.category)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded text-[11px] font-medium shadow-2xs transition-colors"
                              title="Tambah Item Belanja / Catat Bayar di Pos ini"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Item</span>
                            </button>

                            {/* Tombol Ubah Pos */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategoryModal(item.category)}
                              className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                              title="Ubah Target & Nama Pos"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Hapus Pos */}
                            <button
                              type="button"
                              onClick={() => handleTriggerDeleteCategory(item.category)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus Pos Rencana"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ACCORDION RINCIAN ITEM BELANJA & VENDOR DALAM POS INI */}
                      {isExpanded && (
                        <tr className="bg-stone-50/90 border-t border-b border-stone-200">
                          <td colSpan={8} className="p-4 sm:px-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                                <span>Rincian Item Belanja & Vendor di Pos &quot;{item.category.name}&quot;</span>
                                <span className="text-[10px] font-mono text-stone-500 font-normal">
                                  ({item.vendors.length} item terdaftar)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenExpenseModal(item.category)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-900 hover:underline"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Tambah Item Belanja di Pos Ini</span>
                              </button>
                            </div>

                            {item.vendors.length === 0 ? (
                              <div className="py-4 text-center text-xs text-stone-400 glass-inset rounded border border-dashed">
                                Belum ada item belanja atau vendor terdaftar di pos ini. Klik tombol &quot;+ Tambah Item&quot; di atas untuk merencanakan belanjaan.
                              </div>
                            ) : (
                              <div className="glass-strong rounded-lg divide-y divide-stone-100 overflow-hidden text-xs">
                                {item.vendors.map((v) => {
                                  const vPaid = v.payments.reduce((s, p) => s + p.amount, 0);
                                  const vBudget = v.estimatedBudget || v.totalContractValue;
                                  const vRemaining = Math.max(0, v.totalContractValue - vPaid);
                                  const isPaid = v.status === 'paid' || (v.totalContractValue > 0 && vPaid >= v.totalContractValue);
                                  const isPartial = !isPaid && vPaid > 0;
                                  const diff = vPaid - vBudget;

                                  return (
                                    <div
                                      key={v.id}
                                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
                                    >
                                      <div>
                                        <div className="font-semibold text-stone-900 flex items-center gap-2 flex-wrap">
                                          <span>{v.name}</span>
                                          {/* Status Badge */}
                                          {isPaid ? (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                              Sudah Dibayar (Lunas)
                                            </span>
                                          ) : isPartial ? (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-50 text-pink-800 border border-pink-200">
                                              DP / Bertahap
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                              Belum Dibayar
                                            </span>
                                          )}

                                          {v.isDirectExpense && (
                                            <span className="text-[10px] text-stone-400 font-mono">
                                              Belanja Item
                                            </span>
                                          )}
                                        </div>

                                        {/* Financial Details Comparison */}
                                        <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap items-center gap-2">
                                          <span>
                                            Budget: <strong className="text-stone-700">{formatCurrency(vBudget)}</strong>
                                          </span>
                                          <span>•</span>
                                          <span>
                                            Sudah Dibayar: <strong className="text-emerald-800">{formatCurrency(vPaid)}</strong> ({v.payments.length}x)
                                          </span>

                                          {/* Difference if paid */}
                                          {isPaid && v.estimatedBudget && (
                                            <>
                                              <span>•</span>
                                              {diff < 0 ? (
                                                <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                                                  <TrendingDown className="w-3 h-3" />
                                                  Hemat {formatCurrency(Math.abs(diff))}
                                                </span>
                                              ) : diff > 0 ? (
                                                <span className="text-rose-600 font-medium inline-flex items-center gap-0.5">
                                                  <TrendingUp className="w-3 h-3" />
                                                  Over {formatCurrency(diff)}
                                                </span>
                                              ) : (
                                                <span className="text-stone-500 font-medium">
                                                  Sesuai Target
                                                </span>
                                              )}
                                            </>
                                          )}

                                          {/* Due date if unpaid */}
                                          {!isPaid && v.dueDate && (
                                            <>
                                              <span>•</span>
                                              <span className="text-stone-500">
                                                Target: {formatDateIndo(v.dueDate)}
                                              </span>
                                            </>
                                          )}

                                          {v.notes && (
                                            <>
                                              <span>•</span>
                                              <span className="text-stone-400 italic">
                                                {v.notes}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                        <div className="text-right">
                                          <div className="text-[11px] text-stone-400">
                                            Sisa Tagihan
                                          </div>
                                          <div className="font-mono font-bold text-stone-800">
                                            {formatCurrency(vRemaining)}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Pay / Settle Button if not paid */}
                                          {!isPaid && (
                                            <button
                                              type="button"
                                              onClick={() => handleOpenSettleModal(v)}
                                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white shadow-xs rounded font-medium text-[11px] transition-colors shadow-2xs"
                                              title="Update Status Sudah Dibayar"
                                            >
                                              <DollarSign className="w-3 h-3" />
                                              <span>Bayar / Lunasi</span>
                                            </button>
                                          )}

                                          {/* Edit Item */}
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditItemModal(v)}
                                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                                            title="Ubah Item Belanja"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Delete Item */}
                                          <button
                                            type="button"
                                            onClick={() => handleTriggerDeleteItem(v)}
                                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                            title="Hapus Item Belanja"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Table Footer: Total Reconciliation */}
            <tfoot className="bg-stone-50 border-t-2 border-stone-200 font-mono font-bold text-stone-900 text-xs">
              <tr>
                <td className="py-3.5 px-4 font-sans uppercase text-[11px]">Total Seluruh Pos</td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {formatCurrency(financials.totalBudget)}
                </td>
                <td className="py-3.5 px-4 text-right tabular-nums text-emerald-800">
                  {formatCurrency(financials.totalPaid)}
                </td>
                <td className="py-3.5 px-4 text-right tabular-nums text-amber-800">
                  {formatCurrency(financials.totalCommitted)}
                </td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {formatCurrency(totalActual)}
                </td>
                <td
                  className={`py-3.5 px-4 text-right tabular-nums ${
                    remaining < 0 ? 'text-rose-700' : 'text-stone-900'
                  }`}
                >
                  {formatCurrency(remaining)}
                </td>
                <td className="py-3.5 px-4 text-center font-sans">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${financials.overallVariance.badgeClass}`}
                  >
                    <span>{financials.overallVariance.label}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. TABS: DAFTAR SEMUA ITEM RENCANA & BELANJA VS BUKU KAS MUTASI */}
      <div className="glass-card rounded-xl p-4 sm:p-5 space-y-4">
        {/* Tab Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSection5Tab('items')}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                section5Tab === 'items'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Daftar Item ({allItemsWithAnalysis.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSection5Tab('cashflow')}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                section5Tab === 'cashflow'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Buku Kas ({allDisbursements.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenExpenseModal()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg text-xs font-medium transition-colors w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Item / Belanja</span>
          </button>
        </div>

        {/* TAB 1: DAFTAR ITEM & RENCANA BELANJA */}
        {section5Tab === 'items' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={itemsSearch}
                  onChange={(e) => setItemsSearch(e.target.value)}
                  placeholder="Cari item belanja..."
                  className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={itemsFilterStatus}
                  onChange={(e) => setItemsFilterStatus(e.target.value as 'all' | 'unpaid' | 'dp' | 'paid')}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="all">Semua Status Item ({allItemsWithAnalysis.length})</option>
                  <option value="unpaid">Belum Dibayar ({itemsStats.unpaidCount})</option>
                  <option value="dp">DP / Sebagian ({itemsStats.dpCount})</option>
                  <option value="paid">Sudah Lunas ({itemsStats.paidCount})</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={itemsCategoryFilter}
                  onChange={(e) => setItemsCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="all">Semua Pos Kategori</option>
                  {budgetCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Budget Items */}
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center text-xs text-stone-400 glass-inset rounded-lg border border-dashed">
                {allItemsWithAnalysis.length === 0 ? (
                  <div className="space-y-2">
                    <p>Belum ada item belanja atau vendor yang ditambahkan.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenExpenseModal()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Item Belanja Pertama</span>
                    </button>
                  </div>
                ) : (
                  'Tidak ada item yang cocok dengan pencarian atau filter Anda.'
                )}
              </div>
            ) : (
              <div className="divide-y divide-stone-100 text-xs">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors px-2 rounded-lg"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                          item.itemStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.itemStatus === 'dp'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.itemStatus === 'paid' ? (
                          <Check className="w-4 h-4" />
                        ) : item.itemStatus === 'dp' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-stone-900 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{item.name}</span>
                          <span className="text-[10px] font-sans px-2 py-0.2 rounded-full bg-stone-100 text-stone-600 font-normal">
                            {item.categoryName}
                          </span>

                          {/* Status Badge */}
                          {item.itemStatus === 'paid' ? (
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Lunas
                            </span>
                          ) : item.itemStatus === 'dp' ? (
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-pink-50 text-pink-800 border border-pink-200">
                              DP
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Belum Bayar
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>
                            Target: <strong className="text-stone-700 font-mono">{formatCurrency(item.budget)}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Realisasi: <strong className="text-emerald-800 font-mono">{formatCurrency(item.paid)}</strong>
                          </span>

                          {item.itemStatus === 'paid' && item.estimatedBudget && (
                            <>
                              <span>•</span>
                              {item.varianceAmount < 0 ? (
                                <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                                  <TrendingDown className="w-3 h-3" />
                                  Hemat {formatCurrency(Math.abs(item.varianceAmount))}
                                </span>
                              ) : item.varianceAmount > 0 ? (
                                <span className="text-rose-600 font-medium inline-flex items-center gap-0.5">
                                  <TrendingUp className="w-3 h-3" />
                                  Over +{formatCurrency(item.varianceAmount)}
                                </span>
                              ) : (
                                <span className="text-stone-500 font-medium">
                                  Sesuai
                                </span>
                              )}
                            </>
                          )}

                          {item.itemStatus !== 'paid' && (
                            <>
                              <span>•</span>
                              <span className="text-amber-800 font-medium">
                                Sisa: {formatCurrency(item.remainingUnpaid)}
                              </span>
                            </>
                          )}

                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="text-stone-400 italic truncate max-w-xs">{item.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* Action: Bayar / Lunasi Button if unpaid or partial */}
                      {item.itemStatus !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => handleOpenSettleModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white shadow-xs rounded-lg font-medium text-xs shadow-2xs transition-colors"
                          title="Update Status Sudah Dibayar"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Bayar / Lunasi</span>
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditItemModal(item)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Ubah Rencana Item"
                        aria-label="Ubah Rencana Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleTriggerDeleteItem(item)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Item"
                        aria-label="Hapus Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUKU KAS & MUTASI UANG KELUAR */}
        {section5Tab === 'cashflow' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Cari transaksi / kuitansi..."
                  className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Filter Kategori */}
              <div>
                <select
                  value={ledgerCategoryFilter}
                  onChange={(e) => setLedgerCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="all">Semua Pos Biaya</option>
                  {budgetCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Jenis */}
              <div>
                <select
                  value={ledgerTypeFilter}
                  onChange={(e) => setLedgerTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="all">Semua Jenis Pembayaran</option>
                  <option value="dp1">DP 1 (Uang Muka Pemesanan)</option>
                  <option value="dp2">DP 2 (Termin Berjalan)</option>
                  <option value="pelunasan">Pelunasan Akhir</option>
                  <option value="direct">Belanja Langsung / Kas</option>
                </select>
              </div>
            </div>

            {/* List of Disbursements */}
            {filteredDisbursements.length === 0 ? (
              <div className="py-10 text-center text-xs text-stone-400 glass-inset rounded-lg border border-dashed">
                {allDisbursements.length === 0 ? (
                  <div className="space-y-2">
                    <p>Belum ada catatan pembayaran atau pengeluaran kas.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenExpenseModal()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Pengeluaran Pertama</span>
                    </button>
                  </div>
                ) : (
                  'Tidak ada transaksi yang cocok dengan pencarian atau filter Anda.'
                )}
              </div>
            ) : (
              <div className="divide-y divide-stone-100 text-xs">
                {filteredDisbursements.map((d) => (
                  <div
                    key={d.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors px-2 rounded-lg"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-600 mt-0.5 sm:mt-0">
                        {d.isDirectExpense ? (
                          <ShoppingBag className="w-4 h-4 text-stone-600" />
                        ) : (
                          <Receipt className="w-4 h-4 text-stone-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{d.vendorName}</span>
                          <span className="text-[10px] font-sans px-2 py-0.2 rounded-full bg-stone-100 text-stone-600 font-normal">
                            {d.categoryName}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-mono uppercase font-semibold text-stone-700 bg-stone-100 px-1 rounded text-[10px]">
                            {d.isDirectExpense
                              ? 'Belanja Langsung'
                              : d.type === 'dp1'
                              ? 'DP 1'
                              : d.type === 'dp2'
                              ? 'DP 2'
                              : d.type === 'pelunasan'
                              ? 'Pelunasan'
                              : 'Biaya Tambahan'}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{d.notes || 'Pembayaran kas/transfer'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-left sm:text-right">
                        <div className="font-mono font-bold text-stone-900 tabular-nums text-sm">
                          {formatCurrency(d.amount)}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {formatDateIndo(d.paymentDate)}
                        </div>
                      </div>

                      {/* Tombol Hapus Pembayaran */}
                      <button
                        type="button"
                        onClick={() => handleTriggerDeletePayment(d)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus catatan pembayaran ini"
                        aria-label="Hapus Pembayaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: TAMBAH ITEM RENCANA / CATAT BELANJA (BUDGETING) */}
      {/* ======================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  Tambah Item Rencana / Belanja
                </h3>
                <p className="text-xs text-stone-500">
                  Rencanakan kebutuhan belanja acara dengan alokasi budget dan status bayar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB SELECTOR: ITEM BELANJA ATAU BAYAR VENDOR */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-stone-100 rounded-lg">
              <button
                type="button"
                onClick={() => setExpenseTab('direct')}
                className={`py-2 px-2 sm:px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  expenseTab === 'direct'
                    ? 'glass-inset text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="truncate">Item Belanja</span>
              </button>
              <button
                type="button"
                onClick={() => setExpenseTab('vendor')}
                className={`py-2 px-2 sm:px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  expenseTab === 'vendor'
                    ? 'glass-inset text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="truncate">Bayar Vendor</span>
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-4 text-xs">
              {/* TAB 1: ITEM RENCANA / BELANJA LANGSUNG (BUDGETING CONCEPT) */}
              {expenseTab === 'direct' ? (
                <>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Nama Kebutuhan / Item Belanja
                    </label>
                    <input
                      type="text"
                      value={directTitle}
                      onChange={(e) => setDirectTitle(e.target.value)}
                      placeholder="Contoh: Beli Sepatu Untuk Seserahan"
                      className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Pos Kategori Anggaran
                      </label>
                      <select
                        value={directCategoryId}
                        onChange={(e) => setDirectCategoryId(e.target.value)}
                        className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                        required
                      >
                        {budgetCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Target Estimasi Budget (Rp)
                      </label>
                      <input
                        type="number"
                        step={50000}
                        value={directBudgetAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDirectBudgetAmount(val);
                          if (!directIsPaid) {
                            setDirectPaidAmount(val);
                          }
                        }}
                        className="w-full px-3 py-2 font-mono text-sm font-semibold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                        required
                      />
                      <div className="text-[11px] text-stone-500 font-mono mt-1">
                        Terbilang: {formatCurrency(directBudgetAmount)}
                      </div>
                    </div>
                  </div>

                  {/* STATUS PEMBAYARAN: PILIHAN UTAMA BUDGETING */}
                  <div className="p-3 glass-inset rounded-lg space-y-2.5">
                    <label className="block font-semibold text-stone-900 text-xs">
                      Status Pembayaran Item Ini:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Opsi 1: Belum Dibayar (Default Budgeting) */}
                      <button
                        type="button"
                        onClick={() => setDirectIsPaid(false)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          !directIsPaid
                            ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
                            : "bg-white/70 border-white/60 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              !directIsPaid
                                ? 'border-amber-600 bg-amber-600'
                                : 'border-stone-400'
                            }`}
                          >
                            {!directIsPaid && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="font-semibold text-xs text-stone-900">
                            ⏳ Belum Dibayar
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          Masuk alokasi rencana budget. Realisasi bayar diupdate nanti saat beli.
                        </p>
                      </button>

                      {/* Opsi 2: Sudah Dibayar Sekarang */}
                      <button
                        type="button"
                        onClick={() => {
                          setDirectIsPaid(true);
                          setDirectPaidAmount(directBudgetAmount);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          directIsPaid
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                            : "bg-white/70 border-white/60 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              directIsPaid
                                ? 'border-emerald-600 bg-emerald-600'
                                : 'border-stone-400'
                            }`}
                          >
                            {directIsPaid && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="font-semibold text-xs text-stone-900">
                            ✅ Sudah Dibayar
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          Item sudah dibeli & lunas saat ini. Uang langsung keluar di buku kas.
                        </p>
                      </button>
                    </div>

                    {/* Conditional Fields based on isPaid */}
                    {!directIsPaid ? (
                      <div className="pt-2 text-stone-600 text-[11px] space-y-2">
                        <div className="flex items-start gap-1.5 text-amber-800 bg-amber-100/60 px-2.5 py-1.5 rounded-md">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            Item ini akan tersimpan dengan target <strong>{formatCurrency(directBudgetAmount)}</strong> dan sisa tagihan penuh. Nanti Anda bisa klik tombol <strong>Bayar / Lunasi</strong> untuk memasukkan nominal bayar riil.
                          </span>
                        </div>

                        <div>
                          <label className="block font-medium text-stone-700 mb-1">
                            Estimasi Tanggal Pembelian (Opsional)
                          </label>
                          <input
                            type="date"
                            value={directDueDate}
                            onChange={(e) => setDirectDueDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      /* If already paid now, show payment inputs & live comparison */
                      <div className="pt-2 border-t border-stone-200 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-stone-800">
                              Nominal Riil yang Dibayarkan (Rp)
                            </label>
                            {directPaidAmount !== directBudgetAmount && (
                              <button
                                type="button"
                                onClick={() => setDirectPaidAmount(directBudgetAmount)}
                                className="text-[10px] text-stone-600 hover:text-stone-900 underline"
                              >
                                Samakan Budget
                              </button>
                            )}
                          </div>
                          <input
                            type="number"
                            step={10000}
                            value={directPaidAmount}
                            onChange={(e) => setDirectPaidAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 font-mono text-sm font-bold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                            required
                          />

                          {/* Live Variance Comparison */}
                          <div className="mt-1.5">
                            {directPaidAmount === directBudgetAmount ? (
                              <div className="text-[11px] text-stone-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Nominal bayar sama persis dengan target budget ({formatCurrency(directBudgetAmount)})</span>
                              </div>
                            ) : directPaidAmount < directBudgetAmount ? (
                              <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 font-medium">
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  🎉 Lebih HEMAT {formatCurrency(directBudgetAmount - directPaidAmount)} dari estimasi awal!
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-rose-800 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1 font-medium">
                                <TrendingUp className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>
                                  ⚠️ Melebihi estimasi awal +{formatCurrency(directPaidAmount - directBudgetAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium text-stone-700 mb-1">
                            Tanggal Pembayaran Kas
                          </label>
                          <input
                            type="date"
                            value={directPaymentDate}
                            onChange={(e) => setDirectPaymentDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Catatan / Toko / Keterangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={directNotes}
                      onChange={(e) => setDirectNotes(e.target.value)}
                      placeholder="Contoh: Toko Sepatu Jaya Mall Kelapa Gading"
                      className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </>
              ) : (
                /* TAB 2: VENDOR PAYMENT FIELDS */
                <>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Pilih Vendor yang Ingin Dibayar
                    </label>
                    {vendors.length === 0 ? (
                      <div className="p-3 glass-inset rounded text-stone-500">
                        Belum ada vendor terdaftar.{' '}
                        <button
                          type="button"
                          onClick={() => setExpenseTab('direct')}
                          className="text-stone-900 underline font-semibold ml-1"
                        >
                          Catat sebagai item belanja saja
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                        className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                        required
                      >
                        {vendors.map((v) => {
                          const paid = v.payments.reduce((s, p) => s + p.amount, 0);
                          const rem = Math.max(0, v.totalContractValue - paid);
                          return (
                            <option key={v.id} value={v.id}>
                              {v.name} (Sisa: {formatCurrency(rem)})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Jenis Termin Pembayaran
                      </label>
                      <select
                        value={vendorPaymentType}
                        onChange={(e) => setVendorPaymentType(e.target.value as PaymentType)}
                        className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                      >
                        <option value="dp1">DP 1 (Uang Muka)</option>
                        <option value="dp2">DP 2 (Termin Berjalan)</option>
                        <option value="pelunasan">Pelunasan Akhir</option>
                        <option value="adhoc">Biaya Tambahan / Ad-hoc</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Tanggal Pembayaran
                      </label>
                      <input
                        type="date"
                        value={vendorPaymentDate}
                        onChange={(e) => setVendorPaymentDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Nominal yang Dibayarkan (Rp)
                    </label>
                    <input
                      type="number"
                      step={100000}
                      value={vendorPaymentAmount}
                      onChange={(e) => setVendorPaymentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 font-mono text-sm font-semibold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                      required
                    />
                    <div className="text-[11px] text-stone-500 font-mono mt-1">
                      Terbilang: {formatCurrency(vendorPaymentAmount)}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Catatan Bukti Transfer / No. Referensi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={vendorPaymentNotes}
                      onChange={(e) => setVendorPaymentNotes(e.target.value)}
                      placeholder="Contoh: Transfer via BCA ref #98328"
                      className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  {expenseTab === 'direct'
                    ? directIsPaid
                      ? 'Simpan & Catat Pembayaran'
                      : 'Simpan Rencana (Belum Bayar)'
                    : 'Simpan Catatan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CATAT PEMBAYARAN ITEM (BAYAR / LUNASI) */}
      {/* ======================================================== */}
      {isSettleModalOpen && settlingItem && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  Catat Pembayaran Item
                </h3>
                <p className="text-xs text-stone-500">
                  Perbarui status pembayaran dan catat realisasi pengeluaran riil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSettleModalOpen(false);
                  setSettlingItem(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Information Card */}
            <div className="mt-4 p-3 glass-inset rounded-lg space-y-1">
              <div className="text-xs font-bold text-stone-900">
                {settlingItem.name}
              </div>
              <div className="text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-1">
                <span>
                  Pos: {budgetCategories.find((c) => c.id === settlingItem.categoryId)?.name || 'Umum'}
                </span>
                <span>
                  Target:{' '}
                  <strong className="text-stone-800 font-mono">
                    {formatCurrency(settlingItem.estimatedBudget || settlingItem.totalContractValue)}
                  </strong>
                </span>
              </div>
              {settlingItem.payments.length > 0 && (
                <div className="text-[11px] text-pink-700 font-medium">
                  Sudah dibayar sebelumnya: {formatCurrency(settlingItem.payments.reduce((s, p) => s + p.amount, 0))}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSettlePayment} className="mt-4 space-y-4 text-xs">
              {/* Pilihan Pelunasan Penuh vs Pembayaran Bertahap */}
              <div className="space-y-1.5">
                <label className="block font-medium text-stone-700">Tipe Pelunasan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleIsFull(true)}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      settleIsFull
                        ? 'bg-emerald-800 text-white border-stone-900'
                        : "bg-white/70 border-white/60 hover:bg-stone-50"
                    }`}
                  >
                    Pelunasan Penuh (Lunas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleIsFull(false)}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      !settleIsFull
                        ? 'bg-emerald-800 text-white border-stone-900'
                        : "bg-white/70 border-white/60 hover:bg-stone-50"
                    }`}
                  >
                    Bayar Sebagian (DP)
                  </button>
                </div>
              </div>

              {/* Input Nominal Bayar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-800">
                    Nominal yang Dibayarkan (Rp)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const budget = settlingItem.estimatedBudget || settlingItem.totalContractValue;
                      const paidSoFar = settlingItem.payments.reduce((s, p) => s + p.amount, 0);
                      setSettleAmount(Math.max(0, budget - paidSoFar));
                    }}
                    className="text-[10px] text-stone-600 hover:text-stone-900 underline"
                  >
                    Reset ke Budget
                  </button>
                </div>
                <input
                  type="number"
                  step={10000}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm font-bold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                />

                {/* Real-time Variance Comparison with Budget */}
                {(() => {
                  const initialBudget = settlingItem.estimatedBudget || settlingItem.totalContractValue;
                  const alreadyPaid = settlingItem.payments.reduce((s, p) => s + p.amount, 0);
                  const totalPaidAfter = alreadyPaid + settleAmount;
                  const diff = totalPaidAfter - initialBudget;

                  return (
                    <div className="mt-2">
                      {settleIsFull && (
                        <>
                          {diff === 0 ? (
                            <div className="text-[11px] text-stone-600 glass-inset p-2 rounded flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                              <span>Realisasi pembayaran tepat sesuai target budget ({formatCurrency(initialBudget)}).</span>
                            </div>
                          ) : diff < 0 ? (
                            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
                              <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                🎉 Lebih HEMAT {formatCurrency(Math.abs(diff))} dari target budget awal!
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 flex items-center gap-1.5 font-medium">
                              <TrendingUp className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>
                                ⚠️ Melebihi estimasi awal +{formatCurrency(diff)} (Budget: {formatCurrency(initialBudget)}).
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  value={settleDate}
                  onChange={(e) => setSettleDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Catatan / Kuitansi / Bukti Bayar (Opsional)
                </label>
                <input
                  type="text"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  placeholder="Contoh: Transfer BCA kuitansi #8762"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettleModalOpen(false);
                    setSettlingItem(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm text-center"
                >
                  Simpan & Tandai Sudah Dibayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: UBAH ITEM RENCANA BELANJA */}
      {/* ======================================================== */}
      {isEditItemModalOpen && editingBudgetItem && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Ubah Item Rencana Belanja
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditItemModalOpen(false);
                  setEditingBudgetItem(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Item Kebutuhan
                </label>
                <input
                  type="text"
                  value={editItemTitle}
                  onChange={(e) => setEditItemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Pos Kategori
                </label>
                <select
                  value={editItemCategoryId}
                  onChange={(e) => setEditItemCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                >
                  {budgetCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Target Alokasi Budget (Rp)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={editItemBudget}
                  onChange={(e) => setEditItemBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm font-semibold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <div className="text-[11px] text-stone-500 font-mono mt-1">
                  Terbilang: {formatCurrency(editItemBudget)}
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Target Tanggal Belanja (Opsional)
                </label>
                <input
                  type="date"
                  value={editItemDueDate}
                  onChange={(e) => setEditItemDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={editItemNotes}
                  onChange={(e) => setEditItemNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditItemModalOpen(false);
                    setEditingBudgetItem(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: TAMBAH / UBAH POS ANGGARAN (DENGAN PRESET CEPAT) */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  {editingCategory ? 'Ubah Pos Rencana Biaya' : 'Tambah Pos Rencana Baru'}
                </h3>
                <p className="text-xs text-stone-500">
                  {editingCategory
                    ? 'Sesuaikan nama atau pagu target anggaran untuk pos ini.'
                    : 'Pilih rekomendasi pos pernikahan atau buat pos khusus sendiri.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Chips */}
            {!editingCategory && (
              <div className="mt-4">
                <label className="block text-[11px] font-medium text-stone-500 mb-1.5 uppercase font-mono">
                  Rekomendasi Cepat Pos Pernikahan:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 glass-inset rounded-lg">
                  {CATEGORY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setCatName(preset.name);
                        setCatBudget(preset.defaultBudget);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 glass-inset hover:bg-white/80 rounded-md text-[11px] text-stone-800 transition-colors"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Pos Kebutuhan
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Katering & Prasmanan"
                  className="w-full px-3 py-2 text-sm sm:text-xs glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-stone-700">Target Alokasi Biaya (Rp)</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCatBudget((prev) => prev + 5000000)}
                      className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-mono"
                    >
                      +5 Jt
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatBudget((prev) => prev + 10000000)}
                      className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-mono"
                    >
                      +10 Jt
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step={500000}
                  value={catBudget}
                  onChange={(e) => setCatBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm font-semibold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <div className="text-[11px] text-stone-500 font-mono mt-1">
                  Terbilang: {formatCurrency(catBudget)}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambahkan Pos Biaya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: UBAH TOTAL TARGET ANGGARAN ACARA */}
      {/* ======================================================== */}
      {isTotalBudgetModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Ubah Total Target Anggaran Acara
              </h3>
              <button
                type="button"
                onClick={() => setIsTotalBudgetModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTotalBudget} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Target Anggaran Keseluruhan (Rp)
                </label>
                <input
                  type="number"
                  step={5000000}
                  value={eventTotalBudget}
                  onChange={(e) => setEventTotalBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm font-semibold glass-input rounded-lg focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <div className="text-[11px] text-stone-500 font-mono mt-1">
                  {formatCurrency(eventTotalBudget)}
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRebalanceAfterSave}
                    onChange={(e) => setAutoRebalanceAfterSave(e.target.checked)}
                    className="mt-0.5 rounded text-stone-900 focus:ring-emerald-700"
                  />
                  <span className="text-[11px] text-stone-600 leading-snug">
                    Sesuaikan proporsi pos-pos anggaran secara otomatis mengikuti target baru ini.
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsTotalBudgetModalOpen(false)}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm text-center"
                >
                  Terapkan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: KONFIRMASI HAPUS (AMAN UNTUK USER AWAM) */}
      {/* ======================================================== */}
      {isDeleteConfirmOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4">
          <div className="glass-modal rounded-2xl max-w-sm w-full p-4 sm:p-6 text-xs">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-full">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">
                Konfirmasi Hapus{' '}
                {deleteTarget.type === 'category'
                  ? 'Pos Rencana'
                  : deleteTarget.type === 'item'
                  ? 'Item Belanja'
                  : 'Pembayaran'}
              </h3>
            </div>

            <p className="text-stone-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold text-stone-900">&quot;{deleteTarget.title}&quot;</span>?
              {deleteTarget.type === 'category'
                ? ' Pos ini akan dihapus dari daftar anggaran Anda.'
                : deleteTarget.type === 'item'
                ? ' Item belanja ini akan dihapus dari rencana anggaran.'
                : ' Catatan transaksi ini akan dihapus dan sisa pagu akan disesuaikan secara otomatis.'}
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-4 mt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setDeleteTarget(null);
                }}
                className="w-full sm:w-auto px-3.5 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-lg text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-3.5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm text-center"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
