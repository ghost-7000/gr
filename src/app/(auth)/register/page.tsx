'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterPage() {
    const { checkSession } = useAuthStore();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPass: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password || !form.confirmPass) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        if (form.password !== form.confirmPass) {
            toast.error('كلمات المرور غير متطابقة!');
            return;
        }

        if (form.password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name,
                        role: 'user',
                    },
                },
            });

            if (error) {
                console.error(error);
                if (error.message.includes('rate limit')) {
                    toast.error('تم تجاوز حد إرسال رسائل البريد الإلكتروني. يرجى الانتظار قليلاً أو تعطيل "تأكيد البريد" من إعدادات Supabase.');
                } else {
                    toast.error(error.message);
                }
            } else {
                toast.success('تم إنشاء الحساب بنجاح! 🎊');

                // If auto-logged in by Supabase (standard behavior if email confirmation is off)
                if (data.session) {
                    await checkSession();
                    router.push('/');
                } else {
                    toast.info('يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب 📧');
                    setTimeout(() => router.push('/login'), 2000);
                }
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
                className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 md:p-10 border-t-4 border-[var(--color-primary-light)] dark:border-[var(--color-primary)]"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
                        <h2 className="text-4xl font-black text-[#1B5E20] dark:text-[#4ADE80] tracking-tight">GRMC</h2>
                    </Link>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shadow-inner">
                        <UserPlus size={32} className="text-[var(--color-primary)] dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white relative pb-4 inline-block">
                        إنشاء حساب جديد
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--color-gold)] rounded-full" />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">انضم إلى مجتمعنا اليوم</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <User size={16} className="inline ml-1 text-slate-400" />
                            الاسم الكامل
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[var(--color-primary)] dark:focus:border-[var(--color-primary-light)] transition-all outline-none text-slate-900 dark:text-white dark:placeholder-slate-500"
                            placeholder="الاسم الكامل"
                            required
                        />
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[var(--color-primary)] dark:focus:border-[var(--color-primary-light)] transition-all outline-none text-sm text-slate-900 dark:text-white dark:placeholder-slate-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <CheckCircle size={16} className="inline ml-1 text-slate-400" />
                                تأكيد
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.confirmPass}
                                    onChange={(e) => setForm({ ...form, confirmPass: e.target.value })}
                                    className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[var(--color-primary)] dark:focus:border-[var(--color-primary-light)] transition-all outline-none text-sm text-slate-900 dark:text-white dark:placeholder-slate-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-light)] cursor-pointer"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-l from-[#1B5E20] to-[#2E7D32] text-white text-lg font-bold shadow-lg shadow-green-900/10 hover:shadow-green-900/20 transition-all flex items-center justify-center gap-2 rounded-xl mt-6 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                    </button>
                </form>

                <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">لديك حساب بالفعل؟</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-8 py-3 border-2 border-[var(--color-gold)] text-slate-800 dark:text-white rounded-xl font-bold hover:bg-[var(--color-gold)] hover:text-white transition-all w-full"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
