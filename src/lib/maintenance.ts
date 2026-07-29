const DEFAULT_MAINTENANCE_MESSAGE =
    "サービス更新作業のため、一時的に停止しています。完了までしばらくお待ちください。";
const DEFAULT_NOTICE_MESSAGE =
    "近日中にメンテナンスを予定しています。作業中はログイン後の操作と参加者画面への接続を一時停止します。";

export const DEFAULT_MAINTENANCE_RETRY_AFTER_SECONDS = 300;

export type MaintenanceStatus = {
    enabled: boolean;
    message: string;
    retryAfterSeconds: number;
};

export type MaintenanceNoticeStatus = {
    enabled: boolean;
    message: string;
};

export type MaintenanceStatusResponse = {
    maintenanceStatus: MaintenanceStatus;
    notice: MaintenanceNoticeStatus;
};

const DEFAULT_STATUS: MaintenanceStatusResponse = {
    maintenanceStatus: {
        enabled: false,
        message: DEFAULT_MAINTENANCE_MESSAGE,
        retryAfterSeconds: DEFAULT_MAINTENANCE_RETRY_AFTER_SECONDS,
    },
    notice: {
        enabled: false,
        message: DEFAULT_NOTICE_MESSAGE,
    },
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalizeMessage(value: unknown, fallback: string) {
    return typeof value === "string" && value.trim() !== ""
        ? value
        : fallback;
}

function normalizeStatus(payload: unknown): MaintenanceStatusResponse {
    if (!isRecord(payload)) {
        return DEFAULT_STATUS;
    }

    const maintenance = isRecord(payload.maintenanceStatus)
        ? payload.maintenanceStatus
        : {};
    const notice = isRecord(payload.notice) ? payload.notice : {};
    const maintenanceEnabled = maintenance.enabled === true;
    const retryAfterSeconds =
        typeof maintenance.retryAfterSeconds === "number" &&
        Number.isFinite(maintenance.retryAfterSeconds) &&
        maintenance.retryAfterSeconds >= 0
            ? Math.floor(maintenance.retryAfterSeconds)
            : DEFAULT_MAINTENANCE_RETRY_AFTER_SECONDS;

    return {
        maintenanceStatus: {
            enabled: maintenanceEnabled,
            message: normalizeMessage(
                maintenance.message,
                DEFAULT_MAINTENANCE_MESSAGE
            ),
            retryAfterSeconds,
        },
        notice: {
            enabled: !maintenanceEnabled && notice.enabled === true,
            message: normalizeMessage(notice.message, DEFAULT_NOTICE_MESSAGE),
        },
    };
}

function getMaintenanceStatusUrl() {
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
    const backendBaseUrl = (configuredBaseUrl || "http://localhost:8080").replace(
        /\/+$/,
        ""
    );

    return `${backendBaseUrl}/api/maintenance/status`;
}

export async function fetchMaintenanceStatus(
    url: string
): Promise<MaintenanceStatusResponse> {
    try {
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            throw new Error(
                `Maintenance status request failed with ${response.status}.`
            );
        }

        return normalizeStatus(await response.json());
    } catch (error) {
        console.error("Failed to fetch maintenance status:", error);
        return DEFAULT_STATUS;
    }
}

export function getMaintenanceStatus(): Promise<MaintenanceStatusResponse> {
    return fetchMaintenanceStatus(getMaintenanceStatusUrl());
}
