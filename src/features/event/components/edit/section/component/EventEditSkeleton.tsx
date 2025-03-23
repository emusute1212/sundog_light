import Skeleton from "../../../core/Skelton";

export default function EventEditSkeleton() {
    return (
        <div className="max-w-xl mx-auto p-6 animate-pulse space-y-6">
            {/* イベント名 */}
            <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12" />
            </div>

            {/* カラー */}
            <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="w-16 h-16 sm:w-20 sm:h-20"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
