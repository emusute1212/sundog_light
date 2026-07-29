"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { fetchAuthSession, logoutSession } from "../api/auth-client";
import { runBeforeLogoutCleanups } from "../lib/logout-lifecycle";
import { AuthSession } from "../types/auth-session";

type AuthContextValue = {
    isReady: boolean;
    retrySession: () => void;
    session: AuthSession | null;
    sessionError: string | null;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_RESTORE_ERROR_MESSAGE =
    "ログイン状態を確認できませんでした。通信状況を確認して再試行してください。";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [restoreVersion, setRestoreVersion] = useState(0);
    const retrySession = useCallback(() => {
        setIsReady(false);
        setSessionError(null);
        setRestoreVersion((current) => current + 1);
    }, []);

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
                    setSessionError(null);
                }
            })
            .catch((error) => {
                console.error("Failed to restore auth session:", error);

                if (!isCancelled) {
                    setSessionError(SESSION_RESTORE_ERROR_MESSAGE);
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
    }, [restoreVersion]);

    return (
        <AuthContext.Provider
            value={{
                isReady,
                retrySession,
                session,
                sessionError,
                logout: async () => {
                    runBeforeLogoutCleanups();
                    await logoutSession();
                    setSession(null);
                    setSessionError(null);
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
