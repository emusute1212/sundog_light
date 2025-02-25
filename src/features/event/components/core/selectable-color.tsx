export default function SelectableColor(props: {
    color: string,
    onClickColor: (color: string) => void,
}) {
    return (
        <div
            className={`p-4 rounded-lg shadow-md aspect-square`}
            onClick={() => {
                props.onClickColor(props.color);
            }}
        >
            <div
                className={`rounded-lg w-full h-full`}
                style={{backgroundColor: `${props.color}`}}
            />
        </div>
    );
}
