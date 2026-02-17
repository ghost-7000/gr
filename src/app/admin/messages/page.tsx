'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    Mail,
    Trash2,
    CheckCircle2,
    Clock,
    Search,
    Loader2,
    MessageSquare,
    User,
    Calendar,
    Phone,
    Eye,
    X
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMsg, setSelectedMsg] = useState<any>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setMessages(data);
        if (error) toast.error('خطأ في جلب الرسائل');
        setLoading(false);
    }

    async function toggleRead(id: number, currentStatus: boolean) {
        const { error } = await supabase
            .from('messages')
            .update({ read: !currentStatus })
            .eq('id', id);

        if (!error) {
            setMessages(messages.map(m => m.id === id ? { ...m, read: !currentStatus } : m));
            toast.success('تم تحديث الحالة');
        } else {
            toast.error('فشل تحديث الحالة');
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (!error) {
            setMessages(messages.filter(m => m.id !== id));
            toast.success('تم حذف الرسالة');
            if (selectedMsg?.id === id) setSelectedMsg(null);
        } else {
            toast.error('فشل الحذف');
        }
    }

    const filtered = messages.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: messages.length,
        unread: messages.filter(m => !m.read).length
    };

    return (
        <div className="space-y-8 text-right" dir="rtl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Mail className="text-blue-500" size={32} />
                        صندوق الرسائل
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">عرض وإدارة استفسارات العملاء العامة</p>
                </div>
            </div>

            {/* Statistics Cards (Legacy Parity) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-[2.5rem] bg-slate-100 text-slate-700 shadow-sm border border-white/50 dark:border-slate-800 flex flex-col items-center gap-2">
                    <Mail className="text-2xl opacity-80" />
                    <div className="text-3xl font-black">{stats.total}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest">إجمالي الرسائل</div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-blue-100 text-blue-700 shadow-sm border border-white/50 dark:border-slate-800 flex flex-col items-center gap-2">
                    <Clock className="text-2xl opacity-80" />
                    <div className="text-3xl font-black">{stats.unread}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest">رسائل غير مقروءة</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو محتوى الرسالة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800 dark:text-white"
                />
            </div>

            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin text-emerald-600 mx-auto" size={40} /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <Mail className="mx-auto mb-4 text-slate-200 dark:text-slate-700" size={60} />
                    <p className="text-slate-400 font-bold">لا توجد رسائل حالياً</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((msg) => (
                        <div key={msg.id} className={`group bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl ${!msg.read ? 'border-r-8 border-r-emerald-500' : 'opacity-80'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${!msg.read ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                        {msg.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 dark:text-white">{msg.name}</h3>
                                        <div className="flex gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                                            <Calendar size={10} /> {new Date(msg.created_at).toLocaleDateString('ar-OM')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleRead(msg.id, !!msg.read)}
                                        className={`p-2 rounded-xl transition-all ${!msg.read ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}
                                    >
                                        {msg.read ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed line-clamp-3 mb-4 min-h-[60px]">
                                {msg.message}
                            </p>

                            <button
                                onClick={() => setSelectedMsg(msg)}
                                className="w-full py-2.5 text-xs font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Eye size={14} /> عرض التفاصيل
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedMsg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">تفاصيل الرسالة</h2>
                            <button onClick={() => setSelectedMsg(null)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 border border-slate-100 dark:border-slate-700">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800"><User size={24} /></div>
                                <div>
                                    <div className="font-black text-slate-800 dark:text-white">{selectedMsg.name}</div>
                                    <div className="text-sm font-bold text-slate-500">{selectedMsg.email}</div>
                                </div>
                            </div>

                            {selectedMsg.phone && (
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                                    <Phone size={18} className="text-emerald-500" /> {selectedMsg.phone}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">محتوى الرسالة</div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold leading-relaxed whitespace-pre-wrap">
                                    {selectedMsg.message}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={() => { toggleRead(selectedMsg.id, selectedMsg.read); setSelectedMsg(null); }}
                                    className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                >
                                    {selectedMsg.read ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedMsg.id)}
                                    className="px-6 py-4 bg-red-50 text-red-500 font-black rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
