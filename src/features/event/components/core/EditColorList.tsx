import AddColorButton from "@/features/event/components/core/AddColorButton";
import SelectableColor from "@/features/event/components/core/SelectableColor";

export default function EditColorList({colors, onSelectColorIndex, onAddColor}: {
    colors: string[] | undefined,
    onSelectColorIndex: (targetIndex: number) => void,
    onAddColor: () => void,
}) {
    return (
        <div className={`grid grid-cols-4 gap-4`}>
            {colors?.map((color: string, index: number) => {
                    return (
                        <SelectableColor
                            key={index}
                            color={color}
                            onClickColor={() => {
                                onSelectColorIndex(index)
                            }}
                        />
                    )
                }
            )}
            <AddColorButton
                onAddColorButton={onAddColor}
            />
        </div>
    );
}
