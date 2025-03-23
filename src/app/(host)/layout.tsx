import { auth, signOut } from "@/auth";
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
                    onClickLogoutButton={async () => {
                        "use server";
                        await signOut({
                            redirectTo: "/event/list",
                            redirect: true,
                        });
                    }}
                />
            </header>
            <main className={`w-full flex-grow max-w-lg`}>{children}</main>
            <Toaster position="top-center" />
        </div>
    );
}
