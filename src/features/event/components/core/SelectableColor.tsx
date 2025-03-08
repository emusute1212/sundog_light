export default function SelectableColor({color, onClickColor}: {
    color: string,
    onClickColor: (color: string) => void,
}) {
    return (
        <div
            className={`p-2 rounded-lg shadow-md aspect-square w-24`}
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
