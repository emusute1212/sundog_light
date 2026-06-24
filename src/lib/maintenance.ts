const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export const MAINTENANCE_RETRY_AFTER_SECONDS = 300;

export function isMaintenanceModeEnabled(): boolean {
    return TRUE_VALUES.has(
        (process.env.MAINTENANCE_MODE ?? "").trim().toLowerCase()
    );
}

export function isMaintenanceNoticeEnabled(): boolean {
    return TRUE_VALUES.has(
        (process.env.MAINTENANCE_NOTICE_MODE ?? "").trim().toLowerCase()
    );
}

export function isMaintenanceNoticeVisible(): boolean {
    return isMaintenanceNoticeEnabled() && !isMaintenanceModeEnabled();
}

export function getMaintenanceMessage(): string {
    return (
        process.env.MAINTENANCE_MESSAGE ??
        "サービス更新作業のため、一時的に停止しています。完了までしばらくお待ちください。"
    );
}

export function getMaintenanceNoticeMessage(): string {
    return (
        process.env.MAINTENANCE_NOTICE_MESSAGE ??
        "近日中にメンテナンスを予定しています。作業中はログイン後の操作と参加者画面への接続を一時停止します。"
    );
}
