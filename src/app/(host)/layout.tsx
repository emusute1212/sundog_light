import { AuthProvider } from "@/features/auth/components/AuthProvider";
import HostShell from "@/features/auth/components/HostShell";
import { getMaintenanceStatus } from "@/lib/maintenance";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { maintenanceStatus, notice } = await getMaintenanceStatus();

    if (maintenanceStatus.enabled) {
        redirect("/maintenance");
    }

    return (
        <AuthProvider>
            <HostShell notice={notice}>{children}</HostShell>
        </AuthProvider>
    );
}
