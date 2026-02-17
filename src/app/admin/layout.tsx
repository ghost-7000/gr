'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    MessageSquare,
    ShieldAlert,
    Users,
    Settings,
    ChevronLeft
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--color-surface-alt)] pt-20">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-10" dir="rtl">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold">جاري تحميل المحتوى...</p>
                    </div>
                }>
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </Suspense>
            </main>
        </div>
    );
}
