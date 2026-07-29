import { fetchMaintenanceStatus } from "./maintenance";

const MAINTENANCE_STATUS_PATH = "/api/maintenance/status";

export function getClientMaintenanceStatus() {
    return fetchMaintenanceStatus(MAINTENANCE_STATUS_PATH);
}

export function redirectOnMaintenanceResponse(response: Response): boolean {
    const isMaintenanceResponse =
        response.status === 503 &&
        response.headers.get("X-Maintenance-Mode")?.toLowerCase() === "true";

    if (!isMaintenanceResponse || typeof window === "undefined") {
        return false;
    }

    window.location.replace("/maintenance");
    return true;
}
