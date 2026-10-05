-- ==============================================================================
-- EverAfter Wedding Planner - Supabase Database Schema
-- Jalankan skrip SQL ini di Supabase Studio -> SQL Editor
-- ==============================================================================

-- 1. Buat Tabel wedding_plans
CREATE TABLE IF NOT EXISTS public.wedding_plans (
    id TEXT PRIMARY KEY,                       -- ID unik rencana (e.g. 'event-172813...')
    share_code TEXT UNIQUE,                    -- Kode ringkas untuk dibagikan (e.g. 'WED-A8K2')
    title TEXT NOT NULL DEFAULT 'Rencana Pernikahan',
    event JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Metadata acara (tanggal, tema, owner, dll)
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Daftar checklist tugas
    budget_categories JSONB NOT NULL DEFAULT '[]'::jsonb, -- Alokasi budget & pengeluaran
    vendors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Vendor & termin pembayaran
    guests JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Daftar tamu & status RSVP
    partner_user JSONB,                        -- Data kolaborator/pasangan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Buat Index untuk pencarian cepat berdasarkan share_code
CREATE INDEX IF NOT EXISTS idx_wedding_plans_share_code ON public.wedding_plans (share_code);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.wedding_plans ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan Akses (RLS Policies)
-- Memungkinkan siapa pun yang memiliki tautan/kode akses untuk melihat, mengedit, dan menghapus (kolaboratif anonim)
DROP POLICY IF EXISTS "Allow public read access" ON public.wedding_plans;
CREATE POLICY "Allow public read access" 
    ON public.wedding_plans 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.wedding_plans;
CREATE POLICY "Allow public insert access" 
    ON public.wedding_plans 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.wedding_plans;
CREATE POLICY "Allow public update access" 
    ON public.wedding_plans 
    FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.wedding_plans;
CREATE POLICY "Allow public delete access" 
    ON public.wedding_plans 
    FOR DELETE 
    USING (true);

-- 5. Aktifkan Realtime Synchronization
-- Ini membuat pasangan Anda langsung melihat update di layar mereka tanpa refresh saat Anda mencentang checklist/mengubah budget
ALTER PUBLICATION supabase_realtime ADD TABLE public.wedding_plans;
