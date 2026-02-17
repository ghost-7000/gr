'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    liters?: number;
}

interface CartStore {
    items: CartProduct[];
    addItem: (product: CartProduct) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const items = get().items;
                const existing = items.find((item) => item.id === product.id);
                if (existing) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + product.quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, product] });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            getCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'grmc-cart',
        }
    )
);
