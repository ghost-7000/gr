-- =====================================================
-- إنشاء حساب Admin في Supabase
-- =====================================================
-- الطريقة الأفضل: سجّل حساب عادي من صفحة التسجيل /register
-- ثم شغّل هذا الأمر لترقيته إلى admin
-- =====================================================

-- الخطوة 1: ابحث عن المستخدم بالإيميل (غيّر الإيميل هنا)
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'admin@grmc.com';

-- الخطوة 2: حدّث role في user_metadata (غيّر الإيميل هنا)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@grmc.com';

-- الخطوة 3: حدّث role في جدول profiles
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'admin@grmc.com';

-- =====================================================
-- تحقق من النتيجة
-- =====================================================
SELECT id, email, role FROM public.profiles WHERE email = 'admin@grmc.com';
