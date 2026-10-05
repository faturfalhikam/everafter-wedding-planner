export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  return formatCurrency(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function calculateDeadline(eventDateStr: string, relativeDays: number): string {
  const d = new Date(eventDateStr + 'T00:00:00');
  d.setDate(d.getDate() - relativeDays);
  return d.toISOString().split('T')[0];
}

export function getDaysRemaining(targetDateStr: string): { days: number; isPast: boolean } {
  if (!targetDateStr) return { days: 0, isPast: false };
  const target = new Date(targetDateStr + 'T00:00:00').getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffTime = target - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return {
    days: Math.abs(diffDays),
    isPast: diffDays < 0,
  };
}

export type BudgetClassification = 'under' | 'on' | 'over';

export interface BudgetVarianceResult {
  actualAmount: number; // Paid + Committed
  varianceAmount: number; // actual - budget
  variancePercentage: number;
  classification: BudgetClassification;
  label: string;
  badgeClass: string;
  dotColor: string;
}

export function calculateBudgetVariance(
  budgetAmount: number,
  paidAmount: number,
  committedAmount: number
): BudgetVarianceResult {
  const actualAmount = paidAmount + committedAmount;
  const varianceAmount = actualAmount - budgetAmount;

  let variancePercentage = 0;
  if (budgetAmount > 0) {
    variancePercentage = (varianceAmount / budgetAmount) * 100;
  } else if (actualAmount > 0) {
    variancePercentage = 100;
  }

  // Clear three-way distinction: Under budget | On budget | Over budget
  let classification: BudgetClassification = 'on';
  let label = 'Sesuai Pagu';
  let badgeClass = 'bg-stone-100 text-stone-700 border-stone-200';
  let dotColor = 'bg-stone-400';

  if (variancePercentage < -0.1) {
    classification = 'under';
    label = variancePercentage <= -15 ? 'Jauh di Bawah Pagu' : 'Di Bawah Pagu';
    badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (variancePercentage > 0.1) {
    classification = 'over';
    label = variancePercentage > 15 ? 'Jauh Melebihi Pagu' : 'Melebihi Pagu';
    badgeClass = 'bg-rose-50 text-rose-800 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else {
    classification = 'on';
    label = 'Sesuai Pagu';
    badgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';
    dotColor = 'bg-zinc-400';
  }

  return {
    actualAmount,
    varianceAmount,
    variancePercentage,
    classification,
    label,
    badgeClass,
    dotColor,
  };
}
