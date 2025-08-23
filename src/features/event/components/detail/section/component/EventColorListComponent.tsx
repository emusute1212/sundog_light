import SelectableColor from "@/features/event/components/core/SelectableColor";

export default function EventColorListComponent({
    colors,
    onClickColor,
    selectedColor,
}: {
    colors: string[];
    onClickColor: (color: string) => void;
    selectedColor?: string | null;
}) {
    return (
        <div className={`flex flex-wrap gap-4 justify-center`}>
            {colors.map((color: string, i: number) => {
                return (
                    <SelectableColor
                        key={i}
                        color={color}
                        onClickColor={onClickColor}
                        isSelected={selectedColor === color}
                    />
                );
            })}
        </div>
    );
}
