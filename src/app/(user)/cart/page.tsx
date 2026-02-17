'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import { Trash2, ShoppingCart, ArrowRight, CreditCard, Recycle, Minus, Plus, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageUrl } from '@/lib/utils/image-utils';

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
    const grandTotal = getTotal();

    const handleRemove = (id: number) => {
        if (confirm('هل تريد حذف هذا المنتج من السلة؟')) {
            removeItem(id);
            toast.info('تم حذف المنتج من السلة');
        }
    };

    const handleClearCart = () => {
        if (confirm('هل تريد حذف جميع المنتجات من السلة؟')) {
            clearCart();
            toast.info('تم حذف جميع المنتجات من السلة');
        }
    };

    return (
        <section className="py-8 md:py-12 min-h-screen bg-[var(--color-surface-alt)] pt-28">
            <div className="container max-w-5xl">

                <div className="section-header">
                    <h2 className="text-[var(--color-primary)]">سلة التسوق</h2>
                </div>

                {items.length > 0 ? (
                    <div className="flex flex-col gap-8">

                        {/* CART ITEMS */}
                        <div className="flex flex-col gap-4">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-4 md:p-6 flex flex-row items-start md:items-center gap-4 border border-[var(--color-border)] hover:shadow-md transition-shadow relative overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
                                            {item.image ? (
                                                <Image
                                                    src={getProductImageUrl(item.image)}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-lighter)]">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow flex flex-col md:flex-row justify-between gap-2 md:gap-4 w-full">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base md:text-lg font-bold text-[var(--color-text)] mb-1 truncate leading-tight">{item.name}</h3>

                                                {item.liters && item.liters > 0 && (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-sm font-bold mb-1">
                                                        <Recycle size={12} />
                                                        <span>{item.liters}L معاد تدويره</span>
                                                    </div>
                                                )}

                                                <div className="text-lg md:text-xl font-black text-[var(--color-primary)]">
                                                    {item.price.toFixed(3)} <span className="text-xs font-medium text-[var(--color-text-lighter)]">ر.ع</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-row-reverse md:flex-row items-center justify-between gap-3 mt-1 md:mt-0">
                                                {/* Subtotal (Desktop only usually, but let's keep it compact) */}
                                                <div className="hidden md:block text-sm font-bold text-[var(--color-text-light)]">
                                                    <span className="text-[var(--color-primary)] text-base">{(item.price * item.quantity).toFixed(3)} ر.ع</span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg overflow-hidden h-8 md:h-9 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 md:w-9 h-full flex items-center justify-center hover:bg-[var(--color-surface)] transition-colors cursor-pointer text-[var(--color-text)] hover:text-[var(--color-primary)] active:bg-slate-200 dark:active:bg-slate-700"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 md:w-10 h-full flex items-center justify-center border-x border-[var(--color-border)] font-bold text-xs md:text-sm text-[var(--color-text)] bg-white dark:bg-slate-800">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 md:w-9 h-full flex items-center justify-center hover:bg-[var(--color-surface)] transition-colors cursor-pointer text-[var(--color-text)] hover:text-[var(--color-primary)] active:bg-slate-200 dark:active:bg-slate-700"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer shadow-sm ml-auto md:ml-0"
                                                    title="حذف المنتج"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* CART SUMMARY */}
                        <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-8 border border-[var(--color-border)] text-center">
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-6">ملخص الطلب</h3>
                            <div className="text-lg text-[var(--color-text-light)] mb-8 border-b-2 border-dashed border-[var(--color-border)] pb-6">
                                المجموع الكلي: <span className="font-black text-[var(--color-primary)] text-3xl mr-2">{grandTotal.toFixed(3)} ر.ع</span>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <Link href="/shop" className="btn btn-gold">
                                    <ArrowRight size={18} />
                                    مواصلة التسوق
                                </Link>

                                <button onClick={handleClearCart} className="btn bg-[var(--color-surface)] border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <Trash2 size={18} />
                                    حذف الكل
                                </button>

                                <Link href="/checkout" className="btn btn-primary">
                                    <CreditCard size={18} />
                                    إتمام الشراء
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-16 text-center border border-[var(--color-border)]"
                    >
                        <ShoppingCart className="w-24 h-24 mx-auto text-[var(--color-text-lighter)] mb-6" />
                        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">سلة التسوق فارغة</h3>
                        <p className="text-[var(--color-text-light)] mb-8">يمكنك إضافة منتجات إلى السلة من خلال تصفح المتجر</p>
                        <Link href="/shop" className="btn btn-gold">
                            تصفح المتجر <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                )}

            </div>
        </section>
    );
}
