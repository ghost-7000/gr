'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { Search, RotateCcw, SlidersHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        sort: 'newest',
        minPrice: '',
        maxPrice: '',
        category: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (data) {
                setProducts(data);
                // Extract unique categories
                const cats = Array.from(new Set(data.map(p => p.category).filter(Boolean))) as string[];
                setCategories(cats);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error('خطأ في تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.details && p.details.toLowerCase().includes(q))
            );
        }

        // Filter by Price
        if (filters.minPrice) {
            result = result.filter(p => p.price >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter(p => p.price <= Number(filters.maxPrice));
        }

        // Filter by Category
        if (filters.category) {
            result = result.filter(p => p.category === filters.category);
        }

        // Sort
        if (filters.sort === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (filters.sort === 'newest') {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [products, searchQuery, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ sort: 'newest', minPrice: '', maxPrice: '', category: '' });
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-alt)] py-12 -mt-20 pt-32">
            <div className="container mx-auto px-4">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text)] mb-4">متجر منتجاتنا</h1>
                    <p className="text-[var(--color-text-light)] max-w-2xl mx-auto">
                        أصباغ ومنتجات عالية الجودة مصنوعة من مخلفات الرخام المعاد تدويرها — صديقة للبيئة وبأسعار تنافسية
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-lighter)]" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن المنتجات..."
                        className="w-full pr-12 pl-4 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] outline-none transition-all text-lg placeholder:text-[var(--color-text-lighter)]"
                    />
                </div>

                {/* Filter Toggle */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${showFilters ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-surface)] text-[var(--color-text-light)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                        {showFilters ? 'إخفاء الفلاتر' : 'تصفية وترتيب'}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] mb-8 animate-fade-in-down">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-light)] mb-2">ترتيب حسب</label>
                                <select
                                    name="sort"
                                    value={filters.sort}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[var(--color-primary)] outline-none"
                                >
                                    <option value="newest">الأحدث أولاً</option>
                                    <option value="price_asc">السعر: الأقل للأعلى</option>
                                    <option value="price_desc">السعر: الأعلى للأقل</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-light)] mb-2">القسم</label>
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[var(--color-primary)] outline-none"
                                >
                                    <option value="">جميع الأقسام</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-light)] mb-2">نطاق السعر</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="minPrice"
                                        placeholder="من"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[var(--color-primary)] outline-none text-sm"
                                    />
                                    <input
                                        type="number"
                                        name="maxPrice"
                                        placeholder="إلى"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[var(--color-primary)] outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <button onClick={resetFilters} className="w-full py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                                <RotateCcw size={18} />
                                إعادة ضبط
                            </button>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-[var(--color-text-light)] mb-6 font-medium">
                            تم العثور على <span className="font-bold text-[var(--color-text)]">{filteredProducts.length}</span> منتج
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-[var(--color-surface)] rounded-2xl border border-dashed border-[var(--color-border)]">
                                    <Search className="w-16 h-16 mx-auto text-[var(--color-text-lighter)] mb-4" />
                                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">لا توجد منتجات</h3>
                                    <p className="text-[var(--color-text-light)] mb-6">جرب تغيير خيارات البحث أو الفلترة</p>
                                    <button onClick={resetFilters} className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                                        عرض الكل
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
