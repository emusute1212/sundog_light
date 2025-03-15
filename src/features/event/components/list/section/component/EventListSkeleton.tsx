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
                animate-pulse
            `}
        >
            {/* Info アイコンの位置 */}
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            {/* イベント名の位置 */}
            <div className="flex-1 h-6 bg-gray-200 rounded mx-2" />
        </div>
    );
}
