'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

interface AuthStore {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (name: string, email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

// Custom storage object to handle SSR safely
const customStorage: StateStorage = {
    getItem: (name: string) => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(name);
        }
        return null;
    },
    setItem: (name: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(name, value);
        }
    },
    removeItem: (name: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(name);
        }
    },
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,

            login: async (email, pass) => {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password: pass,
                });

                if (error) {
                    console.error('Login Error:', error);
                    toast.error(error.message);
                    return;
                }

                if (data.user) {
                    // Fetch profile to get accurate role
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    const user = {
                        id: data.user.id,
                        name: data.user.user_metadata.full_name || email.split('@')[0],
                        email: data.user.email || '',
                        role: profile?.role || data.user.user_metadata.role || 'user',
                    };
                    set({ user, isLoggedIn: true });
                    toast.success('تم تسجيل الدخول بنجاح! 👋');
                }
            },

            register: async (name, email, pass) => {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password: pass,
                    options: {
                        data: {
                            full_name: name,
                            role: 'user',
                        },
                    },
                });

                if (error) {
                    console.error('Register Error:', error);
                    toast.error(error.message);
                    return;
                }

                if (data.user) {
                    const user = {
                        id: data.user.id,
                        name: name,
                        email: email,
                        role: 'user',
                    };
                    if (data.session) {
                        set({ user, isLoggedIn: true });
                        toast.success('تم إنشاء الحساب بنجاح! 🎉');
                    } else {
                        toast.success('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتفعيله 📧');
                    }
                }
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, isLoggedIn: false });

                // Clear all local storage related to the user
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('grmc-auth');
                    localStorage.removeItem('grmc-cart'); // Clear cart
                    localStorage.removeItem('grmc-wishlist'); // Clear wishlist

                    // Force reload to clear any in-memory state in other stores
                    window.location.href = '/login';
                }
                toast.info('تم تسجيل الخروج');
            },

            checkSession: async () => {
                try {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) throw sessionError;

                    if (session?.user) {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .maybeSingle();

                        if (profileError && profileError.code !== 'PGRST116') {
                            console.warn('Profile fetch error:', profileError);
                        }

                        const user = {
                            id: session.user.id,
                            name: profile?.full_name || session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                            email: session.user.email || '',
                            role: profile?.role || session.user.user_metadata.role || 'user',
                        };

                        set({ user, isLoggedIn: true });
                    } else {
                        set({ user: null, isLoggedIn: false });
                    }
                } catch (error) {
                    console.error('Session Check Error:', error);
                    // Don't toast every time checkSession runs (e.g. on background tabs)
                    set({ user: null, isLoggedIn: false });
                }
            }
        }),
        {
            name: 'grmc-auth',
            storage: createJSONStorage(() => customStorage),
            skipHydration: true,
        }
    )
);
