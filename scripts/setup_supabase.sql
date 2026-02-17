-- =====================================================
-- GRMC Supabase Setup Script
-- تهيئة قاعدة بيانات GRMC على Supabase
-- =====================================================
-- ملاحظة: قم بتشغيل هذا السكريبت من Supabase Dashboard -> SQL Editor
-- =====================================================

-- =====================================================
-- 1. جدول profiles (الملفات الشخصية)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للملفات الشخصية
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin يمكنه حذف أي ملف شخصي
CREATE POLICY "profiles_admin_delete" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- =====================================================
-- 2. Trigger لإنشاء profile تلقائياً عند التسجيل
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف الـ trigger القديم إذا كان موجوداً
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء الـ trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. جدول products (المنتجات)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE DEFAULT '',
    name TEXT NOT NULL,
    details TEXT DEFAULT '',
    liters NUMERIC(10,2) DEFAULT 0,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image TEXT DEFAULT '',
    category TEXT DEFAULT '',
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم قراءة المنتجات
CREATE POLICY "products_select_all" ON public.products
    FOR SELECT USING (true);

-- فقط Admin يمكنه إضافة/تعديل/حذف المنتجات
CREATE POLICY "products_admin_insert" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "products_admin_update" ON public.products
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "products_admin_delete" ON public.products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- 4. جدول cart (سلة المشتريات)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cart (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_select_own" ON public.cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_insert_own" ON public.cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_update_own" ON public.cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_delete_own" ON public.cart
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. جدول wishlist (المفضلة)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_select_own" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_insert_own" ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_delete_own" ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. جدول orders (الطلبات)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    method TEXT DEFAULT 'cash on delivery',
    address TEXT DEFAULT '',
    total NUMERIC(10,3) NOT NULL DEFAULT 0,
    total_products TEXT DEFAULT '',
    legacy_details TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- المستخدم يرى طلباته فقط
CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin يرى جميع الطلبات
CREATE POLICY "orders_admin_select" ON public.orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "orders_admin_update" ON public.orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "orders_admin_delete" ON public.orders
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- 7. جدول messages (الرسائل والبلاغات)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'contact' CHECK (type IN ('contact', 'report')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    read BOOLEAN DEFAULT false,
    location TEXT DEFAULT '',
    latitude NUMERIC(10,8) DEFAULT NULL,
    longitude NUMERIC(11,8) DEFAULT NULL,
    image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم إرسال رسالة (حتى الزوار)
CREATE POLICY "messages_insert_all" ON public.messages
    FOR INSERT WITH CHECK (true);

-- المستخدم يرى رسائله فقط
CREATE POLICY "messages_select_own" ON public.messages
    FOR SELECT USING (auth.uid() = user_id);

-- Admin يرى ويدير جميع الرسائل
CREATE POLICY "messages_admin_select" ON public.messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "messages_admin_update" ON public.messages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "messages_admin_delete" ON public.messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- 8. إضافة منتجات تجريبية (من الموقع القديم)
-- =====================================================
INSERT INTO public.products (code, name, details, liters, price, image, category, stock) VALUES
('PNT-WHT-001', 'صبغ داخلي أبيض مطفي', 'طلاء داخلي عالي الجودة بلون أبيض ناصع ولمسة نهائية مطفية. يتميز بتغطية ممتازة وسهولة في التطبيق.', 3.00, 6.00, 'c1 (12).jpeg', 'أصباغ داخلية', 50),
('PNT-WHT-GLS-002', 'صبغ داخلي أبيض لامع', 'طلاء داخلي بلون أبيض لامع يمنح الجدران لمسة أنيقة ومشرقة.', 3.00, 6.00, 'c1 (1).jpeg', 'أصباغ داخلية', 50),
('PNT-GRY-MAT-003', 'صبغ داخلي رصاصي مطفي', 'طلاء داخلي بلون رصاصي أنيق بلمسة مطفية ناعمة.', 3.00, 6.50, 'c1 (5).jpeg', 'أصباغ داخلية', 30),
('PNT-LVND-MAT-004', 'صبغ داخلي بنفسجي فاتح مطفي', 'طلاء داخلي بلون بنفسجي فاتح (لافندر) بلمسة مطفية ناعمة.', 3.00, 6.50, 'c1 (10).jpeg', 'أصباغ داخلية', 30),
('PNT-LVND-GLS-005', 'صبغ داخلي بنفسجي لامع', 'طلاء داخلي بلون بنفسجي بلمعة أنيقة ومشرقة.', 3.00, 6.50, 'c1 (6).jpeg', 'أصباغ داخلية', 25),
('PNT-PNK-MAT-006', 'صبغ داخلي وردي فاتح مطفي', 'طلاء داخلي بلون وردي فاتح ولمسة مطفية ناعمة.', 3.00, 6.50, 'c1 (3).jpeg', 'أصباغ داخلية', 20),
('PNT-YLW-MAT-007', 'صبغ داخلي أصفر فاتح مطفي', 'طلاء داخلي بلون أصفر فاتح بلمسة مطفية ناعمة.', 3.00, 6.50, 'c1 (7).jpeg', 'أصباغ داخلية', 35),
('PNT-ORG-MAT-008', 'صبغ داخلي برتقالي فاتح مطفي', 'طلاء داخلي بلون برتقالي فاتح بلمسة مطفية مميزة.', 3.00, 6.50, 'c1 (8).jpeg', 'أصباغ داخلية', 40),
('PNT-BLK-MAT-009', 'صبغ داخلي أسود مطفي', 'طلاء داخلي باللون الأسود المطفي الفاخر.', 3.00, 6.50, 'c1 (9).jpeg', 'أصباغ داخلية', 15),
('PNT-BRN-MAT-010', 'صبغ داخلي بني مطفي', 'طلاء داخلي بلون بني مطفي دافئ وأنيق.', 3.00, 6.50, 'c1 (4).jpeg', 'أصباغ داخلية', 25),
('PNT-GRN-MAT-011', 'صبغ داخلي أخضر فاتح مطفي', 'طلاء داخلي بلون أخضر فاتح بلمسة مطفية هادئة.', 3.00, 6.50, 'c1 (11).jpeg', 'أصباغ داخلية', 30),
('PNT-BLU-012', 'صبغ ازرق', 'لامع', 3.00, 6.50, 'c1 (2).jpeg', 'أصباغ داخلية', 20)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 9. Sync existing auth users to profiles (if any)
-- =====================================================
INSERT INTO public.profiles (id, full_name, email, role)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    COALESCE(email, ''),
    COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- تم الانتهاء من إعداد قاعدة البيانات!
-- =====================================================
