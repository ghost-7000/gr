'use client';

import React from 'react';
import { Clock, Truck, CheckCircle2, Package, AlertTriangle } from 'lucide-react';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

interface StatusStepperProps {
    status: OrderStatus;
    className?: string;
}

const statusMap: Record<string, { label: string; icon: any; step: number; color: string }> = {
    pending: { label: 'بانتظار التأكيد', icon: Clock, step: 0, color: 'from-amber-400 to-amber-600' },
    processing: { label: 'جاري التجهيز', icon: Package, step: 1, color: 'from-blue-400 to-blue-600' },
    shipped: { label: 'تم الشحن', icon: Truck, step: 2, color: 'from-indigo-400 to-indigo-600' },
    delivered: { label: 'تم التوصيل', icon: CheckCircle2, step: 3, color: 'from-emerald-400 to-emerald-600' },
    completed: { label: 'مكتمل', icon: CheckCircle2, step: 3, color: 'from-green-400 to-green-600' },
    cancelled: { label: 'ملغي', icon: AlertTriangle, step: -1, color: 'from-red-400 to-red-600' },
};

const steps = [
    { id: 'pending', label: 'بانتظار التأكيد' },
    { id: 'processing', label: 'التجهيز' },
    { id: 'shipped', label: 'الشحن' },
    { id: 'delivered', label: 'التوصيل' }
];

export default function StatusStepper({ status, className = '' }: StatusStepperProps) {
    const currentStatus = statusMap[status] || statusMap.pending;
    const currentStep = currentStatus.step;
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
        return (
            <div className={`flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 ${className}`}>
                <AlertTriangle size={20} className="animate-pulse" />
                <span className="font-black text-sm">تم إلغاء هذا الطلب</span>
            </div>
        );
    }

    return (
        <div className={`w-full py-8 px-2 ${className}`}>
            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0" />

                {/* Active Progress Bar */}
                <div
                    className={`absolute top-1/2 left-0 h-1 bg-gradient-to-l ${currentStatus.color} -translate-y-1/2 rounded-full z-0 transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%` }}
                />

                {steps.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isCurrent = idx === currentStep;
                    const StepIcon = isCompleted ? CheckCircle2 : (isCurrent ? currentStatus.icon : Package);

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700
                                ${isCompleted ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white scale-110 shadow-lg shadow-emerald-500/20' :
                                    isCurrent ? `bg-white dark:bg-slate-900 border-4 border-current scale-125 shadow-xl ${currentStatus.color.replace('from-', 'text-').split(' ')[0]}` :
                                        'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-300'}
                            `}>
                                <StepIcon size={idx === currentStep ? 20 : 16} strokeWidth={2.5} />
                            </div>
                            <span className={`
                                absolute -bottom-8 whitespace-nowrap text-[10px] font-black tracking-tight transition-all duration-500
                                ${isCurrent ? 'text-[var(--color-text)] scale-110' : 'text-[var(--color-text-lighter)]'}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
