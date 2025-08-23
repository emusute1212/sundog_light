export default function SelectableColor({
    color,
    onClickColor,
    isSelected = false,
}: {
    color: string;
    onClickColor: (color: string) => void;
    isSelected?: boolean;
}) {
    return (
        <div
            className={`
                p-2 rounded-lg shadow-md aspect-square w-24 
                transition-all cursor-pointer group relative
                ${
                    isSelected
                        ? "ring-4 ring-blue-500 scale-110"
                        : "hover:scale-105"
                }
            `}
            onClick={() => {
                onClickColor(color);
            }}
        >
            <div
                className={`
                    rounded-lg w-full h-full transition-opacity
                    ${isSelected ? "" : "group-hover:opacity-80"}
                `}
                style={{ backgroundColor: `${color}` }}
            />
            {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-full p-1 shadow-lg">
                        <svg
                            className="w-6 h-6 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
