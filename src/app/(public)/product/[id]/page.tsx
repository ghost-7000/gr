'use client';

import { use, useEffect } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { toast } from 'sonner';
import { ShoppingCart, Heart, Recycle, Minus, Plus, Loader2, AlertCircle } from 'lucide-react';
import { getProductImageUrl } from '@/lib/utils/image-utils';
import ProductCard from '@/components/products/ProductCard';
import { notFound } from 'next/navigation';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const addToCart = useCartStore((s) => s.addItem);
    const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore();

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            try {
                let query = supabase.from('products').select('*');

                // Check if id is a number
                const isNumeric = /^\d+$/.test(id);

                if (isNumeric) {
                    query = query.eq('id', parseInt(id));
                } else {
                    // Fallback to name search if id is not numeric (slug fallback)
                    const decodedName = decodeURIComponent(id);
                    query = query.eq('name', decodedName);
                }

                const { data, error } = await query.single();

                if (error || !data) {
                    setProduct(null);
                } else {
                    setProduct(data);

                    // Fetch related products (same category or just others)
                    const { data: related } = await supabase
                        .from('products')
                        .select('*')
                        .neq('id', data.id)
                        .limit(3);

                    setRelatedProducts(related || []);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-alt)] pt-20">
                <Loader2 size={48} className="animate-spin text-[var(--color-primary)] mb-4" />
                <p className="font-bold text-[var(--color-text-light)]">جاري تحميل تفاصيل المنتج...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-alt)] pt-20 px-4 text-center">
                <AlertCircle size={64} className="text-red-500 mb-6" />
                <h1 className="text-3xl font-black text-[var(--color-text)] mb-4">المنتج غير موجود</h1>
                <p className="text-[var(--color-text-light)] mb-8 font-bold">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
                <Link href="/shop" className="btn btn-primary px-8 py-3">العودة للمتجر</Link>
            </div>
        );
    }

    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty,
            liters: product.liters
        });
        toast.success(`تمت إضافة ${qty} من ${product.name} إلى السلة!`);
    };

    const handleToggleWishlist = () => {
        if (inWishlist) {
            removeFromWishlist(product.id);
            toast.info('تم إزالة المنتج من المفضلة');
        } else {
            addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image });
            toast.success('تمت إضافة المنتج إلى المفضلة!');
        }
    };

    return (
        <section className="py-8 md:py-16 min-h-screen bg-[var(--color-surface-alt)] pt-28 md:pt-36">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-light)] mb-8 font-bold">
                    <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">الرئيسية</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/shop" className="hover:text-[var(--color-primary)] transition-colors">المتجر</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-[var(--color-text)]">{product.name}</span>
                </div>

                {/* Product Detail Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-12 shadow-xl shadow-black/5 border border-[var(--color-border)] overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                        {/* Image Gallery Mockup */}
                        <div className="flex-1">
                            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-[var(--color-surface-alt)] border border-[var(--color-border)] group">
                                <Image
                                    src={getProductImageUrl(product.image)}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                                {product.liters > 0 && (
                                    <div className="absolute bottom-6 right-6 bg-emerald-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg">
                                        <Recycle size={18} />
                                        {product.liters.toFixed(1)} لتر معاد تدويره
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col py-2">
                            <div className="mb-8">
                                <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-faded)] text-[var(--color-primary)] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                    {product.category || 'صناعة عمانية'}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-black text-[var(--color-text)] mb-4 leading-tight">{product.name}</h1>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[var(--color-primary)]">{Number(product.price).toFixed(3)}</span>
                                    <span className="text-lg font-bold text-[var(--color-text-light)]">ريال عماني</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-[var(--color-text-lighter)] uppercase tracking-widest px-1">تفاصيل المنتج</h3>
                                    <p className="text-[var(--color-text-light)] leading-relaxed text-lg font-medium bg-[var(--color-surface-alt)] p-6 rounded-3xl border border-[var(--color-border)]">
                                        {product.details || 'لا تتوفر تفاصيل إضافية لهذا المنتج حالياً.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-6 items-center">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-[var(--color-text-lighter)] uppercase px-1">كود المنتج</span>
                                        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[var(--color-text)]">{product.code || 'N/A'}</span>
                                    </div>
                                    {product.liters > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-[var(--color-text-lighter)] uppercase px-1">المساهمة البيئية</span>
                                            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                                <Recycle size={14} />
                                                تقليل الهدر
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="mt-auto space-y-6">
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-sm text-[var(--color-text)]">الكمية:</span>
                                        <div className="flex items-center bg-[var(--color-surface-alt)] rounded-2xl border border-[var(--color-border)] p-1">
                                            <button
                                                onClick={() => setQty(Math.max(1, qty - 1))}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-[var(--color-text)] cursor-pointer active:scale-90"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={99}
                                                value={qty}
                                                onChange={(e) => setQty(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                                                className="w-12 text-center bg-transparent border-none outline-none font-black text-lg text-[var(--color-text)]"
                                            />
                                            <button
                                                onClick={() => setQty(Math.min(99, qty + 1))}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-[var(--color-text)] cursor-pointer active:scale-90"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-[var(--color-text-lighter)]">
                                        الإجمالي: <span className="text-[var(--color-primary)] font-black">{(product.price * qty).toFixed(3)} ر.ع</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="btn btn-primary py-5 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 active:scale-[0.98]"
                                    >
                                        <ShoppingCart size={22} />
                                        أضف للسلة
                                    </button>
                                    <button
                                        onClick={handleToggleWishlist}
                                        className={`btn py-5 rounded-2xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] ${inWishlist
                                            ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                            : 'bg-white dark:bg-slate-800 border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
                                            }`}
                                    >
                                        <Heart size={22} fill={inWishlist ? 'currentColor' : 'none'} className={inWishlist ? 'animate-pulse' : ''} />
                                        {inWishlist ? 'في المفضلة' : 'حفظ للمفضلة'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black text-[var(--color-text)]">منتجات قد تعجبك</h2>
                            <Link href="/shop" className="text-[var(--color-primary)] font-black text-sm hover:underline">عرض المزيد</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} {...p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
