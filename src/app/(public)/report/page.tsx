'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { MapPin, Camera, AlertTriangle, Send, CheckCircle2, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        description: '',
        latitude: null as number | null,
        longitude: null as number | null,
        is_urgent: false,
        priority: 'medium'
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
        }
    }, [user]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('المتصفح لا يدعم تحديد الموقع');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    location: `إحداثيات: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
                }));
                setGettingLocation(false);
                toast.success('تم تحديد الموقع بدقة ✅');
            },
            (error) => {
                console.error(error);
                setGettingLocation(false);
                toast.error('فشل تحديد الموقع. يرجى السماح للمتصفح بالوصول للموقع.');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('marble_reports')
                .insert([{
                    user_id: user?.id || null,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    description: formData.description,
                    is_urgent: formData.is_urgent,
                    priority: formData.priority,
                    status: 'pending'
                }]);

            if (error) throw error;

            setSuccess(true);
            toast.success('تم إرسال البلاغ بنجاح! شكراً لمساهمتك.');
        } catch (error: any) {
            console.error(error);
            toast.error('حدث خطأ أثناء إرسال البلاغ: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-32">
                <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4">تم استلام بلاغك</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        شكراً لك على مساعدتنا في الحفاظ على البيئة. سيقوم فريقنا بمراجعة البلاغ والتعامل مع المخلفات في أقرب وقت ممكن.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn btn-primary w-full py-4 text-lg font-bold"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 pt-32 mobile-pt-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-bold mb-4 border border-amber-100">
                        <AlertTriangle size={16} />
                        المسؤولية المجتمعية
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 mb-4">بلاغ عن مخلفات رخام</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        ساهم معنا في إعادة تدوير مخلفات الرخام. إذا رأيت مخلفات رخام مرمية في مكان غير مخصص، أخبرنا بمكانها وسنقوم بجمعها وتحويلها لتحف فنية.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                        {/* Info Sidebar */}
                        <div className="md:col-span-2 bg-slate-900 p-8 text-white">
                            <h3 className="text-xl font-bold mb-6">كيفية تقديم البلاغ</h3>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-400">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">حدد الموقع</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">استخدم خاصية الـ GPS لتحديد مكان المخلفات بدقة على الخريطة.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                                        <Camera size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">صوّر المخلفات</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">الصور تساعدنا في تقدير حجم ونوع المخلفات والأدوات المطلوبة للجمع.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-green-400">
                                        <Send size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">إرسال وتجهيز</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">سنرسل فريقاً متخصصاً لجمعها وبدء عملية تحويلها لمنتجات مفيدة.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-xs italic text-slate-300">"تحويل المخلفات إلى فن.. هدفنا بيئة مستدامة لسلطنة عمان"</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="md:col-span-3 p-8 lg:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-700">الاسم</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="اسمك الكامل"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
                                        <input
                                            type="tel" required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-right dir-ltr"
                                            placeholder="9xxx xxxx"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">الموقع الجغرافي</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text" required
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="وصف الموقع أو الإحداثيات..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={gettingLocation}
                                            className="px-4 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-bold whitespace-nowrap"
                                            title="استخدام موقعي الحالي"
                                        >
                                            {gettingLocation ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                                            <span className="hidden sm:inline">موقعي</span>
                                        </button>
                                    </div>
                                    {formData.latitude && (
                                        <p className="text-[10px] text-green-600 font-bold mt-1">
                                            ✓ تم تحديد الإحداثيات: {formData.latitude.toFixed(6)}, {formData.longitude?.toFixed(6)}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">وصف المخلفات وحجمها</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all min-h-[120px] resize-none"
                                        placeholder="كمية المخلفات التقريبية، نوع الرخام إن عُرف، وأي تفاصيل أخرى..."
                                    />
                                </div>

                                <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_urgent}
                                            onChange={e => setFormData({ ...formData, is_urgent: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm font-bold text-gray-700">البلاغ طارئ (يعيق الحركة)</span>
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">الأولوية:</span>
                                        <select
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-green-500"
                                        >
                                            <option value="low">منخفضة</option>
                                            <option value="medium">متوسطة</option>
                                            <option value="high">عالية</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-2xl font-black text-xl hover:shadow-xl hover:shadow-green-900/20 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            إرسال البلاغ الآن
                                            <Send size={24} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
