'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Briefcase, Code, PenTool, TrendingUp, Leaf, Recycle, Target, Eye } from 'lucide-react';

export default function AboutPage() {
    const teamMembers = [
        { name: 'أروى الفارسية', role: 'المديرة التنفيذية', desc: 'مسؤولة عن الإدارة الاستراتيجية للمشروع وتطوير رؤيته ورسالته', icon: <User size={36} /> },
        { name: 'رزان الكلبانية', role: 'مديرة المشاريع', desc: 'تشرف على تنفيذ المشاريع وضمان الجودة والالتزام بالجدول الزمني', icon: <Briefcase size={36} /> },
        { name: 'مصعب العطابي', role: 'مطور الويب والأنظمة', desc: 'مسؤول عن تطوير المنصات الرقمية وتكنولوجيا المعلومات في المشروع', icon: <Code size={36} /> },
        { name: 'فيصل المجرفي', role: 'مصمم جرافيك ومنتجات', desc: 'مسؤول عن التصميم البصري للمنتجات والهوية البصرية للمشروع', icon: <PenTool size={36} /> },
        { name: 'المهند الهنائي', role: 'مدير التسويق والمبيعات', desc: 'يشرف على استراتيجيات التسويق وبناء العلاقات مع العملاء', icon: <TrendingUp size={36} /> },
    ];

    return (
        <div className="flex flex-col min-h-screen -mt-20">

            {/* 1. HERO SECTION */}
            <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center text-white px-4">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/about-img.jpg"
                        alt="About GRMC"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#1B5E20]/50 to-[#0F172A]/80 z-10"></div>
                </div>

                <div className="relative z-20 max-w-4xl mx-auto animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm mb-6">
                        <Leaf size={16} className="text-[#FFD700]" />
                        <span>من نحن</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        إعادة ابتكار
                        <span className="block text-[#FFD700]">الرخام</span>
                    </h1>
                    <p className="text-xl md:text-2xl leading-relaxed text-white/90">
                        تحويل المخلفات إلى منتجات ذات قيمة من خلال حلول مستدامة ومبتكرة
                    </p>
                </div>
            </section>

            {/* 2. CONTENT SECTION: About GRMC */}
            <section className="py-20 md:py-28 bg-[var(--color-surface)] relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] relative inline-block pb-4">
                            عن شركة GRMC
                            <span className="absolute bottom-0 right-1/2 translate-x-1/2 w-20 h-1 rounded-full bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-dark)]"></span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/10 h-[400px] md:h-[500px] relative group">
                            <Image src="/images/about-img.jpg" alt="About Company" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        <div className="text-lg text-[var(--color-text)] leading-relaxed space-y-6">
                            <p className="font-medium text-xl">
                                نحن مجموعة من طلاب وطالبات جامعة التقنية والعلوم التطبيقية بعبري (UTAS) نعمل معاً لإيجاد حل لمشكلة بيئية تعاني منها بيئتنا العمانية.
                            </p>

                            <div className="bg-gradient-to-l from-[var(--color-primary)]/5 to-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-primary)]/10">
                                <h3 className="text-2xl font-black text-[var(--color-primary)] mb-4 flex items-center gap-2">
                                    <Recycle size={24} className="text-[var(--color-primary-lighter)]" />
                                    معنى اسم GRMC &quot;جرمك&quot;:
                                </h3>
                                <ul className="space-y-3 list-none">
                                    <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">G</span> <span><strong className="text-[var(--color-primary)]">Green:</strong> الاستدامة والاهتمام بالبيئة</span></li>
                                    <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">R</span> <span><strong className="text-[var(--color-primary)]">Recycled:</strong> إعادة تدوير الرخام</span></li>
                                    <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">M</span> <span><strong className="text-[var(--color-primary)]">Marble:</strong> المواد المستخدمة</span></li>
                                    <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">C</span> <span><strong className="text-[var(--color-primary)]">Creations:</strong> الإبداع والمنتجات النهائية</span></li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary-light)] mb-3">
                                        <Eye size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">رؤيتنا</h3>
                                    <p className="text-[var(--color-text-light)] text-base">نسعى لخلق حل لمشكلة مخلفات الرخام التي تعاني منها البيئة العمانية وتحويلها إلى منتجات ذات قيمة.</p>
                                </div>
                                <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)] mb-3">
                                        <Target size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">هدفنا</h3>
                                    <p className="text-[var(--color-text-light)] text-base">جعل المنتج ذو كفاءة عالية مختلف ومتميز عن باقي المنتجات المحلية ومتاح لكافة المستخدمين ومتوفر بكميات كبيرة في الأسواق.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TEAM SECTION */}
            <section className="py-20 md:py-28 bg-[var(--color-surface-alt)] relative overflow-hidden border-t border-[var(--color-border)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-3xl opacity-50"></div>

                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] text-sm font-bold mb-6">
                            <User size={16} />
                            فريقنا
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] mb-4">فريق العمل</h2>
                        <p className="text-[var(--color-text-light)] text-xl">الطاقات الشابة التي تقف وراء هذا الإنجاز</p>
                        <div className="w-20 h-1 bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-dark)] mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {teamMembers.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="bg-[var(--color-surface)] rounded-2xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-3 transition-all duration-500 border border-[var(--color-border)] group"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/20 group-hover:scale-110 group-hover:rounded-xl transition-all duration-500">
                                    {member.icon}
                                </div>
                                <h3 className="text-lg font-black text-[var(--color-text)] mb-1">{member.name}</h3>
                                <p className="text-[var(--color-gold)] font-bold mb-4 text-sm">{member.role}</p>
                                <p className="text-[var(--color-text-light)] text-sm leading-relaxed">{member.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
