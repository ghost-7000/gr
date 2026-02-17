'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart, Recycle } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { toast } from 'sonner';
import { getProductImageUrl } from '@/lib/utils/image-utils';

interface ProductCardProps {
    id: number;
    name: string;
    price: number;
    image: string;
    details?: string;
    liters?: number;
}

export default function ProductCard({ id, name, price, image, details, liters }: ProductCardProps) {
    const addToCart = useCartStore((s) => s.addItem);
    const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore();

    const inWishlist = isInWishlist(id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ id, name, price, image, quantity: 1, liters });
        toast.success('تمت إضافة المنتج إلى السلة!');
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(id);
            toast.info('تم إزالة المنتج من المفضلة');
        } else {
            addToWishlist({ id, name, price, image });
            toast.success('تمت إضافة المنتج إلى المفضلة!');
        }
    };

    return (
        <Link
            href={`/product/${id}`}
            className="card group"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textDecoration: 'none'
            }}
        >
            {/* Image Container */}
            <div className="relative aspect-square">
                <Image
                    src={getProductImageUrl(image)}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={id <= 4}
                />

                {/* ... existing overlays and buttons ... */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
                    pointerEvents: 'none',
                }} />

                <button
                    onClick={handleToggleWishlist}
                    aria-label="المفضلة"
                    style={{
                        position: 'absolute', top: 12, left: 12,
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: inWishlist ? '#EF4444' : 'var(--color-surface)',
                        color: inWishlist ? 'white' : 'var(--color-text-light)',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 10
                    }}
                >
                    <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {liters && liters > 0 && (
                    <div style={{
                        position: 'absolute', bottom: 12, right: 12,
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'rgba(22,163,74,0.9)', color: 'white',
                        padding: '4px 10px', borderRadius: 999,
                        fontSize: '0.7rem', fontWeight: 700,
                        backdropFilter: 'blur(4px)',
                        zIndex: 10
                    }}>
                        <Recycle size={12} />
                        {liters} لتر معاد تدويره
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 md:p-5 flex flex-col gap-2 flex-1">
                <h3 className="group-hover:text-[var(--color-primary-light)] transition-colors text-sm md:text-lg font-extrabold text-[var(--color-text)] truncate mb-0.5">
                    {name}
                </h3>

                {details && (
                    <p className="text-xs md:text-sm text-[var(--color-text-light)] line-clamp-2 md:line-clamp-3 leading-relaxed min-h-[2.5em] mb-2">
                        {details}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
                    <div className="text-base md:text-xl font-black text-[var(--color-primary-light)]">
                        {price.toFixed(3)}
                        <span className="text-[0.6rem] md:text-xs font-medium mr-1">ر.ع</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-lighter)] text-white font-bold text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 z-10"
                    >
                        <ShoppingCart size={14} className="md:w-4 md:h-4" />
                        <span className="hidden md:inline">أضف للسلة</span>
                        <span className="md:hidden">أضف</span>
                    </button>
                </div>
            </div>
        </Link>
    );
}
