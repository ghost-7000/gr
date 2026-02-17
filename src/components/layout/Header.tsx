'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { ShoppingCart, Heart, User, Menu, X, Package, LogOut, ChevronDown, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const userMenuRef = useRef<HTMLDivElement>(null);

    const cartCount = useCartStore((s) => s.items.length);
    const wishlistCount = useWishlistStore((s) => s.items.length);
    const { user, isLoggedIn, logout } = useAuthStore();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const userLinks = [
        { href: '/', label: 'الرئيسية' },
        { href: '/about', label: 'عن الشركة' },
        { href: '/orders', label: 'الطلبات' },
        { href: '/shop', label: 'المتجر' },
        { href: '/contact', label: 'اتصل بنا' },
    ];

    const adminLinks = [
        { href: '/admin', label: 'لوحة التحكم' },
        { href: '/admin/orders', label: 'الطلبات' },
        { href: '/admin/products', label: 'المنتجات' },
        { href: '/admin/users', label: 'المستخدمين' },
        { href: '/admin/messages', label: 'الرسائل' },
        { href: '/admin/reports', label: 'البلاغات' },
        { href: '/', label: 'المتجر' },
    ];

    const links = (isLoggedIn && user?.role === 'admin') ? adminLinks : userLinks.filter(link => {
        if (link.href === '/orders') return isLoggedIn;
        return true;
    });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!mounted) return null;

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-2xl shadow-black/5 border-b border-[var(--color-border)]'
            : 'bg-[var(--color-surface)] border-b border-[var(--color-border)]'
            }`} style={{ height: '80px' }}>
            <div className="container mx-auto px-4 h-full flex items-center justify-between">

                {/* LOGO */}
                <Link href={user?.role === 'admin' ? '/admin' : '/'} className="relative flex-shrink-0 flex items-center justify-start h-full" style={{ width: '200px' }}>
                    <Image
                        src="/images/logo.png"
                        alt="GRMC Logo"
                        fill
                        className="object-contain object-right dark:brightness-125"
                        style={{ transform: 'scale(1.2)', transformOrigin: 'right center' }}
                        priority
                    />
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden lg:flex items-center gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`relative px-4 py-2 rounded-xl text-[14px] font-black tracking-tight transition-all duration-300 ${pathname === link.href
                                ? 'text-white bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] shadow-lg shadow-green-500/20'
                                : 'text-[var(--color-text)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-surface-alt)]'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* ICONS & ACTIONS */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2.5 text-[var(--color-text-light)] hover:text-amber-500 transition-all rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
                        title="تبديل الوضع"
                    >
                        <Sun size={20} className="hidden dark:block" />
                        <Moon size={20} className="block dark:hidden" />
                    </button>

                    {user?.role !== 'admin' && (
                        <>
                            <Link href="/wishlist" className="relative p-2.5 text-[var(--color-text-light)] hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10">
                                <Heart size={20} />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--color-surface)] font-black">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <Link href="/cart" className="relative p-2.5 text-[var(--color-text-light)] hover:text-[var(--color-primary-light)] transition-all rounded-xl hover:bg-[var(--color-primary)]/5">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[9px] w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--color-surface)] font-black">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}

                    {/* User Menu */}
                    <div className="relative hidden sm:block" ref={userMenuRef}>
                        {isLoggedIn && user ? (
                            <>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-primary-light)] transition-all"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-green-500/10">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown size={14} className={`text-[var(--color-text-light)] transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute left-0 top-full mt-3 w-72 bg-[var(--color-surface)] rounded-[2rem] shadow-2xl border border-[var(--color-border)] py-3 animate-fade-in-down z-50 overflow-hidden">
                                        <div className="px-6 py-4 bg-[var(--color-surface-alt)]/50 border-b border-[var(--color-border)] mb-2">
                                            <p className="font-black text-sm text-[var(--color-text)] truncate">{user.name}</p>
                                            <p className="text-xs text-[var(--color-text-light)] truncate font-medium">{user.email}</p>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] rounded-2xl transition-all font-bold"
                                            >
                                                <User size={18} className="text-[var(--color-primary-light)]" /> تحديث الملف الشخصي
                                            </Link>

                                            {user.role === 'admin' ? (
                                                <Link
                                                    href="/register"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] rounded-2xl transition-all font-bold"
                                                >
                                                    <Shield size={18} className="text-purple-500" /> تسجيل مشرف جديد
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/orders"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] rounded-2xl transition-all font-bold"
                                                >
                                                    <Package size={18} className="text-[var(--color-primary-light)]" /> طلباتي
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-[var(--color-border)] mt-2 pt-2 px-2">
                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    logout();
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/5 rounded-2xl w-full transition-all font-black"
                                            >
                                                <LogOut size={18} /> تسجيل الخروج
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl text-sm font-black hover:shadow-xl hover:shadow-green-500/20 transition-all">
                                <User size={18} />
                                دخول
                            </Link>
                        )}
                    </div>

                    <button
                        className="lg:hidden p-2.5 text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="fixed inset-0 top-[80px] bg-[var(--color-surface)] z-40 overflow-y-auto pb-10 flex flex-col animate-fade-in transition-colors duration-300">
                    <div className="p-6 space-y-3">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-4 p-5 rounded-2xl font-black text-lg transition-all border ${pathname === link.href
                                    ? 'bg-green-500/10 text-[var(--color-primary-light)] border-green-500/20 shadow-lg shadow-green-500/5'
                                    : 'text-[var(--color-text)] bg-[var(--color-surface-alt)] border-[var(--color-border)]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto p-6 space-y-4">
                        {isLoggedIn && user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-5 bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-[var(--color-text)] text-lg leading-tight">{user.name}</p>
                                        <p className="text-xs text-[var(--color-text-light)] font-medium mt-1">{user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center gap-3 p-5 font-black text-[var(--color-text)] bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-all">
                                        <User size={24} className="text-[var(--color-primary-light)]" />
                                        <span className="text-xs">الملف الشخصي</span>
                                    </Link>

                                    {user.role === 'admin' ? (
                                        <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center gap-3 p-5 font-black text-[var(--color-text)] bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] hover:border-purple-500 transition-all">
                                            <Shield size={24} className="text-purple-500" />
                                            <span className="text-xs">لوحة التحكم</span>
                                        </Link>
                                    ) : (
                                        <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center gap-3 p-5 font-black text-[var(--color-text)] bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-all">
                                            <Package size={24} className="text-[var(--color-primary-light)]" />
                                            <span className="text-xs">طلباتي</span>
                                        </Link>
                                    )}
                                </div>

                                <button
                                    onClick={() => { logout(); setIsMenuOpen(false); }}
                                    className="flex items-center justify-center gap-3 p-5 font-black text-red-500 bg-red-500/5 rounded-3xl border border-red-500/10 w-full active:scale-95 transition-all shadow-sm shadow-red-500/5"
                                >
                                    <LogOut size={20} /> تسجيل الخروج
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 p-6 font-black text-white bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-3xl shadow-xl shadow-green-500/20 active:scale-95 transition-all text-xl">
                                <User size={24} /> تسجيل الدخول
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
