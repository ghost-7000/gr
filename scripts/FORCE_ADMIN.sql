-- =====================================================
-- 🛡️ GRMC ADMIN ACCESS FIX
-- =====================================================
-- قم بتشغيل هذا السكريبت وأنت مسجل دخولك في المتصفح بحساب الأدمن الذي تريد تفعيله

-- 1. ترقية الحساب الحالي إلى أدمن (الأكثر أماناً وموثوقية)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- 2. في حال لم يكن للمستخدم ملف شخصي أصلاً، نقوم بإنشائه
INSERT INTO public.profiles (id, full_name, email, role)
SELECT id, raw_user_meta_data->>'full_name', email, 'admin'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. التأكد من سياسة الوصول لجدول الطلبات (Orders)
-- هذه السياسة تضمن أن أي شخص يحمل رتبة 'admin' في جدول 'profiles' يمكنه رؤية كل الطلبات
DROP POLICY IF EXISTS "orders_admin_select" ON public.orders;
CREATE POLICY "orders_admin_select" ON public.orders
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسة التحديث (لتغيير الحالة)
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسة الحذف
DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete" ON public.orders
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. إظهار رسالة تأكيد (اختياري)
-- سيعمل هذا السكريبت على الحساب الذي تقوم بالدخول منه حالياً إلى Supabase
