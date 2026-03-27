"use client";

import SundogLightHeader from "@/features/core/components/SundogLightHeader";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./AuthProvider";

function FullScreenLoader() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
            読み込み中...
        </div>
    );
}

export default function HostShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isReady, logout, session } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isLoginPage = pathname === "/login";
    const shouldRedirectToLogin = isReady && !isLoginPage && session == null;
    const shouldRedirectToEventList = isReady && isLoginPage && session != null;

    useEffect(() => {
        if (shouldRedirectToLogin) {
            const query = window.location.search;
            const callbackUrl = query ? `${pathname}${query}` : pathname;

            router.replace(
                `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
            return;
        }

        if (shouldRedirectToEventList) {
            router.replace("/event/list");
        }
    }, [
        pathname,
        router,
        shouldRedirectToEventList,
        shouldRedirectToLogin,
    ]);

    return (
        <div className="flex h-screen flex-col items-center">
            <header className="sticky top-0 w-full bg-white pb-4">
                <SundogLightHeader
                    isShowLogoutButton={session != null}
                    headerClickPath={session != null ? "/event/list" : "/"}
                    onClickLogoutButton={() => {
                        logout();
                        router.replace("/login");
                    }}
                />
            </header>
            <main className="w-full max-w-lg flex-grow">
                {!isReady || shouldRedirectToLogin || shouldRedirectToEventList
                    ? <FullScreenLoader />
                    : children}
            </main>
            <Toaster position="top-center" />
        </div>
    );
}
