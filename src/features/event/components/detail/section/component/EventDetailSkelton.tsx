import Skeleton from "../../../core/Skelton";

export default function EventDetailSkeleton() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start">
            {/* タイトル */}
            <Skeleton className="w-60 h-10 mb-4" />

            {/* カラーボタン群（2行 × 4列） */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 8 }).map((_, idx) => (
                    <Skeleton key={idx} className="w-16 h-16 sm:w-20 sm:h-20" />
                ))}
            </div>

            {/* リンク文字列 */}
            <Skeleton className="w-80 h-4 mb-6" />

            {/* QRコードの枠 */}
            <Skeleton className="w-32 h-32 mb-6" />
        </div>
    );
}
