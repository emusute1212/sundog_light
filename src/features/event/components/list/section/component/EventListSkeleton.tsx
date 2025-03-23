import Skeleton from "../../../core/Skelton";

export default function EventListSkeleton() {
    return (
        <div
            className={`
                flex 
                justify-between 
                items-center 
                space-x-2 
                bg-white
                p-4 
                rounded-md 
                shadow-md 
                mb-4
            `}
        >
            {/* Info アイコンの位置 */}
            <Skeleton className="w-6 h-6" />
            {/* イベント名の位置 */}
            <Skeleton className="flex-1 h-6 mx-2" />
        </div>
    );
}
