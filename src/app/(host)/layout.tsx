import {signOut} from "@/auth";
import React from "react";

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <header>
                <button onClick={async () => {
                    "use server"
                    await signOut()
                }}>サインアウト
                </button>
            </header>
            {children}
        </div>
    );
}
