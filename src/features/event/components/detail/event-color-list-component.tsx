import SelectableColor from "@/features/event/components/core/selectable-color";

export default function EventColorListComponent(props: {
    colors: string[],
    onClickColor: (color: string) => void,
}) {
    return (
        <div className={`grid grid-cols-4 gap-4`}>
            {props.colors.map((color: string, i: number) => {
                    return (
                        <SelectableColor
                            key={i}
                            color={color}
                            onClickColor={props.onClickColor}
                        />
                    )
                }
            )}
        </div>
    );
}
