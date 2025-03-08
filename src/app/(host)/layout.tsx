import {signOut} from "@/auth";
import SundogLightHeader from "@/features/core/components/SundogLightHeader";
import React from "react";

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`flex flex-col h-screen items-center`}>
            <header className={`w-full pb-4 sticky top-0 bg-white`}>
                <SundogLightHeader
                    onClickLogoutButton={async () => {
                        "use server"
                        await signOut()
                    }}
                />
            </header>
            <main className={`w-full flex-grow max-w-lg`}>
                {children}
            </main>
        </div>
    );
}
