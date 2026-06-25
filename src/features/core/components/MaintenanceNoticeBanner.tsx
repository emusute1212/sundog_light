import {
    getMaintenanceNoticeMessage,
    isMaintenanceNoticeVisible,
} from "@/lib/maintenance";

export default function MaintenanceNoticeBanner({
    maxWidthClassName = "max-w-5xl",
}: {
    maxWidthClassName?: string;
}) {
    if (!isMaintenanceNoticeVisible()) {
        return null;
    }

    const message = getMaintenanceNoticeMessage();

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
                    {message}
                </span>
            </div>
        </aside>
    );
}
