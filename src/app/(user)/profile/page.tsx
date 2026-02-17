'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Lock, Save, Package, Shield, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, checkSession } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates: any = {
                data: { full_name: name }
            };

            if (password) {
                if (password.length < 6) {
                    toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                    setLoading(false);
                    return;
                }
                updates.password = password;
            }

            const { error } = await supabase.auth.updateUser(updates);
            if (error) throw error;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name, updated_at: new Date().toISOString() })
                .eq('id', user!.id);

            if (profileError) console.warn('Profile table update failed:', profileError);

            toast.success('تم تحديث الملف الشخصي بنجاح ✅');
            await checkSession();
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء التحديث');
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    if (!isClient) return null;

    if (!user) return (
        <div className="min-h-screen bg-[var(--color-surface)] py-12 pt-32 flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
                <div className="w-20 h-20 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)]">
                    <User size={40} />
                </div>
                <h2 className="text-2xl font-black text-[var(--color-text)] mb-4">يجب تسجيل الدخول</h2>
                <Link href="/login" className="btn btn-primary w-full shadow-lg">تسجيل الدخول</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-surface-alt)] py-12 pt-32 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-[var(--color-text)] mb-2">الملف الشخصي</h1>
                    <p className="text-[var(--color-text-light)] font-bold">إدارة معلومات حسابك وكلمة المرور</p>
                </div>

                <div className="bg-[var(--color-surface)] rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-black/5 border border-[var(--color-border)] overflow-hidden">
                    <div className="p-5 md:p-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-green-500/20">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center md:text-right flex-1">
                                <h2 className="text-2xl font-black text-[var(--color-text)] mb-1">{user.name}</h2>
                                <p className="text-[var(--color-text-light)] font-medium mb-4">{user.email}</p>
                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full font-black border ${user.role === 'admin'
                                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                    : 'bg-green-500/10 text-green-600 border-green-500/20'
                                    }`}>
                                    {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                                    {user.role === 'admin' ? 'مدير النظام' : 'مستخدِم'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-[var(--color-text-lighter)] uppercase tracking-widest px-1">
                                    الاسم الكامل
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)]" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-[var(--color-primary-light)] transition-all text-sm font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 opacity-70">
                                <label className="block text-xs font-black text-[var(--color-text-lighter)] uppercase tracking-widest px-1">
                                    البريد الإلكتروني (ثابت)
                                </label>
                                <div className="relative">
                                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)]" />
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl cursor-not-allowed text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-xs font-black text-[var(--color-text-lighter)] uppercase tracking-widest px-1">
                                    تغيير كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)]" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-[var(--color-primary-light)] transition-all text-sm font-bold"
                                        placeholder="اتركها فارغة إذا لم ترد التغيير"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="md:col-span-2 btn btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 shadow-green-500/20 hover:shadow-green-500/40 mt-4 transition-all"
                            >
                                <Save size={20} />
                                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/orders" className="btn btn-outline border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] rounded-2xl py-4 flex items-center justify-center gap-3 font-black">
                        <Package size={20} className="text-[var(--color-primary)]" />
                        سجل طلباتي
                    </Link>

                    {user.role === 'admin' && (
                        <Link href="/admin" className="btn btn-outline border-purple-500/20 bg-purple-500/5 text-purple-600 hover:bg-purple-500/10 rounded-2xl py-4 flex items-center justify-center gap-3 font-black">
                            <Shield size={20} />
                            لوحة التحكم
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
