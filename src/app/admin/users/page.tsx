'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    Search,
    User,
    Trash2,
    Mail,
    Calendar,
    Shield,
    Loader2,
    CheckCircle2,
    XCircle,
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        if (error) toast.error('خطأ في جلب المستخدمين');
        setLoading(false);
    }

    async function handleDelete(userId: string, userName: string) {
        if (!confirm(`هل أنت متأكد من حذف المستخدم \"${userName}\"؟ سيتم حذف جميع بياناته.`)) return;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (!error) {
            setUsers(users.filter(u => u.id !== userId));
            toast.success('تم حذف المستخدم بنجاح');
        } else {
            toast.error('حدث خطأ أثناء الحذف');
        }
    }

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text)]">إدارة المستخدمين</h1>
                    <p className="text-[var(--color-text-light)] mt-1">عرض ومتابعة حسابات المسجلين في الموقع</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-[var(--color-text)]"
                />
            </div>

            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin text-green-600 mx-auto" size={40} /></div>
            ) : (
                <div className="bg-[var(--color-surface)] rounded-[2rem] shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                                    <th className="p-6 font-black text-[var(--color-text)]">المستخدم</th>
                                    <th className="p-6 font-black text-[var(--color-text-light)]">البريد الإلكتروني</th>
                                    <th className="p-6 font-black text-[var(--color-text-light)]">تاريخ التسجيل</th>
                                    <th className="p-6 font-black text-[var(--color-text)]">العمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold border border-green-100 dark:border-green-900/30">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-[var(--color-text)]">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-[var(--color-text-light)] font-bold">{user.email}</td>
                                        <td className="p-6 text-sm text-[var(--color-text-lighter)] font-bold">
                                            {new Date(user.created_at).toLocaleDateString('ar-OM')}
                                        </td>
                                        <td className="p-6">
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 font-bold text-xs"
                                            >
                                                <Trash2 size={16} /> حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
