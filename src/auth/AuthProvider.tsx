import { AuthContext } from './UseAuthContext'
import { supabase } from '../services/supabase'
import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [hasLoadedSession, setHasLoadedSession] = useState<boolean>(false);
    const [hasReceivedAuthEvent, setHasReceivedAuthEvent] = useState<boolean>(false);
    const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        const fetchSession = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (!isMounted) return;

            if (error) {
                console.error('Error fetching session:', error);
            }

            setSession(session);
            setHasLoadedSession(true);
        }

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setSession(session);
            setHasReceivedAuthEvent(true);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        }
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            setIsProfileLoading(true);

            if (session) {
                const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('userId', session.user.id)
                .single();

                setProfile(data);
            } else {
                setProfile(null);
            }

            setIsProfileLoading(false);
        }

        fetchProfile();
    }, [session]);

    const isLoading = !hasLoadedSession || !hasReceivedAuthEvent || isProfileLoading;

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                profile,
                isLoggedIn: Boolean(session?.user?.id),
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}