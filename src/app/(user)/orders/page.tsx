'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { Package, Calendar, Clock, CheckCircle2, Truck, AlertTriangle, ArrowRight, MapPin, ShoppingCart } from 'lucide-react';
import StatusStepper from '@/components/orders/StatusStepper';
import { getProductImageUrl } from '@/lib/utils/image-utils';

export default function OrdersPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchOrders() {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user?.id);

                if (error) throw error;

                if (data) {
                    const sorted = [...data].sort((a, b) => {
                        const dateA = new Date(a.created_at || a.placed_on || 0).getTime();
                        const dateB = new Date(b.created_at || b.placed_on || 0).getTime();
                        return dateB - dateA;
                    });
                    setOrders(sorted);
                }
            } catch (err: any) {
                console.error('Fetch orders error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [user]);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const statusMap: any = {
        pending: { label: 'قيد الانتظار', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', icon: Clock, step: 0 },
        processing: { label: 'جاري التجهيز', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: Truck, step: 1 },
        shipped: { label: 'تم الشحن', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', icon: Truck, step: 2 },
        delivered: { label: 'تم التوصيل', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle2, step: 3 },
        completed: { label: 'مكتمل', color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle2, step: 3 },
        cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: AlertTriangle, step: -1 },
    };

    if (!isClient) return null;

    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--color-surface)] py-12 pt-32 flex items-center justify-center">
                <div className="text-center max-w-sm px-4">
                    <div className="w-20 h-20 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)] border border-[var(--color-border)]">
                        <Package size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-text)] mb-4">يجب تسجيل الدخول</h2>
                    <p className="text-[var(--color-text-light)] mb-8 font-medium">يرجى تسجيل الدخول لعرض سجل طلباتك ومتابعة حالتها.</p>
                    <Link href="/login" className="btn btn-primary w-full shadow-lg">تسجيل الدخول</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface-alt)] py-12 pt-32 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--color-text)] flex items-center gap-4">
                            <Package size={40} className="text-[var(--color-primary)]" />
                            طلباتي
                        </h1>
                        <p className="text-[var(--color-text-light)] mt-2 font-bold">تتبع حالة مشترياتك وسجل طلباتك من GRMC</p>
                    </div>
                    <Link href="/shop" className="btn btn-outline border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] flex items-center gap-2 group">
                        <ArrowRight size={18} className="translate-x-1 transition-transform group-hover:translate-x-0" />
                        متابعة التسوق
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-[var(--color-surface)] rounded-[2.5rem] p-16 text-center border border-[var(--color-border)] shadow-xl shadow-black/5">
                        <div className="w-24 h-24 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--color-text-lighter)] border border-[var(--color-border)]">
                            <ShoppingCart size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-[var(--color-text)] mb-4">سجل الطلبات فارغ</h3>
                        <p className="text-[var(--color-text-light)] max-w-md mx-auto mb-10 font-bold leading-relaxed">لم تقم بإجراء أي طلبات بعد. ابدأ الآن بتصفح منتجاتنا الرائعة وأضفها إلى سلتك.</p>
                        <Link href="/shop" className="btn btn-primary px-10 py-4 text-lg shadow-lg shadow-green-500/20">
                            اذهب للمتجر الآن
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => {
                            const St = statusMap[order.status] || statusMap.pending;
                            let items = [];
                            try {
                                items = typeof order.total_products === 'string'
                                    ? JSON.parse(order.total_products)
                                    : (order.total_products || []);
                            } catch (e) { }

                            return (
                                <div key={order.id} className="bg-[var(--color-surface)] rounded-[2.5rem] overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group">
                                    <div className="p-6 md:p-10">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-4 mb-8">
                                                    <div className="px-6 py-2.5 bg-[var(--color-surface-alt)] rounded-2xl border border-[var(--color-border)] text-[var(--color-text)] font-black text-xl shadow-inner">
                                                        طلب #{order.id}
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 ${St.color} border border-current opacity-90`}>
                                                        <St.icon size={16} />
                                                        {St.label}
                                                    </span>
                                                    <div className="text-[var(--color-text-lighter)] text-xs font-black flex items-center gap-2 mr-auto lg:mr-0 opacity-80">
                                                        <Calendar size={14} />
                                                        {new Date(order.created_at || order.placed_on).toLocaleDateString('ar-OM', { dateStyle: 'long' })}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div className="space-y-5">
                                                        <p className="text-[10px] font-black text-[var(--color-text-lighter)] uppercase tracking-[0.2em] px-1 opacity-70">المنتجات المطلوبة</p>
                                                        <div className="flex flex-wrap gap-4">
                                                            {items.length > 0 ? items.map((item: any, idx: number) => (
                                                                <Link
                                                                    key={idx}
                                                                    href={`/product/${item.id || encodeURIComponent(item.name)}`}
                                                                    className="pl-5 pr-2.5 py-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-xl hover:border-[var(--color-primary)] hover:-translate-y-1 transition-all group/item relative cursor-pointer"
                                                                >
                                                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] overflow-hidden border border-[var(--color-border)] shrink-0 shadow-inner">
                                                                        {item.image ? (
                                                                            <img src={getProductImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-lighter)]">
                                                                                <Package size={18} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="w-7 h-7 absolute -right-2.5 -top-2.5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-black shadow-xl border-2 border-[var(--color-surface)] group-hover/item:scale-125 transition-transform z-10">
                                                                        {item.quantity}
                                                                    </div>
                                                                    <div className="max-w-[140px]">
                                                                        <p className="text-sm font-black text-[var(--color-text)] truncate group-hover/item:text-[var(--color-primary)] transition-colors">{item.name || 'منتج مجهول'}</p>
                                                                        {item.price && (
                                                                            <p className="text-[10px] text-[var(--color-text-lighter)] font-black mt-0.5">
                                                                                {(item.price * item.quantity).toFixed(3)} ر.ع
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            )) : <span className="text-[var(--color-text-lighter)] text-sm italic">لا تتوفر تفاصيل المنتجات</span>}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <p className="text-[10px] font-black text-[var(--color-text-lighter)] uppercase tracking-[0.2em] px-1 opacity-70">عنوان التوصيل</p>
                                                        <div className="flex items-start gap-4 p-5 bg-[var(--color-surface-alt)] rounded-[1.5rem] border border-dashed border-[var(--color-border)] group-hover:border-[var(--color-primary-light)] transition-colors">
                                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center shrink-0 border border-[var(--color-border)] shadow-sm text-[var(--color-primary)]">
                                                                <MapPin size={20} />
                                                            </div>
                                                            <p className="text-sm font-bold leading-relaxed text-[var(--color-text-light)] py-1">{order.address || 'العنوان غير متوفر'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-10 pt-8 border-t border-dashed border-[var(--color-border)]">
                                                    <p className="text-[10px] font-black text-[var(--color-text-lighter)] uppercase tracking-[0.2em] px-1 mb-6 opacity-70">تتبع حالة الطلب</p>
                                                    <StatusStepper status={order.status} />
                                                </div>
                                            </div>

                                            <div className="lg:w-80 shrink-0 flex flex-col justify-center bg-[var(--color-surface-alt)] p-8 md:p-10 rounded-[2rem] border border-[var(--color-border)] relative overflow-hidden">
                                                {/* Decorative background circle */}
                                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--color-primary-faded)] rounded-full blur-3xl opacity-50" />

                                                <div className="mb-10 relative z-10">
                                                    <p className="text-[10px] font-black text-[var(--color-text-lighter)] uppercase tracking-[0.2em] mb-3 opacity-70">المبلغ الإجمالي</p>
                                                    <div className="text-5xl font-black text-[var(--color-primary)] flex items-baseline gap-2">
                                                        {Number(order.total_price || order.total || 0).toFixed(3)}
                                                        <span className="text-sm font-bold text-[var(--color-text-lighter)] uppercase tracking-wider">ر.ع</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 relative z-10">
                                                    <Link
                                                        href={`/invoice/${order.id}`}
                                                        className="w-full btn btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 transition-all"
                                                    >
                                                        <Package size={20} />
                                                        عرض الفاتورة
                                                    </Link>

                                                    {order.status === 'delivered' || order.status === 'completed' ? (
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                                                                <CheckCircle2 size={12} />
                                                                تم توصيل طلبك بنجاح
                                                            </p>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
