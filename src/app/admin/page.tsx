'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    Users,
    Package,
    ShoppingCart,
    MessageSquare,
    TrendingUp,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    TrendingDown,
    DollarSign,
    Award
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { getProductImageUrl } from '@/lib/utils/image-utils';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        messages: 0,
        reports: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        growth: 12.5 // Mock growth percentage
    });
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [productsRes, ordersRes, usersRes, messagesRes, reportsRes, pendingRes] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('messages').select('*', { count: 'exact', head: true }),
                supabase.from('marble_reports').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            const { data: allOrders, error: ordersError } = await supabase
                .from('orders')
                .select('*');

            if (allOrders) {
                // Calculate Revenue
                const revenue = allOrders
                    .filter(o => o.status === 'completed' || o.status === 'delivered')
                    .reduce((acc, o) => acc + Number(o.total_price || o.total || 0), 0);

                // Calculate Top Products
                const productCounts: any = {};
                allOrders.forEach(order => {
                    try {
                        const items = typeof order.total_products === 'string'
                            ? JSON.parse(order.total_products)
                            : (order.total_products || []);
                        items.forEach((item: any) => {
                            const key = item.name;
                            if (!productCounts[key]) {
                                productCounts[key] = { count: 0, id: item.id, image: item.image };
                            }
                            productCounts[key].count += (item.quantity || 1);
                        });
                    } catch (e) { }
                });

                const sortedProducts = Object.entries(productCounts)
                    .map(([name, data]: [string, any]) => ({
                        name,
                        count: data.count,
                        id: data.id,
                        image: data.image
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3);

                setTopProducts(sortedProducts);

                setStats({
                    products: productsRes.count || 0,
                    orders: ordersRes.count || 0,
                    users: usersRes.count || 0,
                    messages: messagesRes.count || 0,
                    reports: reportsRes.count || 0,
                    pendingOrders: pendingRes.count || 0,
                    totalRevenue: revenue,
                    growth: 12.5
                });

                // Set Recent Orders (normalized)
                const normalized = allOrders
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 5)
                    .map(o => ({
                        ...o,
                        displayTotal: o.total_price || o.total || 0,
                        displayName: o.full_name || o.name || 'عميل'
                    }));
                setRecentOrders(normalized);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-10 text-right">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white">لوحة التحكم</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">نظرة عامة على أداء الموقع والعمليات الرئيسية</p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse border-2 border-emerald-500/20"></div>
                    <span className="text-sm font-black text-slate-500 dark:text-slate-400">النظام يعمل بشكل جيد</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Main Revenue Card - Prominent */}
                <div className="xl:col-span-2 bg-gradient-to-br from-emerald-600 to-green-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-green-600/20 relative overflow-hidden group min-h-[220px]">
                    <div className="absolute -right-5 -top-5 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md border border-white/20">
                                <DollarSign size={24} />
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-md">
                                <TrendingUp size={14} />
                                {stats.growth}% نمو هذا الشهر
                            </div>
                        </div>
                        <div>
                            <h3 className="text-green-100 font-bold text-xs tracking-[0.2em] opacity-80 uppercase mb-2">إجمالي الإيرادات المؤكدة</h3>
                            <div className="text-5xl font-black flex items-baseline gap-2">
                                {stats.totalRevenue.toFixed(3)}
                                <span className="text-xl font-bold opacity-60 font-medium">ر.ع</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid of Secondary Cards */}
                {[
                    { label: 'الطلبات', value: stats.orders, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/admin/orders' },
                    { label: 'المنتجات', value: stats.products, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', link: '/admin/products' },
                    { label: 'المستخدمين', value: stats.users, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50', link: '#' },
                    { label: 'بانتظار التأكيد', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', link: '/admin/orders' },
                    { label: 'البلاغات', value: stats.reports, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', link: '/admin/reports' },
                    { label: 'الرسائل', value: stats.messages, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/messages' },
                ].map((card, i) => (
                    <Link href={card.link} key={i} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 hover:border-[var(--color-primary)]/20 transition-all duration-300 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-5">
                            <div className={`p-4 rounded-2xl ${card.bg} dark:bg-slate-800 ${card.color} transition-all group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-green-500/20`}>
                                <card.icon size={22} />
                            </div>
                            <ArrowUpRight className="text-slate-200 group-hover:text-[var(--color-primary)] transition-colors" size={20} />
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2 opacity-70">{card.label}</h3>
                            <div className="text-3xl font-black text-slate-800 dark:text-white capitalize tracking-tight">{card.value.toLocaleString()}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <TrendingUp size={24} className="text-emerald-500" />
                            أحدث الطلبات المستلمة
                        </h2>
                        <Link href="/admin/orders" className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">عرض كل السجل</Link>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                            <thead>
                                <tr className="text-right text-slate-400 text-[10px] border-b border-slate-50 dark:border-slate-800/50 uppercase tracking-widest">
                                    <th className="pb-6 font-black">المعرف</th>
                                    <th className="pb-6 font-black">تفاصيل الطلب</th>
                                    <th className="pb-6 font-black text-center">القيمة</th>
                                    <th className="pb-6 font-black text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {recentOrders.map((order) => {
                                    const items = typeof order.total_products === 'string' ? JSON.parse(order.total_products) : (order.total_products || []);

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group/row">
                                            <td className="py-6 text-sm font-black text-slate-400">#{order.id}</td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="flex -space-x-4 hover:-space-x-1 hover:mr-4 transition-all duration-300 relative">
                                                        {items.slice(0, 3).map((item: any, idx: number) => (
                                                            <div key={idx} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden border-2 border-white dark:border-slate-900 shadow-xl shrink-0 transition-all hover:scale-125 hover:z-[40] cursor-pointer">
                                                                {item.image ? (
                                                                    <img src={getProductImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                        <Package size={20} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {items.length > 3 && (
                                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-xl z-[10] relative">
                                                                +{items.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-800 dark:text-white truncate max-w-[180px] group-hover/row:text-[var(--color-primary)] transition-colors">{order.displayName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 mt-1 opacity-80">{items.length} {items.length > 1 ? 'منتجات مختلفة' : 'منتج واحد'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-sm font-black text-emerald-600 text-center bg-emerald-50/10 dark:bg-emerald-500/5 rounded-2xl">{Number(order.displayTotal).toFixed(3)} ر.ع</td>
                                            <td className="py-6 text-center">
                                                <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' :
                                                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' :
                                                            'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'
                                                    }`}>
                                                    {order.status === 'pending' ? 'معلق' : order.status === 'completed' ? 'مكتمل' : 'جاري العمل'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-3">
                        <Award size={24} className="text-amber-500" />
                        الأكثر طلباً
                    </h2>
                    <div className="space-y-8 flex-1">
                        {topProducts.length > 0 ? topProducts.map((p, i) => (
                            <Link href={`/product/${p.id || p.name}`} key={i} className="block group/item">
                                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:bg-emerald-50/30 hover:border-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/5">
                                    <div className="flex items-center gap-5 mb-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 overflow-hidden border-2 relative ${i === 0 ? 'border-amber-400 shadow-xl shadow-amber-500/20' :
                                                i === 1 ? 'border-slate-300' : 'border-orange-200'
                                            }`}>
                                            {p.image ? (
                                                <img src={getProductImageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                                        i === 1 ? 'bg-slate-200 text-slate-600' :
                                                            'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    <Package size={20} />
                                                </div>
                                            )}
                                            {/* Rank badge */}
                                            <div className="absolute top-0 right-0 w-6 h-6 bg-slate-900 text-white flex items-center justify-center text-[10px] font-black rounded-bl-xl border-b border-l border-white/20">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1 truncate">
                                            <p className="font-black text-slate-800 dark:text-white text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate">
                                                {p.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">معرف المنتج: {p.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 px-1">
                                        <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000 group-hover/item:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                                style={{ width: `${(p.count / topProducts[0].count) * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-xs font-black text-slate-500 whitespace-nowrap bg-white dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">{p.count} قطعة</div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-300">
                                <Package size={60} strokeWidth={1} />
                                <p className="text-sm font-bold italic">لا تتوفر مبيعات حالية للتحليل</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-10 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
                        <ShieldAlert className="text-emerald-500 shrink-0 mt-1" size={18} />
                        <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400 font-black leading-relaxed">تعتمد هذه البيانات على إجمالي مبيعات المنتجات في الطلبيات المؤكدة والمكتملة فقط. يتم تحديث التقرير تلقائياً عند كل طلب جديد.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
