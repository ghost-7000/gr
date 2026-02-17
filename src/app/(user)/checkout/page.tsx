'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, User, Phone, Mail, Package, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProductImageUrl } from '@/lib/utils/image-utils';

export default function CheckoutPage() {
    const { items, getTotal, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const total = getTotal();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [form, setForm] = useState({
        name: '',
        number: '',
        email: '',
        address: '',
        method: 'cash',
    });

    useEffect(() => {
        setMounted(true);
        if (user) {
            setForm(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    // Prevent hydration mismatch
    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('يجب عليك تسجيل الدخول لإتمام الشراء');
            router.push('/login');
            return;
        }

        if (!form.name || !form.number || !form.email || !form.address) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        setLoading(true);

        try {
            // 1. Prepare Order Data
            // We store the products array as a JSON string for easy retrieval later
            // This copies the snapshot of products at time of purchase
            const productDetails = JSON.stringify(items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })));

            // 2. Insert Order into Database
            // We include both 'total' and 'total_price' to be compatible with different schema versions
            const orderPayload: any = {
                user_id: user.id,
                full_name: form.name,
                phone: form.number,
                email: form.email,
                address: form.address,
                method: form.method,
                total_products: productDetails,
                status: 'pending'
            };

            // Add both possible field names for the total
            orderPayload.total = total;
            orderPayload.total_price = total;

            let { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([orderPayload])
                .select()
                .single();

            if (orderError) {
                console.error('Initial insert error:', orderError);
                // If it fails due to column mismatch, try once more with safer fields
                if (orderError.code === '42703') { // Column does not exist
                    delete orderPayload.total_price;
                    const { data: retryData, error: retryError } = await supabase
                        .from('orders')
                        .insert([orderPayload])
                        .select()
                        .single();

                    if (retryError) throw retryError;
                    orderData = retryData;
                } else {
                    throw orderError;
                }
            }

            // 3. Decrement Stock...
            try {
                await Promise.all(items.map(async (item) => {
                    const { error } = await supabase.rpc('decrement_stock', {
                        p_id: item.id,
                        q: item.quantity
                    });
                    if (error) console.warn(`Note: Stock update skipped: ${error.message}`);
                }));
            } catch (stockErr) {
                console.warn('Stock update failed non-critically:', stockErr);
            }

            // 4. Success! Clear cart and redirect to Invoice
            toast.success('تم تأكيد الطلب بنجاح! 🎉');
            clearCart();

            if (orderData) {
                router.push(`/invoice/${orderData.id}`);
            } else {
                router.push('/orders');
            }

        } catch (error: any) {
            console.error('Checkout Error:', error);
            toast.error('حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <section className="py-20 min-h-screen bg-[var(--color-surface-alt)] flex items-center justify-center pt-32">
                <div className="text-center py-16 bg-[var(--color-surface)] rounded-3xl px-10 shadow-xl border border-[var(--color-border)] max-w-md mx-auto">
                    <div className="w-24 h-24 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-border)]">
                        <Package size={48} className="text-[var(--color-text-lighter)]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">السلة فارغة</h3>
                    <p className="text-[var(--color-text-light)] mb-8">لم تقم بإضافة أي منتجات للسلة بعد.</p>
                    <Link href="/shop" className="btn btn-gold w-full py-4 text-lg">
                        تصفح المنتجات
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 md:py-16 min-h-screen bg-[var(--color-surface-alt)] pt-28 md:pt-36">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--color-text)] mb-2">إتمام الشراء</h1>
                        <p className="text-[var(--color-text-light)] font-bold">أكمل البيانات التالية لتأكيد طلبك</p>
                    </div>
                    <Link href="/cart" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline">
                        <ArrowRight size={16} />
                        العودة للسلة
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-[2] bg-[var(--color-surface)] rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-black/5 border border-[var(--color-border)] h-fit">
                        <div className="flex items-center gap-4 mb-10 border-b border-[var(--color-border)] pb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-faded)] text-[var(--color-primary)] flex items-center justify-center shadow-inner">
                                <User size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--color-text)]">معلومات التوصيل</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-[var(--color-text-light)] uppercase tracking-wider px-1">الاسم الكامل</label>
                                <div className="relative group">
                                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl focus:ring-4 focus:ring-[var(--color-primary-faded)] focus:border-[var(--color-primary)] outline-none transition-all font-bold text-[var(--color-text)]"
                                        placeholder="الاسم الثلاثي"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-[var(--color-text-light)] uppercase tracking-wider px-1">رقم الهاتف</label>
                                <div className="relative group">
                                    <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                                    <input
                                        type="tel"
                                        value={form.number}
                                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                                        className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl focus:ring-4 focus:ring-[var(--color-primary-faded)] focus:border-[var(--color-primary)] outline-none transition-all font-bold text-[var(--color-text)] text-right"
                                        placeholder="9xxx xxxx"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <label className="text-sm font-black text-[var(--color-text-light)] uppercase tracking-wider px-1">البريد الإلكتروني</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl focus:ring-4 focus:ring-[var(--color-primary-faded)] focus:border-[var(--color-primary)] outline-none transition-all font-bold text-[var(--color-text)] text-right"
                                    placeholder="example@gmail.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 mb-10">
                            <label className="text-sm font-black text-[var(--color-text-light)] uppercase tracking-wider px-1">العنوان بالتفصيل</label>
                            <div className="relative group">
                                <MapPin size={18} className="absolute right-4 top-5 text-[var(--color-text-lighter)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full pr-12 pl-4 py-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl focus:ring-4 focus:ring-[var(--color-primary-faded)] focus:border-[var(--color-primary)] outline-none transition-all min-h-[140px] resize-none font-bold text-[var(--color-text)] leading-relaxed"
                                    placeholder="المحافظة، الولاية، اسم المنطقة، رقم المنزل/الشارع..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8 border-b border-[var(--color-border)] pb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                                <CreditCard size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--color-text)]">طريقة الدفع</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                            {[
                                { value: 'cash', label: 'الدفع عند الاستلام', desc: 'ادفع نقداً عند استلام طلبك', icon: '💵' },
                                { value: 'bank', label: 'تحويل بنكي', desc: 'سيتم تزويدك برقم الحساب', icon: '🏦' },
                            ].map((m) => (
                                <label
                                    key={m.value}
                                    className={`relative flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${form.method === m.value
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-faded)]'
                                        : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-text-lighter)]'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="method"
                                        value={m.value}
                                        checked={form.method === m.value}
                                        onChange={() => setForm({ ...form, method: m.value })}
                                        className="mt-1 accent-[var(--color-primary)] w-5 h-5"
                                    />
                                    <div>
                                        <span className="text-3xl mb-2 block">{m.icon}</span>
                                        <span className="font-black text-[var(--color-text)] block mb-1">{m.label}</span>
                                        <span className="text-xs font-bold text-[var(--color-text-light)]">{m.desc}</span>
                                    </div>
                                    {form.method === m.value && (
                                        <div className="absolute top-5 left-5 text-[var(--color-primary)]">
                                            <CheckCircle2 size={24} fill="currentColor" className="text-white dark:text-[var(--color-surface)]" />
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 text-xl font-black text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    جاري المعالجة...
                                </>
                            ) : (
                                <>
                                    تأكيد الطلب والدفع ({total.toFixed(3)} ر.ع)
                                </>
                            )}
                        </button>
                    </form>

                    {/* Order Summary */}
                    <div className="flex-1 lg:max-w-md">
                        <div className="bg-[var(--color-surface)] rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-black/5 border border-[var(--color-border)] sticky top-32">
                            <h3 className="text-xl font-black mb-8 text-[var(--color-text)] flex items-center justify-between">
                                ملخص الطلب
                                <span className="text-xs font-black bg-[var(--color-surface-alt)] px-4 py-1.5 rounded-full text-[var(--color-primary)] border border-[var(--color-border)]">{items.length} منتجات</span>
                            </h3>

                            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-5 group/item">
                                        <div className="w-20 h-20 bg-[var(--color-surface-alt)] rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--color-border)] relative shadow-sm group-hover/item:border-[var(--color-primary-light)] transition-colors">
                                            {item.image ? (
                                                <img src={getProductImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-lighter)]">
                                                    <Package size={28} />
                                                </div>
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-lg backdrop-blur-md">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-[var(--color-text)] line-clamp-2 leading-tight group-hover/item:text-[var(--color-primary)] transition-colors">{item.name}</h4>
                                            <p className="text-xs font-bold text-[var(--color-text-lighter)] mt-1.5">{item.price.toFixed(3)} ر.ع / وحدة</p>
                                        </div>
                                        <div className="text-right font-black text-[var(--color-primary)] text-sm">
                                            {(item.price * item.quantity).toFixed(3)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t-2 border-dashed border-[var(--color-border)] pt-8">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-[var(--color-text-light)]">المجموع الفرعي</span>
                                    <span className="text-[var(--color-text)] font-black">{total.toFixed(3)} ر.ع</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-[var(--color-text-light)]">الضريبة (0%)</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">مجاناً</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-[var(--color-text-light)]">الشحن</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">محسوب لاحقاً</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t border-[var(--color-border)] mt-6">
                                    <span className="text-lg font-black text-[var(--color-text)]">الإجمالي الكلي</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-[var(--color-primary)]">{total.toFixed(3)}</span>
                                        <span className="text-sm font-black text-[var(--color-text-lighter)] mr-1.5 uppercase">ر.ع</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-4 text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed shadow-inner">
                                <div className="flex-shrink-0 text-lg mt-0.5">⚠️</div>
                                <p>عند تأكيد الطلب، سيتم خصم الكمية من المخزون وتجهيز الفاتورة فوراً للطباعة.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
