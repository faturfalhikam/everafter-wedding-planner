export type EventType = 'wedding' | 'engagement';
export type EventTheme = 'indoor' | 'outdoor' | 'traditional' | 'modern';
export type VendorStatus = 'research' | 'contacted' | 'negotiation' | 'booked' | 'paid' | 'cancelled';
export type PaymentType = 'dp1' | 'dp2' | 'pelunasan' | 'adhoc';
export type RSVPStatus = 'pending' | 'confirmed' | 'declined';
export type GuestGroup = 'Keluarga' | 'Teman' | 'VIP' | 'Kantor / Rekan';
export type UserRole = 'owner' | 'editor';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amount: number;
  paymentDate: string;
  dueDate?: string;
  type: PaymentType;
  notes?: string;
}

export interface Vendor {
  id: string;
  categoryId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  totalContractValue: number;
  estimatedBudget?: number; // Target anggaran / estimasi biaya awal untuk budgeting
  isDirectExpense?: boolean; // Penanda apakah item ini rencana belanja mandiri / kas printilan
  dueDate?: string; // Tanggal estimasi / jatuh tempo belanja
  status: VendorStatus;
  notes?: string;
  payments: VendorPayment[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedBudget: number;
  color?: string;
  icon?: string;
}

export interface EventTask {
  id: string;
  title: string;
  category: string;
  relativeDaysBeforeEvent: number; // e.g. 180 means H-180
  deadlineDate: string; // YYYY-MM-DD calculated from eventDate - relativeDays
  isCompleted: boolean;
  isCustomDeadline?: boolean;
  priority: 'low' | 'medium' | 'high';
  vendorId?: string;
}

export interface Guest {
  id: string;
  name: string;
  group: GuestGroup;
  pax: number;
  rsvpStatus: RSVPStatus;
  phone?: string;
  notes?: string;
}

export interface WeddingEvent {
  id: string;
  title: string;
  type: EventType;
  eventDate: string; // YYYY-MM-DD
  totalBudget: number;
  estimatedGuests: number;
  theme: EventTheme;
  status: 'planning' | 'completed';
  partnerName?: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingTemplate {
  id: string;
  type: EventType;
  title: string;
  defaultBudgetAllocations: {
    categoryName: string;
    percentage: number;
    color: string;
  }[];
  defaultTasks: {
    title: string;
    category: string;
    relativeDaysBeforeEvent: number;
    priority: 'low' | 'medium' | 'high';
  }[];
}
