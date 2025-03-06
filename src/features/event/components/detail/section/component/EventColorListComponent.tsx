import SelectableColor from "@/features/event/components/core/SelectableColor";

export default function EventColorListComponent({colors, onClickColor}: {
    colors: string[],
    onClickColor: (color: string) => void,
}) {
    return (
        <div className={`grid grid-cols-4 gap-4`}>
            {colors.map((color: string, i: number) => {
                    return (
                        <SelectableColor
                            key={i}
                            color={color}
                            onClickColor={onClickColor}
                        />
                    )
                }
            )}
        </div>
    );
}
