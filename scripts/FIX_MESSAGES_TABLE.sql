-- 🚨 FIX MESSAGES TABLE FOR CONTACT & REPORTS 🚨
-- This script ensures the messages table handles both contact requests and waste reports.

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8),
ADD COLUMN IF NOT EXISTS category TEXT, -- For classification
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'; -- For reports (normal, high, urgent)

-- Ensure RLS is active and correct
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
