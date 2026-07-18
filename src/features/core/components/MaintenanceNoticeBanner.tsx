import type { MaintenanceNoticeStatus } from "@/lib/maintenance";

export default function MaintenanceNoticeBanner({
    notice,
    maxWidthClassName = "max-w-5xl",
}: {
    notice: MaintenanceNoticeStatus;
    maxWidthClassName?: string;
}) {
    if (!notice.enabled) {
        return null;
    }

    return (
        <aside
            className="mb-6 w-full bg-sky-200 text-black"
            role="status"
            aria-live="polite"
        >
            <div
                className={`mx-auto flex w-full ${maxWidthClassName} flex-col gap-1 px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-3`}
            >
                <span className="text-xs font-bold">メンテナンス予定</span>
                <span className="text-sm leading-6 text-gray-700">
                    {notice.message}
                </span>
            </div>
        </aside>
    );
}
