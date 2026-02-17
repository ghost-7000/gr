'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistProduct {
    id: number;
    name: string;
    price: number;
    image: string;
}

interface WishlistStore {
    items: WishlistProduct[];
    addItem: (product: WishlistProduct) => void;
    removeItem: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    clearWishlist: () => void;
    getCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const exists = get().items.find((item) => item.id === product.id);
                if (!exists) {
                    set({ items: [...get().items, product] });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },

            isInWishlist: (id) => {
                return get().items.some((item) => item.id === id);
            },

            clearWishlist: () => set({ items: [] }),

            getCount: () => get().items.length,
        }),
        {
            name: 'grmc-wishlist',
        }
    )
);
