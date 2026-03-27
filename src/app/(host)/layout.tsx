import { AuthProvider } from "@/features/auth/components/AuthProvider";
import HostShell from "@/features/auth/components/HostShell";
import React from "react";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <HostShell>{children}</HostShell>
        </AuthProvider>
    );
}
