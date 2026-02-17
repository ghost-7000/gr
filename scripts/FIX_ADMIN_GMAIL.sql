-- =====================================================
-- 🛡️ FIX FOR ADMIN: admin@gmail.com
-- =====================================================

-- 1. التأكد من أن حساب admin@gmail.com مسجل كمسؤول (Admin)
DO $$ 
DECLARE 
    v_user_id UUID;
BEGIN 
    -- جلب المعرف الخاص بالإيميل من جدول auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- تحديث أو إنشاء الملف الشخصي برتبة مسؤول
        INSERT INTO public.profiles (id, full_name, email, role)
        VALUES (v_user_id, 'مدير النظام', 'admin@gmail.com', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
        
        RAISE NOTICE 'User admin@gmail.com has been promoted to admin.';
    ELSE
        RAISE NOTICE 'User admin@gmail.com not found in auth.users table.';
    END IF;
END $$;

-- 2. تحديث سياسات الوصول (RLS) لضمان عدم وجود أي تعارض
DROP POLICY IF EXISTS "orders_admin_select" ON public.orders;
CREATE POLICY "orders_admin_select" ON public.orders
FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. السماح للجميع برؤية المنتجات (للتأكد من ظهور الصور)
DROP POLICY IF EXISTS "products_select_all" ON public.products;
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
