'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase/client';
import { Quote, ArrowLeft, Recycle, Leaf, Factory, Users, ChevronDown } from 'lucide-react';
import { getRandomProducts } from '@/lib/products';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(3)
        .order('id', { ascending: false });

      if (data) setFeaturedProducts(data);
    }
    fetchFeatured();
  }, []);

  // Stats Animation Logic
  const [stats, setStats] = useState({ tons: 0, products: 0, jobs: 0, waste: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('stats-section');
      if (section && !hasAnimated) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          setHasAnimated(true);
          // Animate numbers
          const duration = 2000;
          const steps = 60;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setStats({
              tons: Math.floor(progress * 5000),
              products: Math.floor(progress * 50),
              jobs: Math.floor(progress * 120),
              waste: Math.floor(progress * 75)
            });
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  return (
    <div className="flex flex-col min-h-screen -mt-20">

      {/* ═══════════════════════════════════════════════
          1. HERO SECTION (Video BG + Overlay)
          ═══════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="/images/marble-video.mp4" type="video/mp4" />
          </video>
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B5E20]/30 to-transparent z-10"></div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 z-15 overflow-hidden pointer-events-none max-w-[100vw]">
          <div className="absolute top-20 right-10 w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#FFD700]/5 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#2E7D32]/10 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="container relative z-20 px-4 text-center text-white animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm mb-8">
            <Recycle size={16} className="text-[var(--color-gold)]" />
            <span>منتجات صديقة للبيئة من مخلفات الرخام</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            تحويل المخلفات
            <span className="block text-[var(--color-gold)] drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">إلى قيمة</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-white/90">
            نستخلص من مخلفات الرخام أصباغًا صديقة للبيئة، ونحوّل مشكلة بيئية إلى حل مبتكر يدعم الاستدامة ويخلق قيمة اقتصادية حقيقية.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/shop" className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-bold text-lg shadow-2xl shadow-green-900/30 hover:shadow-green-900/50 transition-all hover:-translate-y-1">
              اكتشف منتجاتنا
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link href="#mission" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1">
              تعرف على مهمتنا
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown size={28} className="text-white/60" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. MISSION SECTION
          ═══════════════════════════════════════════════ */}
      <section id="mission" className="py-20 md:py-28 bg-[var(--color-surface)] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] text-sm font-bold mb-6">
                <Leaf size={16} />
                الاستدامة والابتكار
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] mb-6 leading-tight">
                مهمتنا
                <span className="block text-[var(--color-gold)] text-2xl md:text-3xl font-bold mt-2">نحو بيئة أنظف لعمان</span>
              </h2>
              <p className="text-lg md:text-xl text-[var(--color-text)] mb-6 leading-relaxed">
                في عالم ينتج ملايين الأطنان من مخلفات الرخام سنوياً، نرى فرصة لخلق قيمة من هذه الثروة المهدورة.
              </p>
              <p className="text-lg md:text-xl text-[var(--color-text-light)] mb-8 leading-relaxed">
                نحن في GRMC نبتكر حلولاً مستدامة لتحويل هذه المخلفات إلى منتجات فاخرة تحافظ على البيئة وتضيف لمسة جمالية إلى حياتك.
              </p>
              <Link href="/about" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-bold shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all hover:-translate-y-1">
                تعرف أكثر علينا
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="w-full md:w-1/2 h-[400px] md:h-[500px]">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/10 transition-transform duration-500 hover:scale-[1.02] group">
                <Image src="/uploaded_img/mission-image.avif" alt="عملية إعادة تدوير الرخام" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                {/* Gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. PRODUCTS SECTION (LIMIT 3)
          ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[var(--color-surface-alt)] to-[var(--color-surface)] relative border-t border-[var(--color-border)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] text-sm font-bold mb-6">
              <Recycle size={16} />
              معاد تدويره بالكامل
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] mb-4">
              منتجاتنا المميزة
            </h2>
            <p className="text-[var(--color-text-light)] text-lg max-w-xl mx-auto">تصاميم فريدة تجمع بين الجمال والاستدامة</p>
            <div className="w-20 h-1 bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-dark)] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              // Skeleton Loading or Empty State
              <div className="col-span-full py-12 text-center text-[var(--color-text-lighter)]">
                جاري تحميل المنتجات...
              </div>
            )}
          </div>

          <div className="text-center mt-14">
            <Link href="/shop" className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-primary-light)] text-[var(--color-primary-light)] font-bold text-lg hover:bg-[var(--color-primary-light)] hover:text-white transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
              عرض جميع المنتجات
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. STATS SECTION (Video BG + Numbers)
          ═══════════════════════════════════════════════ */}
      <section id="stats-section" className="relative py-20 md:py-28 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="/images/sky.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/85 to-[var(--color-primary)]/80 z-10"></div>
        </div>

        <div className="container relative z-20 px-4">
          <div className="mb-14">
            <h2 className="text-4xl md:text-5xl font-black mb-4">أهدافنا المستقبلية</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">رؤيتنا لتحقيق الاستدامة في سلطنة عمان</p>
            <div className="w-20 h-1 bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-dark)] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Factory size={32} />, value: stats.tons, suffix: '', label: 'طن من مخلفات الرخام سنوياً نهدف لإعادة تدويرها' },
              { icon: <Recycle size={32} />, value: stats.products, suffix: '', label: 'منتج مبتكر نخطط لإنتاجه خلال 5 سنوات' },
              { icon: <Users size={32} />, value: stats.jobs, suffix: '', label: 'فرصة عمل نهدف لخلقها للشباب العماني' },
              { icon: <Leaf size={32} />, value: stats.waste, suffix: '%', label: 'نسبة تخفيض النفايات الصناعية المستهدفة' },
            ].map((stat, i) => (
              <div key={i} className="group p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/20 hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-gold)]/20 flex items-center justify-center text-[var(--color-gold)] mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xl shadow-[var(--color-gold)]/10">
                  {stat.icon}
                </div>
                <div className="text-5xl font-black text-[var(--color-gold)] mb-3 tabular-nums drop-shadow-lg">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-base text-white/80 leading-relaxed font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. WISDOM SECTION (Quotes)
          ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--color-surface)] relative overflow-hidden border-b border-[var(--color-border)]">
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-3xl opacity-50"></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] mb-4">حكم واقتباسات</h2>
            <p className="text-[var(--color-text-light)] text-lg">كلمات ملهمة عن البيئة والاستدامة</p>
            <div className="w-20 h-1 bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-dark)] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: '"الأرض ليست ملكاً لنا، نحن ننتمي إليها. كل ما نفعله بالشبكة التي ننسجها، إنما نفعله بأنفسنا."',
                author: 'مثل عماني',
              },
              {
                text: '"إن المحافظة على البيئة ليست خياراً، بل هي مسؤولية وطنية وأخلاقية تفرضها علينا مبادئنا الإسلامية وقيمنا العمانية الأصيلة."',
                author: 'من رؤية عمان 2040',
              },
              {
                text: '"الاستدامة ليست مجرد تقليل الأضرار، بل هي خلق قيمة جديدة من الموارد الموجودة."',
                author: 'حكمة بيئية',
              },
            ].map((quote, idx) => (
              <div
                key={idx}
                className="group relative bg-[var(--color-surface)] p-8 rounded-3xl shadow-sm border border-[var(--color-border)] hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Decorative border */}
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-gold)] rounded-l-full"></div>

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Quote className="text-white w-6 h-6 rotate-180" />
                </div>
                <p className="text-lg italic text-[var(--color-text)] leading-relaxed mb-6 font-medium">
                  {quote.text}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-[var(--color-gold)] rounded-full"></div>
                  <span className="font-bold text-[var(--color-primary-light)] text-sm">{quote.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. CTA SECTION (Call to Action)
          ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        </div>
        <div className="container mx-auto px-4 relative text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-6">ابدأ رحلتك مع GRMC</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
            اكتشف مجموعتنا من المنتجات المستدامة وكن جزءاً من الحل
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-gold)] text-[var(--color-primary)] font-bold text-lg hover:bg-[var(--color-gold-dark)] transition-all hover:-translate-y-1 shadow-2xl">
              تسوق الآن
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
