import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project.supabase.co') &&
    supabaseUrl.startsWith('https://')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface WeddingPlanRecord {
  id: string;
  share_code?: string;
  title: string;
  event: any;
  tasks: any[];
  budget_categories: any[];
  vendors: any[];
  guests: any[];
  partner_user?: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Generate a short, human-friendly 6-character sharing code
 */
export function generateShareCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'WED-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Save or update a wedding plan in Supabase
 */
export async function saveWeddingPlanToSupabase(plan: WeddingPlanRecord): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase belum dikonfigurasi' };
  }

  try {
    const payload = {
      id: plan.id,
      share_code: plan.share_code,
      title: plan.title,
      event: plan.event,
      tasks: plan.tasks,
      budget_categories: plan.budget_categories,
      vendors: plan.vendors,
      guests: plan.guests,
      partner_user: plan.partner_user || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('wedding_plans')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saving plan to Supabase:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Fetch a wedding plan by plan ID or share code
 */
export async function fetchWeddingPlanFromSupabase(
  identifier: string
): Promise<{ plan: WeddingPlanRecord | null; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { plan: null, error: 'Supabase belum dikonfigurasi' };
  }

  try {
    // Try to find by id first, or share_code
    let query = supabase.from('wedding_plans').select('*');
    if (identifier.startsWith('WED-') || identifier.length <= 8) {
      query = query.eq('share_code', identifier);
    } else {
      query = query.or(`id.eq.${identifier},share_code.eq.${identifier}`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      return { plan: null, error: error.message };
    }

    if (!data) {
      return { plan: null, error: 'Rencana pernikahan tidak ditemukan' };
    }

    return { plan: data as WeddingPlanRecord };
  } catch (err: any) {
    console.error('Error fetching plan from Supabase:', err);
    return { plan: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Fetch the latest active wedding plan from Supabase
 */
export async function fetchLatestWeddingPlanFromSupabase(): Promise<{ plan: WeddingPlanRecord | null; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { plan: null, error: 'Supabase belum dikonfigurasi' };
  }

  try {
    const { data, error } = await supabase
      .from('wedding_plans')
      .select('*')
      .not('share_code', 'is', null)
      .neq('title', '[ARCHIVED_EMPTY]')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch latest error:', error);
      return { plan: null, error: error.message };
    }

    return { plan: data as WeddingPlanRecord };
  } catch (err: any) {
    console.error('Error fetching latest plan from Supabase:', err);
    return { plan: null, error: err.message || 'Unknown error' };
  }
}
