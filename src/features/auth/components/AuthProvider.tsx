"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    clearStoredAuthSession,
    getStoredAuthSession,
    setStoredAuthSession,
    subscribeToAuthSession,
} from "../lib/auth-storage";
import { AuthSession } from "../types/auth-session";

type AuthContextValue = {
    isReady: boolean;
    session: AuthSession | null;
    login: (session: AuthSession) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const syncSession = () => {
            setSession(getStoredAuthSession());
        };
        const initializeSession = window.setTimeout(() => {
            syncSession();
            setIsReady(true);
        }, 0);
        const unsubscribe = subscribeToAuthSession(syncSession);

        return () => {
            window.clearTimeout(initializeSession);
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isReady,
                session,
                login: (nextSession: AuthSession) => {
                    setStoredAuthSession(nextSession);
                    setSession(nextSession);
                },
                logout: () => {
                    clearStoredAuthSession();
                    setSession(null);
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}
