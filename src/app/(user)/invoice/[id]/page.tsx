'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Printer, Home, Loader2, Package, ArrowRight, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrder();
    }, [user, id]);

    async function fetchOrder() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error("Order not found or error:", error);
                return;
            }

            // Security Check: Only the owner or Admin can view
            if (user && data.user_id !== user.id && user.role !== 'admin') {
                router.push('/');
                return;
            }

            setOrder(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-alt)]">
                <div className="text-center">
                    <Loader2 className="animate-spin text-[var(--color-primary)] mx-auto mb-4" size={48} />
                    <p className="text-[var(--color-text-light)] font-bold">جاري تحميل الفاتورة...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-alt)] px-4">
                <FileText size={64} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-black text-gray-800">عذراً، الطلب غير موجود</h2>
                <Link href="/shop" className="mt-6 btn btn-primary px-8">العودة للمتجر</Link>
            </div>
        );
    }

    // Parse products stored as JSON string
    let products = [];
    try {
        products = typeof order.total_products === 'string'
            ? JSON.parse(order.total_products)
            : order.total_products || [];
    } catch (e) {
        console.error("Error parsing products", e);
        products = [];
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface-alt)] py-12 md:py-20 print:bg-white print:py-0 font-sans print:m-0">
            <div className="max-w-4xl mx-auto bg-white dark:bg-[var(--color-surface)] shadow-2xl rounded-[2.5rem] overflow-hidden print:shadow-none print:rounded-none print:w-full border border-[var(--color-border)]">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white p-8 md:p-14 text-center print:bg-white print:text-black print:border-b-4 print:border-[#1B5E20] relative">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 mb-6 bg-white rounded-2xl p-2 flex items-center justify-center shadow-xl print:shadow-none print:border print:border-gray-200">
                            <img src="/images/logo.png" alt="GRMC" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 print:text-5xl">فاتورة شراء</h1>
                        <p className="text-xl opacity-80 font-black tracking-widest dir-ltr">ORDER #{order.id}</p>

                        <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-sm font-black border border-white/20 print:hidden">
                            <CheckCircle size={18} className="text-[#FFD700]" />
                            تم الدفع بنجاح
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-16 print:p-0 print:mt-10">

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 print:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="text-[#1B5E20] dark:text-green-400 font-black text-xl flex items-center gap-2">
                                <div className="w-2 h-6 bg-[#FFD700] rounded-full"></div>
                                من: شركة GRMC
                            </h2>
                            <ul className="space-y-2 text-[var(--color-text-light)] font-bold">
                                <li className="text-[var(--color-text)] font-black text-lg underline decoration-[#FFD700] decoration-2 underline-offset-4">شركة المطابقة العالمية للرخام</li>
                                <li>سلطنة عمان - ولاية عبري</li>
                                <li className="dir-ltr text-right">info@grmc.com</li>
                                <li className="dir-ltr text-right">+968 1234 5678</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-[#1B5E20] dark:text-green-400 font-black text-xl flex items-center gap-2">
                                <div className="w-2 h-6 bg-[#FFD700] rounded-full"></div>
                                إلى: العميل
                            </h2>
                            <ul className="space-y-2 text-[var(--color-text-light)] font-bold">
                                <li className="text-[var(--color-text)] font-black text-lg">{order.full_name}</li>
                                <li>{order.email}</li>
                                <li>{order.phone}</li>
                                <li className="bg-[var(--color-surface-alt)] p-3 rounded-xl border border-[var(--color-border)] text-sm">{order.address}</li>
                                <li className="font-black text-[#1B5E20] dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg inline-block">
                                    {order.method === 'cash' ? 'الدفع عند الاستلام 💵' : 'تحويل بنكي 🏦'}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-3xl border border-[var(--color-border)] overflow-hidden mb-12 shadow-sm">
                        <table className="w-full text-right">
                            <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-6 py-5 font-black text-[var(--color-text)]">المنتج</th>
                                    <th className="px-6 py-5 font-black text-[var(--color-text)] text-center">الكمية</th>
                                    <th className="px-6 py-5 font-black text-[var(--color-text)] text-center">السعر</th>
                                    <th className="px-6 py-5 font-black text-[var(--color-text)] text-center">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {products.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5 font-bold text-[var(--color-text)]">{item.name}</td>
                                        <td className="px-6 py-5 text-center text-[var(--color-text-light)] font-bold">x{item.quantity}</td>
                                        <td className="px-6 py-5 text-center text-[var(--color-text-light)] font-bold">{Number(item.price).toFixed(3)} ر.ع</td>
                                        <td className="px-6 py-5 text-center font-black text-[var(--color-primary)]">{(item.price * item.quantity).toFixed(3)} ر.ع</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[var(--color-surface-alt)]">
                                <tr className="border-t-2 border-[#1B5E20]">
                                    <td colSpan={3} className="px-6 py-6 text-xl font-black text-[var(--color-text)] text-left">المجموع الكلي النهائي</td>
                                    <td className="px-6 py-6 text-center text-2xl font-black text-[#1B5E20] bg-green-500/5">
                                        {Number(order.total_price || order.total).toFixed(3)} ر.ع
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Note */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-6 rounded-3xl text-center mb-10">
                        <p className="text-yellow-800 dark:text-yellow-400 font-bold mb-1">شكراً لثقتكم بشركة GRMC</p>
                        <p className="text-xs text-yellow-700/70 dark:text-yellow-400/60 font-medium">تم إنشاء هذه الفاتورة إلكترونياً وهي صالحة للمراجعة والطباعة</p>
                    </div>

                    <div className="flex justify-center gap-10 text-[10px] text-gray-400 font-black uppercase tracking-widest border-t border-[var(--color-border)] pt-8">
                        <span>Oman • Ibri • Global Marble</span>
                        <span>www.grmc.com</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="max-w-4xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-4 px-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex-1 min-w-[200px] btn btn-primary py-5 shadow-2xl"
                >
                    <Printer size={24} />
                    طباعة أو حفظ PDF
                </button>

                <Link
                    href="/shop"
                    className="flex-1 min-w-[200px] btn btn-gold py-5"
                >
                    <ArrowRight size={24} className="rotate-180" />
                    العودة للمتجر
                </Link>
            </div>
        </div>
    );
}
