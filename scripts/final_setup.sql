-- =====================================================
-- ☢️ FINAL SETUP SCRIPT - THE NUCLEAR OPTION ☢️
-- هذا السكريبت يقوم بإعادة بناء قاعدة البيانات بالكامل لإصلاح جميع المشاكل
-- =====================================================

-- 1. تنظيف الجداول القديمة (بالترتيب لتجنب أخطاء العلاقات)
DROP TABLE IF EXISTS public.cart CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. إنشاء جدول المستخدمين (PROFILES)
-- يتم ربطه مع auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- سياسات profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. إنشاء جدول المنتجات (PRODUCTS)
CREATE TABLE public.products (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    details TEXT,
    liters NUMERIC(10,2) DEFAULT 0,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- سياسات products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. إنشاء جدول الطلبات (ORDERS)
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    method TEXT DEFAULT 'cash',
    total_price NUMERIC(10,3) NOT NULL DEFAULT 0,
    total_products TEXT, -- سيحتوي على تفاصيل المنتجات كنص للعرض السريع
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    placed_on TIMESTAMPTZ DEFAULT now()
);

-- سياسات orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. إنشاء جدول الرسائل (MESSAGES)
CREATE TABLE public.messages (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'contact', -- 'contact' OR 'report'
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'completed'
    location TEXT, -- للبلاغات
    image_url TEXT, -- للبلاغات
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- سياسات messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. إنشاء جدول السلة (CART)
CREATE TABLE public.cart (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- سياسات cart
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- 7. إنشاء جدول المفضلة (WISHLIST)
CREATE TABLE public.wishlist (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- سياسات wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);


-- 8. TRIGGER لإنشاء البروفايل تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. دالة آمنة لخصم المخزون (يستدعيها المستخدم عند الشراء)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id BIGINT, q INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock - q
    WHERE id = p_id AND stock >= q;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف التريجر القديم إذا وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 10. بيانات تجريبية (OPTIONAL - BUT RECOMMENDED)
INSERT INTO public.products (code, name, details, liters, price, image, category, stock) VALUES
('PNT-001', 'صبغ داخلي أبيض مطفي', 'طلاء عالي الجودة للجدران الداخلية.', 3.00, 6.00, '/images/products/paint1.png', 'أصباغ داخلية', 50),
('PNT-002', 'صبغ داخلي أبيض لامع', 'طلاء لامع وسهل التنظيف.', 3.00, 6.50, '/images/products/paint2.png', 'أصباغ داخلية', 40),
('MRB-001', 'رخام عماني كريمي', 'رخام طبيعي عالي الجودة للأرضيات.', 0, 12.00, '/images/products/marble1.png', 'رخام', 100),
('TLS-001', 'أدوات صبغ احترافية', 'طقم فرش ورولات للصبغ.', 0, 4.50, '/images/products/tools1.png', 'أدوات', 20);

-- =====================================================
-- انتهى السكريبت
-- =====================================================
