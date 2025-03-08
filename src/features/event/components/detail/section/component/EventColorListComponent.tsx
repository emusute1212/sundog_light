import SelectableColor from "@/features/event/components/core/SelectableColor";

export default function EventColorListComponent({colors, onClickColor}: {
    colors: string[],
    onClickColor: (color: string) => void,
}) {
    return (
        <div className={`flex flex-wrap gap-4 justify-center`}>
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
