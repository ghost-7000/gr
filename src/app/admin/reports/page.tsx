'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    Trash2,
    ExternalLink,
    RefreshCw,
    ShieldAlert,
    Eye,
    X,
    Loader2,
    Calendar,
    User,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// Dynamic import for Leaflet Map
import dynamic from 'next/dynamic';
const AdminReportMap = dynamic(() => import('@/components/admin/AdminReportMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400">جاري تحميل الخريطة...</div>
});

import Link from 'next/link';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    async function fetchReports() {
        setLoading(true);
        const { data, error } = await supabase
            .from('marble_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setReports(data);
        if (error) toast.error('خطأ في جلب البلاغات');
        setLoading(false);
    }

    const statusMap: any = {
        pending: { label: 'معلق', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock size={16} /> },
        in_progress: { label: 'جاري المعالجة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <RefreshCw size={16} /> },
        completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle2 size={16} /> }
    };

    const filtered = reports.filter(r => filter === 'all' || r.status === filter);

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        inProgress: reports.filter(r => r.status === 'in_progress').length,
        completed: reports.filter(r => r.status === 'completed').length,
        urgent: reports.filter(r => r.is_urgent).length
    };

    return (
        <div className="space-y-10 text-right" dir="rtl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <AlertTriangle className="text-amber-500" size={36} />
                        إدارة البلاغات البيئية
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">متابعة ومعالجة بلاغات مخلفات الرخام من المواطنين</p>
                </div>

                <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                    {['all', 'pending', 'in_progress', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${filter === f ? 'bg-slate-800 dark:bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {f === 'all' ? 'عرض الكل' : statusMap[f].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Statistics Cards (Legacy Parity) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'إجمالي البلاغات', value: stats.total, icon: <AlertTriangle />, color: 'bg-slate-100 text-slate-700' },
                    { label: 'قيد الانتظار', value: stats.pending, icon: <Clock />, color: 'bg-amber-100 text-amber-700' },
                    { label: 'جاري المعالجة', value: stats.inProgress, icon: <RefreshCw />, color: 'bg-blue-100 text-blue-700' },
                    { label: 'مكتملة', value: stats.completed, icon: <CheckCircle2 />, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'عاجلة جداً', value: stats.urgent, icon: <ShieldAlert />, color: 'bg-red-100 text-red-700' }
                ].map((s, idx) => (
                    <div key={idx} className={`p-6 rounded-[2.5rem] shadow-sm border border-white/50 dark:border-slate-800 flex flex-col items-center gap-2 ${s.color}`}>
                        <div className="text-2xl opacity-80">{s.icon}</div>
                        <div className="text-3xl font-black">{s.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                    <Loader2 className="animate-spin text-emerald-600" size={60} />
                    <p className="text-slate-400 font-black animate-pulse">جاري جلب البلاغات...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-slate-200 dark:text-slate-700" size={48} />
                    </div>
                    <p className="text-slate-400 font-black text-2xl">لا توجد بلاغات حالياً ضمن هذا التصنيف</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((r) => (
                        <Link
                            key={r.id}
                            href={`/admin/reports/${r.id}`}
                            className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden ${r.is_urgent ? 'ring-4 ring-red-500/20' : ''}`}
                        >
                            {r.is_urgent && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white px-6 py-2 rounded-bl-[2rem] font-black text-[10px] tracking-widest uppercase flex items-center gap-2 z-10">
                                    <ShieldAlert size={14} className="animate-pulse" />
                                    بلاغ عاجل
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6 pt-2">
                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${statusMap[r.status].color}`}>
                                    {statusMap[r.status].icon}
                                    {statusMap[r.status].label}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <Calendar size={12} />
                                    {new Date(r.created_at).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl shadow-inner uppercase">
                                    {r.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white">{r.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                        <MapPin size={12} className="text-emerald-500" />
                                        {r.location?.length > 30 ? r.location.substring(0, 30) + '...' : r.location}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed mb-6 line-clamp-3 min-h-[90px] group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                                {r.description}
                            </div>

                            <div className="w-full py-4 bg-slate-800 dark:bg-slate-800 group-hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-center">
                                <Eye size={16} /> عرض تفاصيل البلاغ
                                <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
