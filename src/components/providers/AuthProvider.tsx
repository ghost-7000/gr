'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const checkSession = useAuthStore((s) => s.checkSession);

    useEffect(() => {
        // Hydrate Zustand from persisted storage
        useAuthStore.persist.rehydrate();

        // Then verify with Supabase
        checkSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    await checkSession();
                } else if (event === 'SIGNED_OUT') {
                    useAuthStore.setState({ user: null, isLoggedIn: false });
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [checkSession]);

    return <>{children}</>;
}
