import { getMaintenanceStatus } from "@/lib/maintenance";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { maintenanceStatus } = await getMaintenanceStatus();

    if (maintenanceStatus.enabled) {
        redirect("/maintenance");
    }

    return children;
}
