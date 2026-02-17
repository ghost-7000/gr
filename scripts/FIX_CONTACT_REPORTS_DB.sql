-- 🚨 DATABASE FIX FOR GRMC 🚨
-- This script ensures all tables for Contact and Reports exist and have the correct structure.

-- 1. Create Messages Table (for general contact)
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Marble Reports Table (for waste reporting)
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'medium', 'high')),
    is_urgent BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marble_reports ENABLE ROW LEVEL SECURITY;

-- Policies for Messages
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages" ON public.messages 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Policies for Marble Reports
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.marble_reports;
CREATE POLICY "Anyone can insert reports" ON public.marble_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage reports" ON public.marble_reports;
CREATE POLICY "Admins can manage reports" ON public.marble_reports 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
