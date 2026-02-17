-- =====================================================
-- Fix Orders Status Constraint (Robust Version)
-- تحديث قاعدة البيانات للسماح بحالة "مكتمل"
-- =====================================================

-- 1. التأكد من حذف أي قيد قديم قد يعيق التحديث
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. إعادة إنشاء القيد ليشمل جميع الحالات المطلوبة
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'pending', 
    'processing', 
    'shipped', 
    'delivered', 
    'completed', -- هذه هي الحالة التي كانت تسبب الخطأ
    'cancelled'
));

-- 3. تحديث التعليق للتوضيح
COMMENT ON TABLE public.orders IS 'V2: Status list updated to include completed';
