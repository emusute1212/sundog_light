const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export const MAINTENANCE_RETRY_AFTER_SECONDS = 300;

export function isMaintenanceModeEnabled(): boolean {
    return TRUE_VALUES.has(
        (process.env.MAINTENANCE_MODE ?? "").trim().toLowerCase()
    );
}

export function getMaintenanceMessage(): string {
    return (
        process.env.MAINTENANCE_MESSAGE ??
        "サービス更新作業のため、一時的に停止しています。完了までしばらくお待ちください。"
    );
}
