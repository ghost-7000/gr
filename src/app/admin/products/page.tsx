'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    Loader2,
    X,
    Image as ImageIcon,
    Save,
    Upload,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/utils/image-utils';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null as number | null,
        code: '',
        name: '',
        details: '',
        liters: 0,
        price: 0,
        image: '',
        category: 'أصباغ داخلية',
        stock: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (data) setProducts(data);
        if (error) toast.error('خطأ في جلب المنتجات');
        setLoading(false);
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `product_images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Update form data with the storage path (getProductImageUrl will handle resolving it)
            setFormData({ ...formData, image: filePath });
            toast.success('تم رفع الصورة بنجاح');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error('فشل رفع الصورة: تأكد من وجود Bucket باسم products');
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { ...formData };
        delete (payload as any).id;

        let result;
        if (formData.id) {
            result = await supabase.from('products').update(payload).eq('id', formData.id).select();
        } else {
            result = await supabase.from('products').insert([payload]).select();
        }

        if (!result.error) {
            toast.success(formData.id ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
            setIsModalOpen(false);
            fetchProducts();
        } else {
            toast.error('حدث خطأ أثناء الحفظ: ' + result.error.message);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            setProducts(products.filter(p => p.id !== id));
            toast.success('تم الحذف');
        } else {
            toast.error('فشل الحذف');
        }
    }

    function openEdit(product: any) {
        setFormData({
            ...product,
            liters: product.liters || 0,
            price: product.price || 0,
            stock: product.stock || 0
        });
        setIsModalOpen(true);
    }

    function openAdd() {
        setFormData({
            id: null,
            code: '',
            name: '',
            details: '',
            liters: 0,
            price: 0,
            image: '',
            category: 'أصباغ داخلية',
            stock: 0
        });
        setIsModalOpen(true);
    }

    const filtered = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text)]">إدارة المنتجات</h1>
                    <p className="text-[var(--color-text-light)] mt-1">عرض وتعديل وإضافة منتجات المتجر</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={20} />
                    منتج جديد
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="ابحث باسم المنتج أو الكود..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-[var(--color-text)]"
                />
            </div>

            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin text-green-600 mx-auto" size={40} /></div>
            ) : (
                <div className="bg-[var(--color-surface)] rounded-[2rem] shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                        <table className="w-full text-right border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                                    <th className="p-6 font-black text-[var(--color-text)]">الصورة</th>
                                    <th className="p-6 font-black text-[var(--color-text-light)]">الكود</th>
                                    <th className="p-6 font-black text-[var(--color-text)]">الاسم</th>
                                    <th className="p-6 font-black text-[var(--color-text)]">السعر</th>
                                    <th className="p-6 font-black text-[var(--color-text-light)]">المخزون</th>
                                    <th className="p-6 font-black text-[var(--color-text)]">العمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]/50 transition-colors">
                                        <td className="p-6">
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                                                <Image
                                                    src={getProductImageUrl(product.image)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-bold text-[var(--color-text-lighter)]">{product.code}</td>
                                        <td className="p-6 font-bold text-[var(--color-text)]">
                                            <Link href={`/product/${product.id}`} className="hover:text-emerald-600 transition-colors">
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td className="p-6 font-bold text-green-600 dark:text-green-400">{product.price?.toFixed(3)} ر.ع</td>
                                        <td className="p-6 font-bold text-[var(--color-text-light)]">{product.stock}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(product)} className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--color-border)]">
                        <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[var(--color-text)]">{formData.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--color-surface-alt)] rounded-full transition-colors text-[var(--color-text)]"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-black text-[var(--color-text)] mb-2 block">صورة المنتج</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-alt)] flex items-center justify-center group">
                                            {formData.image ? (
                                                <Image src={getProductImageUrl(formData.image)} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <ImageIcon size={32} className="text-[var(--color-text-lighter)]" />
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 size={24} className="animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[var(--color-text-light)] mb-3 font-bold">يمكنك رفع صور JPG, PNG أو WebP (الحد الأقصى 5MB)</p>
                                            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-bold text-sm cursor-pointer hover:bg-[var(--color-border)] transition-all">
                                                <Upload size={18} />
                                                {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-[var(--color-text-light)]">كود المنتج</label>
                                    <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="form-input" placeholder="PNT-XXX" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-[var(--color-text)]">اسم المنتج</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-[var(--color-text)]">السعر (ر.ع)</label>
                                    <input required type="number" step="0.001" value={isNaN(formData.price) ? '' : formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="form-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-[var(--color-text)]">اللترات</label>
                                    <input required type="number" step="0.1" value={isNaN(formData.liters) ? '' : formData.liters} onChange={e => setFormData({ ...formData, liters: parseFloat(e.target.value) || 0 })} className="form-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-[var(--color-text)]">المخزون</label>
                                    <input required type="number" value={isNaN(formData.stock) ? '' : formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="form-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-[var(--color-text)]">الفئة</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="form-input">
                                        <option value="أصباغ داخلية">أصباغ داخلية</option>
                                        <option value="أصباغ خارجية">أصباغ خارجية</option>
                                        <option value="تحف رخامية">تحف رخامية</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-[var(--color-text)]">التفاصيل</label>
                                <textarea required rows={4} value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="form-input resize-none" />
                            </div>
                            <button type="submit" disabled={uploading} className="btn btn-primary w-full py-4 text-lg mt-4 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={20} /> {formData.id ? 'حفظ التغييرات' : 'إضافة المنتج'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: var(--color-surface-alt);
                    border: 1px solid var(--color-border);
                    color: var(--color-text);
                    border-radius: 1rem;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .form-input:focus {
                    background: var(--color-surface);
                    border-color: #2E7D32;
                    box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
                }
            `}</style>
        </div>
    );
}
