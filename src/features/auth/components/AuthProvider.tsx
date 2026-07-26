"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchAuthSession, logoutSession } from "../api/auth-client";
import { runBeforeLogoutCleanups } from "../lib/logout-lifecycle";
import { AuthSession } from "../types/auth-session";

type AuthContextValue = {
    isReady: boolean;
    session: AuthSession | null;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        // Remove JWT sessions left by deployments before cookie-based auth.
        try {
            window.localStorage.removeItem("sundog-light.auth-session");
        } catch {
            // Cookie-based session restoration must still continue.
        }

        void fetchAuthSession()
            .then((nextSession) => {
                if (!isCancelled) {
                    setSession(nextSession);
                }
            })
            .catch((error) => {
                console.error("Failed to restore auth session:", error);

                if (!isCancelled) {
                    setSession(null);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsReady(true);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isReady,
                session,
                logout: async () => {
                    runBeforeLogoutCleanups();
                    await logoutSession();
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
