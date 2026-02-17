'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import {
    Shield,
    UserPlus,
    ShieldAlert,
    Trash2,
    Search,
    Loader2,
    BadgeCheck,
    AlertCircle,
    UserX,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAccountsPage() {
    const { user: currentUser } = useAuthStore();
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [promoting, setPromoting] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    async function fetchAdmins() {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'admin')
            .order('created_at', { ascending: false });

        if (data) setAdmins(data);
        setLoading(false);
    }

    async function promoteToAdmin() {
        if (!searchEmail) return;
        setPromoting(true);

        // First find user by email
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', searchEmail)
            .single();

        if (error || !data) {
            toast.error('المستخدم غير موجود بهذا البريد الإلكتروني');
        } else if (data.role === 'admin') {
            toast.error('هذا المستخدم مسؤول بالفعل');
        } else {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', data.id);

            if (!updateError) {
                toast.success('تمت إضافة المسؤول بنجاح');
                setSearchEmail('');
                fetchAdmins();
            } else {
                toast.error('فشل تحديث الصلاحيات');
            }
        }
        setPromoting(false);
    }

    async function demoteAdmin(userId: string, userName: string) {
        if (userId === currentUser?.id) {
            toast.error('لا يمكنك إزالة صلاحياتك الخاصة!');
            return;
        }

        if (!confirm(`هل أنت متأكد من إزالة صلاحيات الأدمن عن \"${userName}\"؟`)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('id', userId);

        if (!error) {
            setAdmins(admins.filter(a => a.id !== userId));
            toast.success('تمت إزالة الصلاحيات بنجاح');
        } else {
            toast.error('حدث خطأ أثناء المحاولة');
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text)]">إدارة المسؤولين</h1>
                    <p className="text-[var(--color-text-light)] mt-1">إضافة وإزالة صلاحيات المدراء في الموقع</p>
                </div>
            </div>

            {/* Promote Section */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <ShieldAlert className="text-amber-400" size={28} />
                            </div>
                            <h2 className="text-2xl font-black">ترقية مسؤول جديد</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">أدخل البريد الإلكتروني للمستخدم المسجل لترقيته إلى رتبة "أدمن". سيكون لديه كامل الصلاحيات لإدارة المنتجات والطلبات.</p>
                    </div>
                    <div className="w-full md:w-96 flex gap-2">
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold"
                        />
                        <button
                            onClick={promoteToAdmin}
                            disabled={promoting}
                            className="bg-green-600 hover:bg-green-500 p-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {promoting ? <Loader2 className="animate-spin" /> : <UserPlus size={24} />}
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin text-green-600 mx-auto" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin) => (
                        <div key={admin.id} className="group bg-[var(--color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-xl transition-all h-fit">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl border border-indigo-100 dark:border-indigo-900/30">
                                        {admin.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="font-black text-[var(--color-text)]">{admin.name}</h3>
                                            <BadgeCheck className="text-blue-500" size={16} />
                                        </div>
                                        <p className="text-xs text-[var(--color-text-lighter)] font-bold mt-1">{admin.email}</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg ${admin.email === currentUser?.email ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-lighter)]'}`}>
                                    <Shield size={18} />
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase text-[var(--color-text-lighter)] tracking-widest">المسؤول</div>
                                {admin.email !== currentUser?.email ? (
                                    <button
                                        onClick={() => demoteAdmin(admin.id, admin.name)}
                                        className="text-xs font-black text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <UserX size={14} /> سحب الصلاحيات
                                    </button>
                                ) : (
                                    <span className="text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <Lock size={14} /> أنت (المتحكم)
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
