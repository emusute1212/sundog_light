import { auth, signOut } from "@/auth";
import MaintenanceNoticeBanner from "@/features/core/components/MaintenanceNoticeBanner";
import SundogLightHeader from "@/features/core/components/SundogLightHeader";
import React from "react";
import { Toaster } from "react-hot-toast";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <div className={`flex flex-col h-screen items-center`}>
            <header className={`w-full pb-4 sticky top-0 bg-white`}>
                <SundogLightHeader
                    isShowLogoutButton={session != null}
                    headerClickPath={session != null ? "/event/list" : "/"}
                    onClickLogoutButton={async () => {
                        "use server";
                        await signOut({
                            redirectTo: "/event/list",
                            redirect: true,
                        });
                    }}
                />
            </header>
            <MaintenanceNoticeBanner maxWidthClassName="max-w-lg" />
            <main className={`w-full flex-grow max-w-lg`}>{children}</main>
            <Toaster position="top-center" />
        </div>
    );
}
