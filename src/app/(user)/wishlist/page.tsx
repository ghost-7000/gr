'use client';

import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore();
    const addToCart = useCartStore((s) => s.addItem);

    const handleMoveToCart = (item: typeof items[0]) => {
        addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 });
        removeItem(item.id);
        toast.success(`تم نقل "${item.name}" إلى السلة`);
    };

    return (
        <section className="py-8 md:py-12 min-h-screen bg-[var(--color-surface-alt)]">
            <div className="container">
                <div className="section-header">
                    <h2>قائمة المفضلة</h2>
                </div>

                {items.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="card group"
                                    >
                                        <div className="relative h-[200px] overflow-hidden">
                                            <Image
                                                src={item.image?.startsWith('/') ? `/uploaded_img${item.image}` : `/uploaded_img/${item.image}`}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <Link
                                                href={`/product/${item.id}`}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--color-primary-light)] hover:text-white"
                                            >
                                                <Eye size={14} />
                                            </Link>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-[var(--color-dark)] mb-1 line-clamp-1">{item.name}</h3>
                                            <div className="text-lg font-black text-[var(--color-primary-light)] mb-3">
                                                {item.price.toFixed(3)} ر.ع
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleMoveToCart(item)}
                                                    className="flex-1 py-2 rounded-xl bg-[var(--color-primary-light)] text-white text-sm font-bold flex items-center justify-center gap-1 hover:bg-[var(--color-primary-lighter)] transition-colors cursor-pointer"
                                                >
                                                    <ShoppingCart size={14} />
                                                    للسلة
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        removeItem(item.id);
                                                        toast.info('تم الحذف من المفضلة');
                                                    }}
                                                    className="py-2 px-3 rounded-xl bg-red-50 text-[var(--color-danger)] hover:bg-red-100 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="text-center mt-8">
                            <button
                                onClick={() => {
                                    if (confirm('حذف جميع المنتجات من المفضلة؟')) {
                                        clearWishlist();
                                        toast.info('تم حذف جميع المنتجات');
                                    }
                                }}
                                className="btn btn-danger"
                            >
                                <Trash2 size={16} />
                                حذف الكل
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-white rounded-2xl"
                    >
                        <Heart size={64} className="mx-auto text-[var(--color-border)] mb-4" />
                        <h3 className="text-xl font-bold mb-2">قائمة المفضلة فارغة</h3>
                        <p className="text-[var(--color-text-light)] mb-6">أضف منتجات تعجبك للرجوع إليها لاحقاً</p>
                        <Link href="/shop" className="btn btn-primary">تصفح المتجر</Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
