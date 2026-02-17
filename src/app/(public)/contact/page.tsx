'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Upload, Navigation, MessageSquare, AlertTriangle, Leaf, Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Dynamic import for the Map component
import dynamic from 'next/dynamic';
const ContactMap = dynamic(() => import('@/components/contact/ContactMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400">جاري تحميل الخريطة...</div>
});

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState('contact');
    const [reportImage, setReportImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    // Form States
    const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [reportForm, setReportForm] = useState({ name: '', email: '', phone: '', location: '', description: '', isUrgent: false });

    // Fix for Leaflet icons in Next.js
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((leaflet) => {
                // @ts-ignore
                delete leaflet.Icon.Default.prototype._getIconUrl;
                leaflet.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });
            });
        }
    }, []);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('المتصفح لا يدعم تحديد الموقع');
            return;
        }
        toast.info('جاري تحديد موقعك...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setCoords(newCoords);
                toast.success('تم تحديد الموقع بنجاح');
                // Use reverse geocoding to fill location description
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.lat}&lon=${newCoords.lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.display_name) {
                            setReportForm(prev => ({ ...prev, location: data.display_name }));
                        }
                    })
                    .catch(console.error);
            },
            (err) => {
                console.error(err);
                toast.error('فشل تحديد الموقع. يرجى تفعيل الـ GPS');
            }
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => setReportImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('messages').insert([{
            name: contactForm.name,
            email: contactForm.email,
            phone: contactForm.phone,
            message: contactForm.message
        }]);

        if (error) {
            console.error('Contact Error:', error);
            toast.error(`خطأ: ${error.message}`);
        } else {
            toast.success('تم إرسال رسالتك بنجاح');
            setContactForm({ name: '', email: '', phone: '', message: '' });
        }
        setLoading(false);
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coords) {
            toast.error('يرجى تحديد الموقع على الخريطة أولاً');
            return;
        }
        setLoading(true);
        try {
            let imageUrl = null;
            const fileInput = document.getElementById('report-image-input') as HTMLInputElement;
            const file = fileInput?.files?.[0];

            if (file) {
                // Sanitize filename: remove non-alphanumeric/non-ASCII chars
                const fileExt = file.name.split('.').pop();
                const safeName = Math.random().toString(36).substring(2, 8);
                const fileName = `reports/${Date.now()}_${safeName}.${fileExt}`;

                const { error: upErr } = await supabase.storage.from('images').upload(fileName, file);

                if (upErr) {
                    console.error('Storage Upload Error:', upErr);
                    throw new Error(`فشل رفع الصورة: ${upErr.message}. تأكد من إعداد Storage Bucket باسم 'images'`);
                }

                const { data } = supabase.storage.from('images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            const { error } = await supabase.from('marble_reports').insert([{
                name: reportForm.name,
                email: reportForm.email,
                phone: reportForm.phone,
                location: reportForm.location,
                description: reportForm.description,
                latitude: coords?.lat,
                longitude: coords?.lng,
                image_url: imageUrl,
                is_urgent: reportForm.isUrgent
            }]);

            if (error) throw error;
            toast.success('تم إرسال التقرير بنجاح! شكراً لمساهمتك في الحفاظ على بيئة عمان');
            setReportForm({ name: '', email: '', phone: '', location: '', description: '', isUrgent: false });
            setCoords(null);
            setReportImage(null);
        } catch (err: any) {
            console.error('Report Error:', err);
            toast.error(`خطأ في الإرسال: ${err.message || 'حدث خطأ غير معروف'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen -mt-20">
            {/* HERO */}
            {/* HERO */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center text-white px-4">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-emerald-900/50 to-slate-900 z-10"></div>
                </div>
                <div className="relative z-20 max-w-4xl px-4 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs md:text-sm mb-4 md:mb-6 font-bold tracking-wide">
                        <Leaf size={14} className="text-emerald-400" />
                        <span>معاً من أجل بيئة عمانية مستدامة</span>
                    </div>
                    <h1 className="text-4xl md:text-8xl font-black mb-4 md:mb-6 leading-tight">تواصل <span className="text-[var(--color-gold)]">معنا</span></h1>
                    <p className="text-base md:text-2xl opacity-90 font-medium max-w-xl mx-auto">نحن هنا لخدمتكم، نستقبل استفساراتكم وبلاغاتكم على مدار الساعة</p>
                </div>
            </section>

            <section className="py-12 md:py-24 bg-[var(--color-surface-alt)] relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gold-500/5 blur-[120px] rounded-full"></div>

                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    {/* TABS */}
                    <div className="flex flex-col sm:flex-row justify-center mb-8 md:mb-12 bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 max-w-md mx-auto gap-2 sm:gap-0">
                        <button onClick={() => setActiveTab('contact')} className={`flex-1 py-3 px-6 rounded-2xl font-black transition-all duration-500 text-sm md:text-base ${activeTab === 'contact' ? 'bg-[#2E7D32] text-white shadow-lg rotate-0' : 'text-slate-500 hover:text-[#2E7D32]'}`}>
                            استفسار عام
                        </button>
                        <button onClick={() => setActiveTab('report')} className={`flex-1 py-3 px-6 rounded-2xl font-black transition-all duration-500 text-sm md:text-base ${activeTab === 'report' ? 'bg-[#FFD700] text-slate-900 shadow-lg rotate-0' : 'text-slate-500 hover:text-amber-500'}`}>
                            بلاغ بيئي
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all">
                        {activeTab === 'contact' ? (
                            <form onSubmit={handleContactSubmit} className="space-y-8 text-right" dir="rtl">
                                <div className="text-center mb-12">
                                    <div className="w-20 h-20 mx-auto flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] mb-6">
                                        <MessageSquare size={40} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">أهلاً بك، كيف يمكننا مساعدتك؟</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 mr-2">الاسم الكامل</label>
                                        <input type="text" placeholder="مثال: أحمد المعمري" className="input-field" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 mr-2">البريد الإلكتروني</label>
                                        <input type="email" placeholder="email@example.com" className="input-field" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-500 mr-2">رقم الهاتف التواصل</label>
                                    <input type="tel" placeholder="+968 XXXXXXXX" className="input-field" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-500 mr-2">رسالتك</label>
                                    <textarea placeholder="اكتب استفسارك هنا بكل وضوح..." rows={6} className="input-field resize-none" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required />
                                </div>
                                <button disabled={loading} className="w-full py-5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-3xl text-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                                    <Send size={24} /> {loading ? 'جاري الإرسال...' : 'إرسال الرسالة الآن'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleReportSubmit} className="space-y-8 text-right" dir="rtl">
                                <div className="text-center mb-12">
                                    <div className="w-20 h-20 mx-auto flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] mb-6">
                                        <AlertTriangle size={40} className="text-amber-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">الإبلاغ عن مخلفات رخام</h2>
                                    <p className="text-slate-500 font-bold mt-2">يرجى تحديد الموقع بدقة لمساعدة فريقنا في الوصول</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <input type="text" placeholder="الاسم" className="input-field" value={reportForm.name} onChange={e => setReportForm({ ...reportForm, name: e.target.value })} required />
                                    <input type="email" placeholder="البريد" className="input-field" value={reportForm.email} onChange={e => setReportForm({ ...reportForm, email: e.target.value })} required />
                                </div>
                                <input type="tel" placeholder="رقم الهاتف" className="input-field" value={reportForm.phone} onChange={e => setReportForm({ ...reportForm, phone: e.target.value })} required />

                                {/* PROFESSIONAL MAP (Leaflet) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-lg font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                            <MapPin size={24} className="text-emerald-600" /> موقع المخلفات (اضغط لتحديد الموقع)
                                        </label>
                                        <button type="button" onClick={getCurrentLocation} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                                            <Navigation size={18} /> تحديد موقعي الحالي
                                        </button>
                                    </div>

                                    <div className="h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-2xl relative z-10">
                                        <ContactMap
                                            coords={coords}
                                            setCoords={setCoords}
                                            setAddress={(addr) => setReportForm(prev => ({ ...prev, location: addr }))}
                                        />
                                    </div>
                                    {coords && (
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                                                Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
                                            </span>
                                            <button type="button" onClick={() => setCoords(null)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                                        </div>
                                    )}
                                </div>

                                <input type="text" placeholder="وصف الموقع (اسم المنطقة، شارع، معلم قريب)" className="input-field" value={reportForm.location} onChange={e => setReportForm({ ...reportForm, location: e.target.value })} required />
                                <textarea placeholder="تفاصيل كمية المخلفات والحالة..." rows={4} className="input-field resize-none" value={reportForm.description} onChange={e => setReportForm({ ...reportForm, description: e.target.value })} required />

                                <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                                    <input type="checkbox" id="urgent-check" className="w-6 h-6 rounded-lg accent-red-600 cursor-pointer" checked={reportForm.isUrgent} onChange={e => setReportForm({ ...reportForm, isUrgent: e.target.checked })} />
                                    <label htmlFor="urgent-check" className="text-red-800 dark:text-red-400 font-black text-lg cursor-pointer">هل هذا البلاغ طارئ جداً ويحتاج لتدخل فوري؟</label>
                                </div>

                                <div className="relative group border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-emerald-500/50 cursor-pointer">
                                    <input id="report-image-input" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} />
                                    <div className="relative z-0">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={32} className="text-slate-400 group-hover:text-emerald-500" />
                                        </div>
                                        <p className="text-xl font-black text-slate-700 dark:text-slate-300">ارفق صورة للمخلفات</p>
                                        <p className="text-sm text-slate-400 font-bold mt-1">يساعدنا ذلك في تقدير حجم العمل المطلوب</p>
                                    </div>
                                    {reportImage && (
                                        <div className="mt-8 relative w-48 h-48 mx-auto rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-2xl animate-in zoom-in-50">
                                            <Image src={reportImage} alt="Preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>

                                <button disabled={loading || !coords} className="w-full py-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-[2rem] text-2xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send size={28} /> {loading ? 'جاري إرسال البلاغ...' : 'إرسال التقرير بنجاح! شكراً لمساهمتك'}
                                </button>
                                {!coords && <p className="text-center text-amber-600 text-sm font-bold">يرجى تحديد الموقع على الخريطة لتفعيل زر الإرسال</p>}
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* INFO CARDS */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { icon: <MapPin className="text-blue-500" />, title: 'موقعنا الرئيسي', desc: 'عمان، عبري - بجنب جامعة التقنية والعلوم التطبيقية' },
                            { icon: <Phone className="text-emerald-500" />, title: 'اتصل بنا مباشرة', desc: '+968 1234 5678\nمتاحون 24/7 للحالات الطارئة' },
                            { icon: <Mail className="text-amber-500" />, title: 'تراسل معنا', desc: 'info@grmc.com\nsupport@grmc.com' },
                        ].map((card, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
                                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-white dark:bg-slate-800 rounded-[2rem] mb-8 shadow-inner">
                                    {card.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">{card.title}</h3>
                                <p className="text-slate-500 font-bold leading-relaxed whitespace-pre-line">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
