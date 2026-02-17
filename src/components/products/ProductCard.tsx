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
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 className="group-hover:text-[var(--color-primary-light)] transition-colors" style={{
                    fontSize: '1.1rem', fontWeight: 800,
                    color: 'var(--color-text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                }}>
                    {name}
                </h3>

                {details && (
                    <p style={{
                        fontSize: '0.85rem', color: 'var(--color-text-light)',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                        lineHeight: 1.6,
                        minHeight: '3em',
                        marginBottom: '0.5rem'
                    }}>
                        {details}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
                    <div style={{
                        fontSize: '1.25rem', fontWeight: 900,
                        color: 'var(--color-primary-light)',
                    }}>
                        {price.toFixed(3)}
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, marginRight: 4 }}>ر.ع</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        style={{
                            display: 'flex', alignItems: 'center', justifySelf: 'flex-end', gap: 8,
                            padding: '0.75rem 1.25rem', borderRadius: 12,
                            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-lighter))',
                            color: 'white', fontWeight: 800, fontSize: '0.9rem',
                            border: 'none', cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(27, 94, 32, 0.15)',
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        <ShoppingCart size={16} />
                        أضف للسلة
                    </button>
                </div>
            </div>
        </Link>
    );
}
