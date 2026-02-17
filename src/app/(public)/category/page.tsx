'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, Loader2, ArrowRight } from 'lucide-react';

import { Suspense } from 'react';

function CategoryContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            let query = supabase.from('products').select('*');

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            if (data) setProducts(data);
            if (error) console.error(error);
            setLoading(false);
        }

        fetchProducts();
    }, [category]);

    return (
        <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
                <Link href="/" className="hover:text-[var(--color-primary)]">الرئيسية</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-[var(--color-primary)]">المتجر</Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">{category || 'جميع الأقسام'}</span>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <LayoutGrid className="text-[var(--color-primary)]" />
                    {category ? `قسم: ${category}` : 'تصفح الأقسام'}
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-xl text-gray-400 font-bold mb-4">لا توجد منتجات في هذا القسم حالياً</p>
                    <Link href="/shop" className="btn btn-primary inline-flex items-center gap-2">
                        <ArrowRight size={18} />
                        العودة للمتجر
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoryPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Suspense fallback={
                <div className="flex justify-center py-40">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
                </div>
            }>
                <CategoryContent />
            </Suspense>
        </div>
    );
}
