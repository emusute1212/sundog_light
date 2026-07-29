"use client";

import MaintenanceNoticeBanner from "@/features/core/components/MaintenanceNoticeBanner";
import EventMaintenanceGate from "@/features/core/components/EventMaintenanceGate";
import SundogLightHeader from "@/features/core/components/SundogLightHeader";
import { consumePostLoginPath } from "@/features/auth/lib/post-login-redirect";
import type { AuthSession } from "@/features/auth/types/auth-session";
import { getDisplayErrorMessage } from "@/lib/api-client";
import type { MaintenanceNoticeStatus } from "@/lib/maintenance";
import { RefreshCw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "./AuthProvider";

type LogoutAttempt = {
    phase: "requesting" | "navigating";
    session: AuthSession;
};

function FullScreenLoader() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
            読み込み中...
        </div>
    );
}

function SessionError({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div
            className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-8 text-center"
            role="alert"
        >
            <p className="text-red-700">{message}</p>
            <button
                className="inline-flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
                onClick={onRetry}
                type="button"
            >
                <RefreshCw size={18} />
                再試行
            </button>
        </div>
    );
}

export default function HostShell({
    children,
    notice,
}: {
    children: React.ReactNode;
    notice: MaintenanceNoticeStatus;
}) {
    const {
        isReady,
        logout,
        retrySession,
        session,
        sessionError,
    } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [logoutAttempt, setLogoutAttempt] = useState<LogoutAttempt | null>(
        null
    );

    const isLoginPage = pathname === "/login";
    const isSameLogoutSession =
        logoutAttempt != null &&
        (session == null || session === logoutAttempt.session);
    const isLoggingOut =
        logoutAttempt?.phase === "requesting" ||
        (logoutAttempt?.phase === "navigating" &&
            isSameLogoutSession &&
            !isLoginPage);
    const shouldRedirectToLogin =
        isReady &&
        sessionError == null &&
        !isLoginPage &&
        session == null &&
        !isLoggingOut;
    const shouldRedirectToEventList =
        isReady &&
        sessionError == null &&
        isLoginPage &&
        session != null;
    const shouldRestorePostLoginPath =
        isReady &&
        sessionError == null &&
        pathname === "/event/list" &&
        session != null;

    useEffect(() => {
        if (shouldRedirectToLogin) {
            const callbackUrl = `${pathname}${window.location.search}${window.location.hash}`;

            router.replace(
                `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
            return;
        }

        if (shouldRedirectToEventList) {
            router.replace("/event/list");
            return;
        }

        if (shouldRestorePostLoginPath) {
            const postLoginPath = consumePostLoginPath();
            const currentPath = `${pathname}${window.location.search}${window.location.hash}`;

            if (postLoginPath !== currentPath) {
                router.replace(postLoginPath);
            }
        }
    }, [
        pathname,
        router,
        shouldRedirectToEventList,
        shouldRedirectToLogin,
        shouldRestorePostLoginPath,
    ]);

    useEffect(() => {
        if (!isLoginPage || logoutAttempt?.phase !== "navigating") {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setLogoutAttempt((current) =>
                current?.phase === "navigating" ? null : current
            );
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isLoginPage, logoutAttempt]);

    return (
        <div className="flex h-screen flex-col items-center">
            <header className="sticky top-0 w-full bg-white pb-4">
                <SundogLightHeader
                    isShowLogoutButton={session != null}
                    headerClickPath={session != null ? "/event/list" : "/"}
                    onClickLogoutButton={() => {
                        if (isLoggingOut || session == null) {
                            return;
                        }

                        setLogoutAttempt({
                            phase: "requesting",
                            session,
                        });

                        void logout().then(
                            () => {
                                setLogoutAttempt({
                                    phase: "navigating",
                                    session,
                                });
                                router.replace("/login");
                            },
                            (error) => {
                                setLogoutAttempt(null);
                                toast.error(getDisplayErrorMessage(error));
                            }
                        );
                    }}
                />
            </header>
            <MaintenanceNoticeBanner
                notice={notice}
                maxWidthClassName="max-w-lg"
            />
            <main className="w-full max-w-lg flex-grow">
                {!isReady ||
                isLoggingOut ||
                shouldRedirectToLogin ||
                shouldRedirectToEventList ? (
                    <FullScreenLoader />
                ) : sessionError ? (
                    <SessionError
                        message={sessionError}
                        onRetry={retrySession}
                    />
                ) : (
                    <EventMaintenanceGate>{children}</EventMaintenanceGate>
                )}
            </main>
            <Toaster position="top-center" />
        </div>
    );
}
