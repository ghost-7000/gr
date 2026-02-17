'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    Search,
    ShoppingCart,
    Eye,
    Trash2,
    Clock,
    CheckCircle2,
    Truck,
    AlertTriangle,
    Loader2,
    Calendar,
    User as UserIcon,
    Phone,
    MapPin,
    Package,
    Mail,
    CreditCard,
    ChevronDown,
    Filter,
    X,
    TrendingUp,
    Award,
    DollarSign,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import StatusStepper from '@/components/orders/StatusStepper';
import { getProductImageUrl } from '@/lib/utils/image-utils';

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<OrderStatus>('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('orders').select('*');
            if (error) throw error;

            if (data) {
                const normalized = data.map(o => ({
                    ...o,
                    displayName: o.full_name || o.name || 'عميل مجهول',
                    displayTotal: Number(o.total || o.total_price || 0),
                    displayDate: o.created_at || o.placed_on || new Date().toISOString()
                }));
                const sorted = normalized.sort((a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());
                setOrders(sorted);
            }
        } catch (error: any) {
            console.error('Fetch error:', error);
            toast.error('خطأ في جلب الطلبات');
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: number, newStatus: string) {
        setUpdatingStatus(id);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (!error) {
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
                toast.success('تم تحديث حالة الطلب');
                if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
            } else {
                toast.error('فشل تحديث الحالة');
            }
        } finally {
            setUpdatingStatus(null);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (!error) {
            setOrders(orders.filter(o => o.id !== id));
            toast.success('تم حذف الطلب');
            if (selectedOrder?.id === id) setSelectedOrder(null);
        } else {
            toast.error('فشل الحذف');
        }
    }

    const filtered = useMemo(() => {
        let result = orders;
        if (activeTab !== 'all') {
            result = result.filter(o => o.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                (o.displayName || '').toLowerCase().includes(q) ||
                (o.phone || '').includes(q) ||
                (o.id || '').toString().includes(q)
            );
        }
        return result;
    }, [orders, activeTab, searchQuery]);

    const tabs: { id: OrderStatus; label: string }[] = [
        { id: 'all', label: 'الكل' },
        { id: 'pending', label: 'معلق' },
        { id: 'processing', label: 'جاري العمل' },
        { id: 'completed', label: 'مكتمل' },
        { id: 'cancelled', label: 'ملغي' },
    ];

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
        revenue: orders
            .filter(o => o.status === 'completed' || o.status === 'delivered')
            .reduce((acc, o) => acc + Number(o.total_price || o.total || 0), 0)
    };

    return (
        <div className="space-y-8 pb-12 text-right" dir="rtl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                        <ShoppingCart className="text-emerald-500" size={36} />
                        إدارة الطلبات
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">متابعة ومعالجة سجل طلبات العملاء</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id
                                ? 'bg-emerald-500 text-white shadow-lg shadow-green-500/20'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-500'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Search bar */}
                    <div className="relative group">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-14 pl-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-green-500/5 focus:border-emerald-500 transition-all font-bold text-slate-800 dark:text-white text-lg"
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                            <Loader2 className="animate-spin text-emerald-600 mb-6" size={56} strokeWidth={3} />
                            <p className="text-slate-400 font-black text-lg">جاري تحميل السجل الفني للطلبات...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-24 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Package size={48} className="text-slate-200 dark:text-slate-700" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3">لا توجد طلبات</h3>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto">لم يتم العثور على أي نتائج تطابق استفسارك الحالي أو الفلترة المختارة.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-right text-slate-400 text-[10px] border-b border-slate-50 dark:border-slate-800/50 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-8 font-black">رقم الطلب</th>
                                            <th className="px-8 py-8 font-black">العميل والتفاصيل</th>
                                            <th className="px-8 py-8 font-black text-center">التاريخ</th>
                                            <th className="px-8 py-8 font-black text-center">القيمة</th>
                                            <th className="px-8 py-8 font-black text-center">الحالة</th>
                                            <th className="px-8 py-8 font-black text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {filtered.map((order) => {
                                            const items = typeof order.total_products === 'string' ? JSON.parse(order.total_products) : (order.total_products || []);
                                            return (
                                                <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300">
                                                    <td className="px-8 py-8 text-sm font-black text-slate-300 group-hover:text-emerald-500 transition-colors tracking-tighter">#{order.id}</td>
                                                    <td className="px-8 py-8">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 font-black text-xl border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
                                                                {items[0]?.image ? (
                                                                    <img src={getProductImageUrl(items[0].image)} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    order.displayName.charAt(0)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform">{order.displayName}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-widest">
                                                                    {items.length} قطع • {order.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 text-center text-xs font-black text-slate-500">
                                                        {new Date(order.displayDate).toLocaleDateString('ar-OM')}
                                                    </td>
                                                    <td className="px-8 py-8 text-center">
                                                        <div className="px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 text-sm font-black text-emerald-600 inline-block shadow-sm">
                                                            {order.displayTotal.toFixed(3)} ر.ع
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 text-center">
                                                        <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border-2 ${order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                                order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                                    'bg-blue-50 text-blue-600 border-blue-100/50'
                                                            }`}>
                                                            {order.status === 'pending' ? 'معلق' : order.status === 'completed' ? 'مكتمل' : 'نشط'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-8 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => setSelectedOrder(order)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><Eye size={18} /></button>
                                                            <button onClick={() => handleDelete(order.id)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-green-500/30 relative overflow-hidden group">
                        <div className="absolute -right-5 -top-5 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        <ShoppingCart className="mb-6 opacity-40 group-hover:rotate-12 transition-transform" size={40} strokeWidth={1.5} />
                        <p className="text-green-100 text-[10px] font-black uppercase tracking-[0.3em] mb-1">إجمالي الحجم</p>
                        <h2 className="text-5xl font-black tracking-tighter">{stats.total}</h2>
                        <div className="mt-8 flex items-baseline gap-1">
                            <span className="text-xs font-bold opacity-60">القيمة الإجمالية:</span>
                            <span className="text-lg font-black">{stats.revenue.toFixed(2)} ر.ع</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3 text-sm">
                            <Filter size={20} className="text-emerald-500" />
                            نظرة عامة على الحالات
                        </h4>
                        <div className="space-y-4">
                            {tabs.filter(t => t.id !== 'all').map(tab => {
                                const count = orders.filter(o => o.status === tab.id).length;
                                return (
                                    <div key={tab.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/20 transition-colors">
                                        <span className="text-xs font-black text-slate-400 group-hover:text-slate-600 transition-colors">{tab.label}</span>
                                        <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm border border-slate-100 dark:border-slate-800 group-hover:bg-emerald-500 group-hover:text-white transition-all">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10">
                        <div className="flex items-center gap-3 text-amber-500 mb-4">
                            <AlertTriangle size={20} />
                            <h4 className="font-black text-xs uppercase tracking-widest">ملاحظة تقنية</h4>
                        </div>
                        <p className="text-[10px] text-amber-700 dark:text-amber-500/70 leading-relaxed font-bold">يتم تحديث إجمالي الإيرادات بناءً على الطلبات التي تحمل حالة "مكتمل" أو "تم التوصيل" فقط لضمان دقة التقارير المالية.</p>
                    </div>
                </div>
            </div>

            {/* Modal Detail Overlay */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/30">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-green-500/20">
                                    <Package size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white">تفاصيل الطلب #{selectedOrder.id}</h2>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white dark:bg-slate-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"><X size={24} /></button>
                        </div>

                        <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">العلومات الشخصية</h3>
                                        <div className="space-y-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400">الاسم</span>
                                                <span className="font-black text-slate-800 dark:text-white">{selectedOrder.displayName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400">الهاتف</span>
                                                <span className="font-black text-slate-800 dark:text-white" dir="ltr">{selectedOrder.phone}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400">العنوان</span>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-2xl mt-2 border border-slate-100 dark:border-slate-800">{selectedOrder.address || 'غير متوفر'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">التحكم بالحالة</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {tabs.filter(t => t.id !== 'all').map((st) => (
                                                <button
                                                    key={st.id}
                                                    onClick={() => updateStatus(selectedOrder.id, st.id)}
                                                    className={`py-4 rounded-2xl text-[10px] font-black transition-all border-2 ${selectedOrder.status === st.id
                                                            ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-green-500/20'
                                                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30'
                                                        }`}
                                                >
                                                    {st.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">مكونات الطلب</h3>
                                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(typeof selectedOrder.total_products === 'string'
                                            ? JSON.parse(selectedOrder.total_products)
                                            : (selectedOrder.total_products || [])
                                        ).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-5 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm group/item hover:border-emerald-500/20 transition-all">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-900 group-hover/item:scale-110 transition-transform">
                                                    {item.image ? (
                                                        <img src={getProductImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300"><Package size={24} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-black text-sm text-slate-800 dark:text-white truncate">{item.name}</div>
                                                    <div className="text-xs font-black text-emerald-500 mt-1">{item.quantity} × {Number(item.price).toFixed(3)} ر.ع</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8 border-t dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">الإجمالي النهائي</span>
                                        <span className="text-3xl font-black text-emerald-600">{selectedOrder.displayTotal.toFixed(3)} <span className="text-xs font-bold opacity-60">ر.ع</span></span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(selectedOrder.id)}
                                className="w-full py-6 mt-6 bg-red-50 text-red-500 font-black rounded-3xl border border-red-100/50 hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-4 text-xl"
                            >
                                <Trash2 size={28} /> حذف البيانات نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
