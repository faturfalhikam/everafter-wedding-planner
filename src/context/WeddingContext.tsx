'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  WeddingEvent,
  BudgetCategory,
  EventTask,
  Vendor,
  VendorPayment,
  Guest,
  UserSession,
  UserRole,
  EventType,
  EventTheme,
} from '@/types/wedding';
import { WEDDING_TEMPLATE, ENGAGEMENT_TEMPLATE } from '@/data/templates';
import { calculateDeadline, calculateBudgetVariance, BudgetVarianceResult } from '@/lib/weddingUtils';
import {
  supabase,
  isSupabaseConfigured,
  saveWeddingPlanToSupabase,
  fetchWeddingPlanFromSupabase,
  fetchLatestWeddingPlanFromSupabase,
  generateShareCode,
  WeddingPlanRecord,
} from '@/lib/supabase';

export interface WizardInput {
  type: EventType;
  eventDate: string;
  totalBudget: number;
  estimatedGuests: number;
  theme: EventTheme;
  title?: string;
  ownerName: string;
  partnerName?: string;
}

interface WeddingContextType {
  event: WeddingEvent | null;
  tasks: EventTask[];
  budgetCategories: BudgetCategory[];
  vendors: Vendor[];
  guests: Guest[];
  currentUser: UserSession;
  partnerUser: UserSession | null;
  isOnboarded: boolean;
  isLoading: boolean;

  // Cloud & Sync state
  isCloudConfigured: boolean;
  isSyncing: boolean;
  cloudShareCode: string;
  lastSyncedAt: Date | null;
  syncError: string | null;
  loadPlanFromCloud: (identifier: string) => Promise<{ success: boolean; message?: string }>;
  syncNow: () => Promise<{ success: boolean; message?: string }>;

  // Actions
  completeOnboarding: (data: WizardInput) => void;
  updateEventDetails: (data: Partial<WeddingEvent>) => void;
  addTask: (task: Omit<EventTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<EventTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateBudgetCategory: (id: string, allocatedBudget: number, name?: string) => void;
  addBudgetCategory: (name: string, allocatedBudget: number, color?: string) => void;
  deleteBudgetCategory: (id: string) => void;
  addBudgetItem: (item: {
    categoryId: string;
    title: string;
    budgetAmount: number;
    isPaid: boolean;
    paidAmount?: number;
    paymentDate?: string;
    dueDate?: string;
    notes?: string;
  }) => void;
  updateBudgetItem: (
    id: string,
    updates: {
      title?: string;
      categoryId?: string;
      budgetAmount?: number;
      dueDate?: string;
      notes?: string;
    }
  ) => void;
  settleBudgetItemPayment: (
    id: string,
    payment: {
      amount: number;
      paymentDate: string;
      isFullPayment: boolean;
      notes?: string;
    }
  ) => void;
  addDirectExpense: (
    categoryId: string,
    title: string,
    amount: number,
    paymentDate: string,
    notes?: string
  ) => void;
  applyRecommendedAllocation: () => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'payments'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  addVendorPayment: (vendorId: string, payment: Omit<VendorPayment, 'id' | 'vendorId'>) => void;
  deleteVendorPayment: (vendorId: string, paymentId: string) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  switchActiveUserRole: (role: UserRole) => void;
  invitePartner: (name: string, email: string) => void;
  resetAllData: () => void;

  // Computed Summaries
  financials: {
    totalBudget: number;
    totalPaid: number;
    totalCommitted: number;
    totalAvailable: number;
    overallVariance: BudgetVarianceResult;
    categoryBreakdown: {
      category: BudgetCategory;
      paid: number;
      committed: number;
      available: number;
      variance: BudgetVarianceResult;
      vendors: Vendor[];
    }[];
  };
  tasksSummary: {
    total: number;
    completed: number;
    pending: number;
    percentComplete: number;
    upcomingTasks: EventTask[];
  };
  guestsSummary: {
    totalGuests: number;
    totalPax: number;
    confirmedPax: number;
    pendingPax: number;
    declinedPax: number;
  };
}

const STORAGE_KEY = 'wedding_planner_mvp_state_v1';
const SHARE_CODE_KEY = 'wedding_planner_share_code_v1';

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'user-owner',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    role: 'owner',
  });
  const [partnerUser, setPartnerUser] = useState<UserSession | null>(null);

  // Cloud sync state
  const isCloudConfigured = isSupabaseConfigured();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cloudShareCode, setCloudShareCode] = useState<string>('');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Ref to track last local save ISO string to avoid echo feedback from Supabase realtime
  const lastSyncTimeRef = useRef<string>('');
  const isRemoteUpdateRef = useRef<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Share Code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SHARE_CODE_KEY);
      if (stored) {
        setCloudShareCode(stored);
      } else {
        const newCode = generateShareCode();
        setCloudShareCode(newCode);
        localStorage.setItem(SHARE_CODE_KEY, newCode);
      }
    }
  }, []);

  // Initial Data Load (URL parameter or localStorage)
  useEffect(() => {
    const initData = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Check if user opened a shared link (e.g., ?plan=WED-XXXX or ?plan=event-123)
        const params = new URLSearchParams(window.location.search);
        const planParam = params.get('plan');

        if (planParam && isSupabaseConfigured()) {
          setIsSyncing(true);
          const { plan } = await fetchWeddingPlanFromSupabase(planParam.trim());
          setIsSyncing(false);

          if (plan) {
            setEvent(plan.event);
            setTasks(plan.tasks || []);
            setBudgetCategories(plan.budget_categories || []);
            setVendors(plan.vendors || []);
            setGuests(plan.guests || []);
            if (plan.partner_user) setPartnerUser(plan.partner_user);
            if (plan.share_code) {
              setCloudShareCode(plan.share_code);
              localStorage.setItem(SHARE_CODE_KEY, plan.share_code);
            }
            setIsOnboarded(true);
            setLastSyncedAt(new Date());

            // If param has ?role=editor, switch to editor view
            const roleParam = params.get('role');
            if (roleParam === 'editor') {
              setCurrentUser((prev) => ({
                ...prev,
                role: 'editor',
                name: plan.partner_user?.name || plan.event?.partnerName || 'Pasangan',
              }));
            }

            setIsLoading(false);
            return;
          }
        }

        // Auto-load latest plan from Supabase Cloud if configured
        if (isSupabaseConfigured()) {
          const storedShareCode = localStorage.getItem(SHARE_CODE_KEY);
          const { plan } = storedShareCode
            ? await fetchWeddingPlanFromSupabase(storedShareCode)
            : await fetchLatestWeddingPlanFromSupabase();

          if (plan && plan.event && plan.event.id) {
            setEvent(plan.event);
            setTasks(plan.tasks || []);
            setBudgetCategories(plan.budget_categories || []);
            setVendors(plan.vendors || []);
            setGuests(plan.guests || []);
            if (plan.partner_user) setPartnerUser(plan.partner_user);
            if (plan.share_code) {
              setCloudShareCode(plan.share_code);
              localStorage.setItem(SHARE_CODE_KEY, plan.share_code);
            }
            if (plan.event?.ownerName) {
              setCurrentUser((prev) => ({
                ...prev,
                name: plan.event.ownerName,
                role: 'owner',
              }));
            }
            isRemoteUpdateRef.current = true;
            lastSyncTimeRef.current = plan.updated_at || '';
            setIsOnboarded(true);
            setLastSyncedAt(new Date());
            setIsLoading(false);
            return;
          }
        }

        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.event) {
            setEvent(parsed.event);
            setTasks(parsed.tasks || []);
            setBudgetCategories(parsed.budgetCategories || []);
            setVendors(parsed.vendors || []);
            setGuests(parsed.guests || []);
            setCurrentUser(parsed.currentUser || currentUser);
            setPartnerUser(parsed.partnerUser || null);
            setIsOnboarded(true);
          }
        }
      } catch (e) {
        console.error('Failed to initialize wedding planner data', e);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Function to perform immediate save to Supabase
  const performCloudSync = useCallback(
    async (
      currentEvent: WeddingEvent,
      currentTasks: EventTask[],
      currentCats: BudgetCategory[],
      currentVendors: Vendor[],
      currentGuests: Guest[],
      currentPartner: UserSession | null,
      code: string
    ) => {
      if (!isSupabaseConfigured()) return;

      setIsSyncing(true);
      setSyncError(null);
      const nowIso = new Date().toISOString();
      lastSyncTimeRef.current = nowIso;

      const record: WeddingPlanRecord = {
        id: currentEvent.id,
        share_code: code || currentEvent.id,
        title: currentEvent.title || 'Rencana Pernikahan',
        event: currentEvent,
        tasks: currentTasks,
        budget_categories: currentCats,
        vendors: currentVendors,
        guests: currentGuests,
        partner_user: currentPartner,
        updated_at: nowIso,
      };

      const res = await saveWeddingPlanToSupabase(record);
      setIsSyncing(false);

      if (res.success) {
        setLastSyncedAt(new Date());
      } else {
        setSyncError(res.error || 'Gagal menyimpan ke cloud');
      }
    },
    []
  );

  // Save to local storage & debounced sync to Supabase whenever state changes
  useEffect(() => {
    if (!isLoading && isOnboarded && event) {
      // 1. Save locally
      const stateToSave = {
        event,
        tasks,
        budgetCategories,
        vendors,
        guests,
        currentUser,
        partnerUser,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

      // 2. Debounced save to Supabase (if configured and not an incoming remote update)
      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }
      if (isSupabaseConfigured()) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          performCloudSync(
            event,
            tasks,
            budgetCategories,
            vendors,
            guests,
            partnerUser,
            cloudShareCode
          );
        }, 1200); // 1.2s debounce
      }
    }

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    event,
    tasks,
    budgetCategories,
    vendors,
    guests,
    currentUser,
    partnerUser,
    isOnboarded,
    isLoading,
    cloudShareCode,
    performCloudSync,
  ]);

  // Realtime Supabase Subscription: Listen for changes made by partner
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || !event?.id) return;
    const client = supabase;

    const channelName = `realtime-plan-${event.id}`;
    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wedding_plans',
          filter: `id=eq.${event.id}`,
        },
        (payload: any) => {
          const newRecord = payload.new as WeddingPlanRecord;
          // Avoid feedback loop if update originated from this client
          if (newRecord && newRecord.updated_at !== lastSyncTimeRef.current) {
            isRemoteUpdateRef.current = true;
            lastSyncTimeRef.current = newRecord.updated_at || '';
            if (newRecord.event) setEvent(newRecord.event);
            if (newRecord.tasks) setTasks(newRecord.tasks);
            if (newRecord.budget_categories) setBudgetCategories(newRecord.budget_categories);
            if (newRecord.vendors) setVendors(newRecord.vendors);
            if (newRecord.guests) setGuests(newRecord.guests);
            if (newRecord.partner_user) setPartnerUser(newRecord.partner_user);
            setLastSyncedAt(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [event?.id]);

  // Load a plan explicitly from cloud via code or ID
  const loadPlanFromCloud = async (identifier: string): Promise<{ success: boolean; message?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase belum dikonfigurasi pada file .env.local' };
    }

    const cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, message: 'Masukkan kode rencana pernikahan atau ID yang valid' };
    }

    setIsSyncing(true);
    const { plan, error } = await fetchWeddingPlanFromSupabase(cleanId);
    setIsSyncing(false);

    if (error || !plan) {
      return { success: false, message: error || 'Rencana pernikahan tidak ditemukan' };
    }

    // Apply loaded plan to state
    setEvent(plan.event);
    setTasks(plan.tasks || []);
    setBudgetCategories(plan.budget_categories || []);
    setVendors(plan.vendors || []);
    setGuests(plan.guests || []);
    if (plan.partner_user) setPartnerUser(plan.partner_user);
    if (plan.share_code) {
      setCloudShareCode(plan.share_code);
      localStorage.setItem(SHARE_CODE_KEY, plan.share_code);
    }
    setIsOnboarded(true);
    setLastSyncedAt(new Date());

    return { success: true, message: `Berhasil memuat rencana: "${plan.title}"` };
  };

  // Immediate manual trigger for syncNow
  const syncNow = async (): Promise<{ success: boolean; message?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase belum dikonfigurasi pada .env.local' };
    }
    if (!event) {
      return { success: false, message: 'Belum ada data rencana pernikahan untuk disinkronkan' };
    }

    await performCloudSync(
      event,
      tasks,
      budgetCategories,
      vendors,
      guests,
      partnerUser,
      cloudShareCode
    );
    return { success: true, message: 'Data berhasil disinkronkan ke Supabase Cloud!' };
  };

  // Onboarding Wizard Processing
  const completeOnboarding = (input: WizardInput) => {
    const template = input.type === 'wedding' ? WEDDING_TEMPLATE : ENGAGEMENT_TEMPLATE;
    const eventId = `event-${Date.now()}`;
    const newShareCode = cloudShareCode || generateShareCode();
    setCloudShareCode(newShareCode);
    localStorage.setItem(SHARE_CODE_KEY, newShareCode);

    const newEvent: WeddingEvent = {
      id: eventId,
      title:
        input.title ||
        (input.type === 'wedding'
          ? `Pernikahan ${input.ownerName} & ${input.partnerName || 'Pasangan'}`
          : `Lamaran ${input.ownerName} & ${input.partnerName || 'Pasangan'}`),
      type: input.type,
      eventDate: input.eventDate,
      totalBudget: input.totalBudget,
      estimatedGuests: input.estimatedGuests,
      theme: input.theme,
      status: 'planning',
      ownerName: input.ownerName,
      partnerName: input.partnerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate categories with default percentage allocation
    const newCategories: BudgetCategory[] = template.defaultBudgetAllocations.map((alloc, idx) => ({
      id: `cat-${idx}-${Date.now()}`,
      name: alloc.categoryName,
      allocatedBudget: Math.round((input.totalBudget * alloc.percentage) / 100),
      color: alloc.color,
    }));

    // Generate tasks with dynamic H-X days calculated from eventDate
    const newTasks: EventTask[] = template.defaultTasks.map((t, idx) => ({
      id: `task-${idx}-${Date.now()}`,
      title: t.title,
      category: t.category,
      relativeDaysBeforeEvent: t.relativeDaysBeforeEvent,
      deadlineDate: calculateDeadline(input.eventDate, t.relativeDaysBeforeEvent),
      isCompleted: false,
      priority: t.priority,
    }));

    // Initial default demo vendors linked to categories
    const initialVendors: Vendor[] = [
      {
        id: `vendor-1-${Date.now()}`,
        categoryId: newCategories[0]?.id || 'cat-0',
        name: input.type === 'wedding' ? 'Grand Ballroom & Catering Mulia' : 'Resto Heritage Pavilion',
        contactPerson: 'Pak Hendra (Sales)',
        phone: '081234567890',
        totalContractValue: Math.round(newCategories[0]?.allocatedBudget * 0.95),
        estimatedBudget: newCategories[0]?.allocatedBudget,
        status: 'booked',
        notes: 'Termasuk sewa hall 4 jam & 400 porsi buffet',
        payments: [
          {
            id: `pay-1-${Date.now()}`,
            vendorId: `vendor-1-${Date.now()}`,
            amount: Math.round(newCategories[0]?.allocatedBudget * 0.3),
            paymentDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            type: 'dp1',
            notes: 'Down Payment (DP) 30% pengikatan tanggal gedung',
          },
        ],
      },
      {
        id: `vendor-2-${Date.now()}`,
        categoryId: newCategories[1]?.id || 'cat-1',
        name: 'Harmoni & Rekan Decoration',
        contactPerson: 'Mbak Cindy',
        phone: '081987654321',
        totalContractValue: Math.round(newCategories[1]?.allocatedBudget * 0.9),
        estimatedBudget: newCategories[1]?.allocatedBudget,
        status: 'negotiation',
        notes: `Konsep ${input.theme === 'traditional' ? 'Adat Modern' : input.theme === 'outdoor' ? 'Rustic Garden' : 'Modern Elegant'}`,
        payments: [],
      },
    ];

    // Seed sample guests
    const initialGuests: Guest[] = [
      {
        id: `guest-1-${Date.now()}`,
        name: 'Keluarga Besar Bpk. Ahmad',
        group: 'Keluarga',
        pax: 4,
        rsvpStatus: 'confirmed',
        phone: '081211112222',
        notes: 'VIP Baris Pertama',
      },
      {
        id: `guest-2-${Date.now()}`,
        name: 'Dimas Setiawan & Partner',
        group: 'Teman',
        pax: 2,
        rsvpStatus: 'pending',
        phone: '081322223333',
      },
    ];

    const partner: UserSession | null = input.partnerName
      ? {
          id: 'user-partner',
          name: input.partnerName,
          email: `${input.partnerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          role: 'editor',
        }
      : null;

    setEvent(newEvent);
    setBudgetCategories(newCategories);
    setTasks(newTasks);
    setVendors(initialVendors);
    setGuests(initialGuests);
    setPartnerUser(partner);
    setCurrentUser((prev) => ({
      ...prev,
      name: input.ownerName,
      role: 'owner',
    }));
    setIsOnboarded(true);

    // Immediate initial sync
    performCloudSync(
      newEvent,
      newTasks,
      newCategories,
      initialVendors,
      initialGuests,
      partner,
      newShareCode
    );
  };

  const updateEventDetails = (data: Partial<WeddingEvent>) => {
    if (!event) return;
    setEvent((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null));
  };

  // Task Actions
  const addTask = (task: Omit<EventTask, 'id'>) => {
    const newTask: EventTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<EventTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)));
  };

  // Budget Actions
  const updateBudgetCategory = (id: string, allocatedBudget: number, name?: string) => {
    setBudgetCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              allocatedBudget,
              name: name !== undefined ? name : c.name,
            }
          : c
      )
    );
  };

  const addBudgetCategory = (name: string, allocatedBudget: number, color?: string) => {
    const newCategory: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      allocatedBudget,
      color: color || '#78716c',
    };
    setBudgetCategories((prev) => [...prev, newCategory]);
  };

  const deleteBudgetCategory = (id: string) => {
    setBudgetCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addBudgetItem = (item: {
    categoryId: string;
    title: string;
    budgetAmount: number;
    isPaid: boolean;
    paidAmount?: number;
    paymentDate?: string;
    dueDate?: string;
    notes?: string;
  }) => {
    const vendorId = `vendor-item-${Date.now()}`;
    const amountToPay = item.paidAmount !== undefined ? item.paidAmount : item.budgetAmount;
    const finalContract = item.isPaid ? amountToPay : item.budgetAmount;

    const payments: VendorPayment[] = item.isPaid
      ? [
          {
            id: `pay-${Date.now()}`,
            vendorId,
            amount: amountToPay,
            paymentDate: item.paymentDate || new Date().toISOString().split('T')[0],
            type: 'pelunasan',
            notes: item.notes || 'Pembayaran langsung / lunas',
          },
        ]
      : [];

    const newVendor: Vendor = {
      id: vendorId,
      categoryId: item.categoryId,
      name: item.title.trim(),
      contactPerson: '-',
      phone: '-',
      totalContractValue: finalContract,
      estimatedBudget: item.budgetAmount,
      isDirectExpense: true,
      dueDate: item.dueDate,
      status: item.isPaid ? 'paid' : 'booked',
      notes: item.notes?.trim() || '',
      payments,
    };

    setVendors((prev) => [newVendor, ...prev]);
  };

  const updateBudgetItem = (
    id: string,
    updates: {
      title?: string;
      categoryId?: string;
      budgetAmount?: number;
      dueDate?: string;
      notes?: string;
    }
  ) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const newBudget =
            updates.budgetAmount !== undefined ? updates.budgetAmount : v.estimatedBudget || v.totalContractValue;
          const newContractValue = v.payments.length === 0 ? newBudget : v.totalContractValue;

          return {
            ...v,
            name: updates.title !== undefined ? updates.title.trim() : v.name,
            categoryId: updates.categoryId !== undefined ? updates.categoryId : v.categoryId,
            estimatedBudget: newBudget,
            totalContractValue: newContractValue,
            dueDate: updates.dueDate !== undefined ? updates.dueDate : v.dueDate,
            notes: updates.notes !== undefined ? updates.notes.trim() : v.notes,
          };
        }
        return v;
      })
    );
  };

  const settleBudgetItemPayment = (
    id: string,
    payment: {
      amount: number;
      paymentDate: string;
      isFullPayment: boolean;
      notes?: string;
    }
  ) => {
    const paymentId = `pay-${Date.now()}` + Math.random().toString().slice(2, 6);
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const newPayment: VendorPayment = {
            id: paymentId,
            vendorId: v.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            type: payment.isFullPayment ? 'pelunasan' : 'dp1',
            notes:
              payment.notes?.trim() ||
              (payment.isFullPayment ? 'Pelunasan pembayaran' : 'Pembayaran termin / DP'),
          };
          const updatedPayments = [...v.payments, newPayment];
          const totalPaidNow = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

          if (payment.isFullPayment) {
            return {
              ...v,
              status: 'paid',
              totalContractValue: totalPaidNow,
              payments: updatedPayments,
            };
          } else {
            const newStatus = totalPaidNow >= v.totalContractValue ? 'paid' : 'booked';
            return {
              ...v,
              status: newStatus,
              payments: updatedPayments,
            };
          }
        }
        return v;
      })
    );
  };

  const addDirectExpense = (
    categoryId: string,
    title: string,
    amount: number,
    paymentDate: string,
    notes?: string
  ) => {
    addBudgetItem({
      categoryId,
      title,
      budgetAmount: amount,
      isPaid: true,
      paidAmount: amount,
      paymentDate,
      notes,
    });
  };

  const applyRecommendedAllocation = () => {
    if (!event) return;
    const template = event.type === 'wedding' ? WEDDING_TEMPLATE : ENGAGEMENT_TEMPLATE;
    const total = event.totalBudget || budgetCategories.reduce((s, c) => s + c.allocatedBudget, 0);

    const updated: BudgetCategory[] = template.defaultBudgetAllocations.map((alloc, idx) => {
      const existing =
        budgetCategories.find((c) => c.name.toLowerCase() === alloc.categoryName.toLowerCase()) ||
        budgetCategories[idx];

      return {
        id: existing?.id || `cat-${idx}-${Date.now()}`,
        name: existing?.name || alloc.categoryName,
        allocatedBudget: Math.round((total * alloc.percentage) / 100),
        color: alloc.color,
      };
    });

    setBudgetCategories(updated);
  };

  // Vendor Actions
  const addVendor = (vendor: Omit<Vendor, 'id' | 'payments'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: `vendor-${Date.now()}`,
      estimatedBudget: vendor.estimatedBudget || vendor.totalContractValue,
      payments: [],
    };
    setVendors((prev) => [newVendor, ...prev]);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  const addVendorPayment = (vendorId: string, payment: Omit<VendorPayment, 'id' | 'vendorId'>) => {
    const newPayment: VendorPayment = {
      ...payment,
      id: `pay-${Date.now()}`,
      vendorId,
    };
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const updatedPayments = [...v.payments, newPayment];
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
          const newStatus = totalPaid >= v.totalContractValue ? 'paid' : v.status;
          return {
            ...v,
            status: newStatus,
            payments: updatedPayments,
          };
        }
        return v;
      })
    );
  };

  const deleteVendorPayment = (vendorId: string, paymentId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const updatedPayments = v.payments.filter((p) => p.id !== paymentId);
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
          const restoreBudget = v.estimatedBudget || v.totalContractValue;
          const newStatus =
            totalPaid === 0 ? 'booked' : totalPaid < v.totalContractValue ? 'booked' : v.status;
          return {
            ...v,
            totalContractValue: totalPaid === 0 ? restoreBudget : v.totalContractValue,
            status: newStatus,
            payments: updatedPayments,
          };
        }
        return v;
      })
    );
  };

  // Guest actions
  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      ...guest,
      id: `guest-${Date.now()}`,
    };
    setGuests((prev) => [...prev, newGuest]);
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  // Collaboration
  const switchActiveUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'owner'
          ? event?.ownerName || 'Owner'
          : partnerUser?.name || 'Pasangan (Editor)',
    }));
  };

  const invitePartner = (name: string, email: string) => {
    const partner: UserSession = {
      id: `user-partner-${Date.now()}`,
      name,
      email,
      role: 'editor',
    };
    setPartnerUser(partner);
    if (event) {
      setEvent({ ...event, partnerName: name });
    }
  };

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SHARE_CODE_KEY);
    }
    setEvent(null);
    setTasks([]);
    setBudgetCategories([]);
    setVendors([]);
    setGuests([]);
    setPartnerUser(null);
    setIsOnboarded(false);
    setCloudShareCode(generateShareCode());
    setLastSyncedAt(null);
  };

  // --- Computed Financials (4 Pillars: Budget, Paid, Committed, Available + Variance) ---
  const financials = useMemo(() => {
    const totalBudget =
      event?.totalBudget || budgetCategories.reduce((s, c) => s + c.allocatedBudget, 0);

    const categoryBreakdown = budgetCategories.map((cat) => {
      const catVendors = vendors.filter((v) => v.categoryId === cat.id);

      let catPaid = 0;
      let catCommitted = 0;

      catVendors.forEach((v) => {
        const vPaid = v.payments.reduce((sum, p) => sum + p.amount, 0);
        catPaid += vPaid;

        if (v.status === 'booked') {
          const remainingObligation = Math.max(0, v.totalContractValue - vPaid);
          catCommitted += remainingObligation;
        }
      });

      const catAvailable = cat.allocatedBudget - (catPaid + catCommitted);
      const catVariance = calculateBudgetVariance(cat.allocatedBudget, catPaid, catCommitted);

      return {
        category: cat,
        paid: catPaid,
        committed: catCommitted,
        available: catAvailable,
        variance: catVariance,
        vendors: catVendors,
      };
    });

    const totalPaid = categoryBreakdown.reduce((sum, item) => sum + item.paid, 0);
    const totalCommitted = categoryBreakdown.reduce((sum, item) => sum + item.committed, 0);
    const totalAvailable = totalBudget - (totalPaid + totalCommitted);
    const overallVariance = calculateBudgetVariance(totalBudget, totalPaid, totalCommitted);

    return {
      totalBudget,
      totalPaid,
      totalCommitted,
      totalAvailable,
      overallVariance,
      categoryBreakdown,
    };
  }, [event, budgetCategories, vendors]);

  // --- Computed Tasks Summary ---
  const tasksSummary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

    const upcomingTasks = [...tasks]
      .filter((t) => !t.isCompleted)
      .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())
      .slice(0, 3);

    return {
      total,
      completed,
      pending,
      percentComplete,
      upcomingTasks,
    };
  }, [tasks]);

  // --- Computed Guests Summary ---
  const guestsSummary = useMemo(() => {
    const totalGuests = guests.length;
    let totalPax = 0;
    let confirmedPax = 0;
    let pendingPax = 0;
    let declinedPax = 0;

    guests.forEach((g) => {
      totalPax += g.pax;
      if (g.rsvpStatus === 'confirmed') confirmedPax += g.pax;
      else if (g.rsvpStatus === 'pending') pendingPax += g.pax;
      else if (g.rsvpStatus === 'declined') declinedPax += g.pax;
    });

    return {
      totalGuests,
      totalPax,
      confirmedPax,
      pendingPax,
      declinedPax,
    };
  }, [guests]);

  return (
    <WeddingContext.Provider
      value={{
        event,
        tasks,
        budgetCategories,
        vendors,
        guests,
        currentUser,
        partnerUser,
        isOnboarded,
        isLoading,
        isCloudConfigured,
        isSyncing,
        cloudShareCode,
        lastSyncedAt,
        syncError,
        loadPlanFromCloud,
        syncNow,
        completeOnboarding,
        updateEventDetails,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        updateBudgetCategory,
        addBudgetCategory,
        deleteBudgetCategory,
        addBudgetItem,
        updateBudgetItem,
        settleBudgetItemPayment,
        addDirectExpense,
        applyRecommendedAllocation,
        addVendor,
        updateVendor,
        deleteVendor,
        addVendorPayment,
        deleteVendorPayment,
        addGuest,
        updateGuest,
        deleteGuest,
        switchActiveUserRole,
        invitePartner,
        resetAllData,
        financials,
        tasksSummary,
        guestsSummary,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
