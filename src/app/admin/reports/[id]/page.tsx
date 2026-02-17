'use client';

import { useState, useEffect, use } from 'react';
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
    X,
    Loader2,
    User,
    Phone,
    Mail,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import for Leaflet Map
import dynamic from 'next/dynamic';
const AdminReportMap = dynamic(() => import('@/components/admin/AdminReportMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400">جاري تحميل الخريطة...</div>
});

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showFullImage, setShowFullImage] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [id]);

    async function fetchReport() {
        setLoading(true);
        const { data, error } = await supabase
            .from('marble_reports')
            .select('*')
            .eq('id', id)
            .single();

        if (data) setReport(data);
        if (error) {
            toast.error('خطأ في جلب تفاصيل البلاغ');
            console.error(error);
        }
        setLoading(false);
    }

    async function updateStatus(newStatus: string) {
        const { error } = await supabase
            .from('marble_reports')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setReport({ ...report, status: newStatus });
            toast.success('تم تحديث الحالة');
        } else {
            toast.error('فشل التحديث');
        }
    }

    async function saveNotes(notes: string) {
        const { error } = await supabase
            .from('marble_reports')
            .update({ admin_notes: notes })
            .eq('id', id);
        if (error) toast.error('فشل حفظ الملاحظات');
        else toast.success('تم حفظ الملاحظات');
    }

    async function updatePriority(newPriority: string) {
        const { error } = await supabase
            .from('marble_reports')
            .update({ priority: newPriority })
            .eq('id', id);

        if (!error) {
            setReport({ ...report, priority: newPriority });
            toast.success('تم تحديث الأولوية');
        } else {
            toast.error('فشل تحديث الأولوية');
        }
    }

    async function toggleUrgent(currentUrgent: boolean) {
        const { error } = await supabase
            .from('marble_reports')
            .update({ is_urgent: !currentUrgent })
            .eq('id', id);

        if (!error) {
            setReport({ ...report, is_urgent: !currentUrgent });
            toast.success('تم تحديث حالة الاستعجال');
        } else {
            toast.error('فشل التحديث');
        }
    }

    async function handleDelete() {
        if (!confirm('هل أنت متأكد من حذف هذا البلاغ نهائياً؟')) return;
        const { error } = await supabase.from('marble_reports').delete().eq('id', id);
        if (!error) {
            toast.success('تم حذف البلاغ');
            router.push('/admin/reports');
        } else {
            toast.error('فشل الحذف');
        }
    }

    const statusMap: any = {
        pending: { label: 'معلق', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock size={16} /> },
        in_progress: { label: 'جاري المعالجة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <RefreshCw size={16} /> },
        completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle2 size={16} /> }
    };

    const priorityMap: any = {
        high: { label: 'عالية', color: 'text-red-500 bg-red-50' },
        medium: { label: 'متوسطة', color: 'text-amber-500 bg-amber-50' },
        normal: { label: 'منخفضة', color: 'text-emerald-500 bg-emerald-50' }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="animate-spin text-emerald-600" size={60} />
            <p className="text-slate-400 font-black animate-pulse">جاري جلب تفاصيل البلاغ...</p>
        </div>
    );

    if (!report) return (
        <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
            <ShieldAlert className="text-red-500 mx-auto mb-6" size={64} />
            <p className="text-slate-400 font-black text-2xl">هذا البلاغ غير موجود أو تم حذفه</p>
            <Link href="/admin/reports" className="mt-8 text-emerald-600 font-black flex items-center justify-center gap-2 underline">
                <ArrowRight size={20} /> العودة إلى قائمة البلاغات
            </Link>
        </div>
    );

    return (
        <div className="space-y-8 text-right" dir="rtl">
            <div className="flex items-center justify-between mb-6">
                <Link href="/admin/reports" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-black transition-all">
                    <ArrowRight size={20} /> العودة للمسودة
                </Link>
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-black">
                    <AlertTriangle size={14} />
                    رقم البلاغ #{report.id}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar: Details & Actions */}
                <div className="w-full md:w-[450px] p-10 md:p-12 space-y-10 border-b md:border-b-0 md:border-l dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">{report.name}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-700"><User size={24} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">صاحب البلاغ</div>
                                <div className="font-black text-lg text-slate-800 dark:text-white">{report.name}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-blue-500 shadow-sm border border-slate-100 dark:border-slate-700"><Phone size={24} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</div>
                                <div className="font-black text-lg text-slate-800 dark:text-white">{report.phone}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-purple-500 shadow-sm border border-slate-100 dark:border-slate-700"><Mail size={24} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">البريد الإلكتروني</div>
                                <div className="font-black text-lg text-slate-800 dark:text-white">{report.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الأولوية وحالة الاستعجال</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleUrgent(!!report.is_urgent)}
                                    className={`flex-1 py-4 rounded-3xl font-black text-xs flex items-center justify-center gap-2 transition-all ${report.is_urgent ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                                >
                                    <ShieldAlert size={16} />
                                    {report.is_urgent ? 'عاجل جداً' : 'تفعيل الاستعجال'}
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.keys(priorityMap).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => updatePriority(p)}
                                        className={`py-3 rounded-2xl font-black text-[10px] uppercase transition-all border-2 ${report.priority === p ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent bg-white text-slate-400'}`}
                                    >
                                        {priorityMap[p].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t dark:border-slate-800">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">تحديث حالة المعالجة</label>
                            <div className="grid grid-cols-1 gap-3">
                                {Object.keys(statusMap).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(s)}
                                        className={`flex items-center justify-between p-5 rounded-3xl font-black text-sm border-2 transition-all ${report.status === s ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-transparent bg-white dark:bg-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            {statusMap[s].icon}
                                            {statusMap[s].label}
                                        </span>
                                        {report.status === s && <CheckCircle2 size={20} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleDelete}
                            className="w-full py-5 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10"
                        >
                            <Trash2 size={24} />
                            حذف هذا البلاغ نهائياً
                        </button>
                    </div>
                </div>

                {/* Main Content: Info & Mapping */}
                <div className="flex-1 p-10 md:p-16 space-y-12">
                    <div className="space-y-6">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                            وصف البلاغ والموقع المكتوب
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                            <p className="font-black text-2xl text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="text-emerald-500" />
                                {report.location}
                            </p>
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                "{report.description}"
                            </p>
                        </div>
                    </div>

                    {/* Map Visualization */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
                                الموقع الجغرافي الدقيق (GPS)
                            </div>
                            {report.latitude && (
                                <a
                                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 bg-slate-800 text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl"
                                >
                                    <ExternalLink size={14} />
                                    فتح في خرائط جوجل
                                </a>
                            )}
                        </div>

                        <div className="h-[400px] rounded-[3.5rem] overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-2xl relative z-0">
                            {report.latitude ? (
                                <AdminReportMap
                                    lat={Number(report.latitude)}
                                    lng={Number(report.longitude)}
                                    name={report.name}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                                    <ShieldAlert className="text-slate-200 dark:text-slate-700 mb-4" size={60} />
                                    <p className="font-black text-slate-400">لا تتوفر إحداثيات GPS لهذا البلاغ</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Attachment */}
                    {report.image_url && (
                        <div className="space-y-6">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
                                الصورة المرفقة للمخلفات
                            </div>
                            <div
                                onClick={() => setShowFullImage(true)}
                                className="relative h-[400px] w-full rounded-[3.5rem] overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-2xl group cursor-zoom-in"
                            >
                                <Image src={report.image_url} alt="Report Attachment" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
                                    <p className="text-white font-black text-xl">انقر لعرض الصورة بكامل الحجم</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Notes Section */}
                    <div className="space-y-6 pt-10 border-t dark:border-slate-800">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-8 h-1 bg-slate-400 rounded-full"></div>
                            سجل ملاحظات الإدارة والمتابعة
                        </div>
                        <div className="relative">
                            <textarea
                                defaultValue={report.admin_notes}
                                placeholder="اكتب تفاصيل الإجراءات المتخذة هنا... (يتم الحفظ تلقائياً عند النقر خارج الصندوق)"
                                className="w-full p-8 bg-white dark:bg-slate-950 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 font-bold text-lg text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[180px] resize-none shadow-inner"
                                onBlur={e => saveNotes(e.target.value)}
                            />
                            <div className="absolute bottom-6 left-8 flex items-center gap-2 text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                                <Clock size={12} />
                                نظام الحفظ التلقائي نشط
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Size Image Modal */}
            <AnimatePresence>
                {showFullImage && report.image_url && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFullImage(false)}
                        className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    >
                        <motion.button
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
                        >
                            <X size={40} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="relative w-full max-w-7xl h-full max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={report.image_url}
                                alt="Full Size Report Image"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
