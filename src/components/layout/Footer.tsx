import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-[var(--color-surface-alt)] text-[var(--color-text-light)] pt-16 pb-8 border-t border-[var(--color-border)]">
            <div className="container mx-auto px-4">

                {/* Newsletter Bar */}
                <div className="bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-5 md:p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    <div className="text-center md:text-right">
                        <h3 className="text-xl md:text-2xl font-black text-white mb-2">اشترك في النشرة البريدية</h3>
                        <p className="text-green-100 text-sm">كن أول من يعرف عن منتجاتنا الجديدة والعروض الحصرية</p>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                        <input
                            type="email"
                            placeholder="بريدك الإلكتروني"
                            className="flex-1 md:w-72 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 outline-none focus:bg-white/25 focus:border-white/40 transition-all text-sm"
                        />
                        <button className="px-5 py-2.5 rounded-xl bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-slate-900 font-bold transition-colors whitespace-nowrap text-sm">
                            اشترك الآن
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Logo & Info */}
                    <div className="lg:col-span-1">
                        <div className="relative h-16 w-38 mb-4">
                            <Image src="/images/logo.png" alt="GRMC" fill className="object-contain object-right dark:brightness-0 dark:invert opacity-90" />
                        </div>
                        <p className="text-[var(--color-text-light)] text-sm leading-relaxed mb-6">
                            قصة نجاح عمانية في تحويل مخلفات الرخام إلى منتجات مستدامة ذات قيمة. شركة رائدة في مجال إعادة التدوير والحفاظ على البيئة.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-[var(--color-text)] relative pb-3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[var(--color-gold)]">روابط سريعة</h3>
                        <ul className="space-y-3 text-[var(--color-text-light)]">
                            <li><Link href="/" className="hover:text-[var(--color-primary-light)] transition-colors hover:pr-2 duration-300 block">الرئيسية</Link></li>
                            <li><Link href="/about" className="hover:text-[var(--color-primary-light)] transition-colors hover:pr-2 duration-300 block">من نحن</Link></li>
                            <li><Link href="/shop" className="hover:text-[var(--color-primary-light)] transition-colors hover:pr-2 duration-300 block">المتجر</Link></li>
                            <li><Link href="/contact" className="hover:text-[var(--color-primary-light)] transition-colors hover:pr-2 duration-300 block">تواصل معنا</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-[var(--color-text)] relative pb-3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[var(--color-gold)]">حسابي</h3>
                        <ul className="space-y-3 text-[var(--color-text-light)]">
                            <li><Link href="/login" className="hover:text-[var(--color-gold)] transition-colors hover:pr-2 duration-300 block">تسجيل الدخول</Link></li>
                            <li><Link href="/register" className="hover:text-[var(--color-gold)] transition-colors hover:pr-2 duration-300 block">إنشاء حساب</Link></li>
                            <li><Link href="/cart" className="hover:text-[var(--color-gold)] transition-colors hover:pr-2 duration-300 block">سلة التسوق</Link></li>
                            <li><Link href="/wishlist" className="hover:text-[var(--color-gold)] transition-colors hover:pr-2 duration-300 block">المفضلة</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-[var(--color-text)] relative pb-3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[var(--color-gold)]">تواصل معنا</h3>
                        <ul className="space-y-4 text-[var(--color-text-light)] text-sm">
                            <li className="flex items-start gap-3">
                                <span className="text-[var(--color-primary-light)] mt-0.5 text-lg">📍</span>
                                <span>جامعة التقنية والعلوم التطبيقية، عبري، سلطنة عمان</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-primary-light)] text-lg">📞</span>
                                <span dir="ltr">+968 1234 5678</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-primary-light)] text-lg">✉️</span>
                                <span>info@grmc.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">© {new Date().getFullYear()} GRMC. جميع الحقوق محفوظة.</p>

                    {/* Social Icons matching footer text style */}
                    <div className="flex items-center gap-4">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E1306C] transition-colors" title="Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </a>
                        <a href="https://wa.me/96812345678" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#25D366] transition-colors" title="WhatsApp">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
