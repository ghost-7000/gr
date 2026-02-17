-- =====================================================
-- Add marble_reports Table (Legacy Feature Parity)
-- إضافة جدول بلاغات مخلفات الرخام (مطابق للمشروع القديم)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.marble_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    description TEXT NOT NULL,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    is_urgent BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.marble_reports ENABLE ROW LEVEL SECURITY;

-- Everyone can insert (even guests)
CREATE POLICY "reports_insert_all" ON public.marble_reports
    FOR INSERT WITH CHECK (true);

-- Users can see their own reports
CREATE POLICY "reports_select_own" ON public.marble_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can see and update everything
CREATE POLICY "reports_admin_select" ON public.marble_reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "reports_admin_update" ON public.marble_reports
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "reports_admin_delete" ON public.marble_reports
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
