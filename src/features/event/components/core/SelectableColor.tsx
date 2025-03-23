export default function SelectableColor({
    color,
    onClickColor,
}: {
    color: string;
    onClickColor: (color: string) => void;
}) {
    return (
        <div
            className={`p-2 rounded-lg shadow-md aspect-square w-24 group-hover:opacity-80 transition-opacity cursor-pointer group`}
            onClick={() => {
                onClickColor(color);
            }}
        >
            <div
                className={`rounded-lg w-full h-full group-hover:opacity-80 transition-opacity`}
                style={{ backgroundColor: `${color}` }}
            />
        </div>
    );
}
