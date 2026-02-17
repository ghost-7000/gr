-- 🚨 THE DEFINITIVE DATABASE FIX FOR GRMC 🚨
-- Run this in the Supabase SQL Editor. This script adds missing columns to existing tables.

-- 1. Ensure Messages Table has correct columns
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ensure Marble Reports Table has ALL required columns
CREATE TABLE IF NOT EXISTS public.marble_reports (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    image_url TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'normal',
    is_urgent BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ADD MISSING COLUMNS (In case the table already existed)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marble_reports' AND column_name='image_url') THEN
        ALTER TABLE public.marble_reports ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marble_reports' AND column_name='priority') THEN
        ALTER TABLE public.marble_reports ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'medium', 'high'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marble_reports' AND column_name='is_urgent') THEN
        ALTER TABLE public.marble_reports ADD COLUMN is_urgent BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marble_reports' AND column_name='admin_notes') THEN
        ALTER TABLE public.marble_reports ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marble_reports ENABLE ROW LEVEL SECURITY;

-- 5. Public Insertion Policies (Guest submission)
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert reports" ON public.marble_reports;
CREATE POLICY "Anyone can insert reports" ON public.marble_reports FOR INSERT WITH CHECK (true);

-- 6. Admin Management Policies
DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage reports" ON public.marble_reports;
CREATE POLICY "Admins can manage reports" ON public.marble_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 7. STORAGE BUCKET CONFIGURATION
-- This ensures the 'images' bucket exists and is public for reports.

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'images', 'images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
);

-- RLS Policies for Storage
-- Allow public to upload to the 'reports/' folder in the 'images' bucket
DROP POLICY IF EXISTS "Public Report Upload" ON storage.objects;
CREATE POLICY "Public Report Upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = 'reports'
);

-- Allow public to view images in the 'images' bucket
DROP POLICY IF EXISTS "Public View Images" ON storage.objects;
CREATE POLICY "Public View Images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'images'
);

-- 8. REFRESH SCHEMA CACHE
-- If you still get errors, try to reload your browser tab.
