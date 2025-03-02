export default function SelectableColor({color, onClickColor}: {
    color: string,
    onClickColor: (color: string) => void,
}) {
    return (
        <div
            className={`p-4 rounded-lg shadow-md aspect-square`}
            onClick={() => {
                onClickColor(color);
            }}
        >
            <div
                className={`rounded-lg w-full h-full`}
                style={{backgroundColor: `${color}`}}
            />
        </div>
    );
}
