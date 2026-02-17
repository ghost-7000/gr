'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
    const { checkSession } = useAuthStore();
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (error) {
                console.error(error);
                toast.error(error.message);
            } else if (data.user) {
                toast.success('تم تسجيل الدخول بنجاح! 👋');

                // Update store and session
                await checkSession();

                // Small delay to allow store update to propagate 
                setTimeout(() => {
                    const currentUser = useAuthStore.getState().user;
                    if (currentUser?.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                    router.refresh();
                }, 300);
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--color-surface-alt)] to-white dark:to-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 md:p-10 border-t-4 border-[var(--color-gold)] dark:border-[var(--color-gold)]"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
                        <h2 className="text-4xl font-black text-[#1B5E20] dark:text-[#4ADE80] tracking-tight">GRMC</h2>
                    </Link>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shadow-inner">
                        <LogIn size={32} className="text-[var(--color-primary)] dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white relative pb-4 inline-block">
                        تسجيل الدخول
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--color-gold)] rounded-full" />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">مرحباً بك مجدداً في غيمة خير</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Mail size={16} className="inline ml-1 text-slate-400" />
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[var(--color-primary)] dark:focus:border-[var(--color-primary-light)] transition-all outline-none text-slate-900 dark:text-white dark:placeholder-slate-500"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Lock size={16} className="inline ml-1 text-slate-400" />
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-4 py-3 pl-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[var(--color-primary)] dark:focus:border-[var(--color-primary-light)] transition-all outline-none text-slate-900 dark:text-white dark:placeholder-slate-500"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-light)] transition-colors"
                            >
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-l from-[#1B5E20] to-[#2E7D32] text-white text-lg font-bold shadow-lg shadow-green-900/10 hover:shadow-green-900/20 transition-all flex items-center justify-center gap-2 rounded-xl mt-4 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">ليس لديك حساب؟</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-8 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-light)] hover:bg-green-50 dark:hover:bg-green-900/10 transition-all w-full"
                    >
                        إنشاء حساب جديد
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
