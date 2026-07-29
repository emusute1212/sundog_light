"use client";

import { getClientMaintenanceStatus } from "@/lib/maintenance-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function isEventPath(pathname: string) {
    return pathname === "/event" || pathname.startsWith("/event/");
}

type NavigationCheck = {
    isChecked: boolean;
    pathname: string;
};

export default function EventMaintenanceGate({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const shouldCheck = isEventPath(pathname);
    const [navigationCheck, setNavigationCheck] = useState<NavigationCheck>({
        isChecked: true,
        pathname,
    });

    if (navigationCheck.pathname !== pathname) {
        setNavigationCheck({
            isChecked: !shouldCheck,
            pathname,
        });
    }

    useEffect(() => {
        if (
            !shouldCheck ||
            navigationCheck.pathname !== pathname ||
            navigationCheck.isChecked
        ) {
            return;
        }

        let isActive = true;

        void getClientMaintenanceStatus().then(
            ({ maintenanceStatus }) => {
                if (!isActive) {
                    return;
                }

                if (maintenanceStatus.enabled) {
                    router.replace("/maintenance");
                    return;
                }

                setNavigationCheck((current) =>
                    current.pathname === pathname
                        ? { ...current, isChecked: true }
                        : current
                );
            },
            () => {
                if (isActive) {
                    setNavigationCheck((current) =>
                        current.pathname === pathname
                            ? { ...current, isChecked: true }
                            : current
                    );
                }
            }
        );

        return () => {
            isActive = false;
        };
    }, [navigationCheck, pathname, router, shouldCheck]);

    if (
        shouldCheck &&
        (navigationCheck.pathname !== pathname || !navigationCheck.isChecked)
    ) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
                読み込み中...
            </div>
        );
    }

    return children;
}
