import { AuthContext } from './UseAuthContext'
import { supabase } from '../services/supabase'
import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | undefined | null>();
    const [profile, setProfile] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSession = async () => {
            setIsLoading(true);

            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                console.error('Error fetching session:', error);
            }

            setSession(session);
            setIsLoading(false);
        }

        fetchSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        }
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);

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

            setIsLoading(false);
        }

        fetchProfile();
    }, [session]);

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                profile,
                isLoggedIn: session != undefined,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}