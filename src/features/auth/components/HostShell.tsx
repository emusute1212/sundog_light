"use client";

import MaintenanceNoticeBanner from "@/features/core/components/MaintenanceNoticeBanner";
import SundogLightHeader from "@/features/core/components/SundogLightHeader";
import { consumePostLoginPath } from "@/features/auth/lib/post-login-redirect";
import type { AuthSession } from "@/features/auth/types/auth-session";
import { getDisplayErrorMessage } from "@/lib/api-client";
import type { MaintenanceNoticeStatus } from "@/lib/maintenance";
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

export default function HostShell({
    children,
    notice,
}: {
    children: React.ReactNode;
    notice: MaintenanceNoticeStatus;
}) {
    const { isReady, logout, session } = useAuth();
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
        isReady && !isLoginPage && session == null && !isLoggingOut;
    const shouldRedirectToEventList = isReady && isLoginPage && session != null;
    const shouldRestorePostLoginPath =
        isReady && pathname === "/event/list" && session != null;

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
                shouldRedirectToEventList
                    ? <FullScreenLoader />
                    : children}
            </main>
            <Toaster position="top-center" />
        </div>
    );
}
