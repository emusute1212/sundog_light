import EditColorList from "@/features/event/components/core/edit-color-list";
import {useState} from "react";
import {EventCreateRequest} from "@/features/event/types/event-create-request";
import {useRouter} from "next/navigation";
import {ColorPickerDialog} from "@/features/event/components/core/color-picker-dialog";

export default function EventCreateSection(props: { userId: string }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [colors, setColors] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isOpenColorPicker, setIsOpenColorPicker] = useState(false);
    const handleSubmit = async () => {
        const eventCreateRequest: EventCreateRequest = {
            userId: props.userId,
            event: {
                name: name,
                colors: colors,
            },
        }
        await fetch("/api/event/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventCreateRequest),
        });
        router.push("/event/list");
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className={`flex flex-col space-y-2`}>
                <label>イベント名</label>
                <input
                    className={`border border-black`}
                    type={`text`}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <span>色一覧</span>
                <EditColorList
                    colors={colors}
                    onSelectColorIndex={(targetIndex: number) => {
                        setSelectedIndex(targetIndex)
                        setIsOpenColorPicker(true)
                    }}
                    onAddColor={() => {
                        const addedColors = [...colors, `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`];
                        setColors(addedColors)
                        setSelectedIndex(addedColors.length - 1)
                        setIsOpenColorPicker(true)
                    }}/>
                <ColorPickerDialog
                    isOpen={isOpenColorPicker}
                    defaultColor={colors[selectedIndex]}
                    onSelectColor={(color: string) => {
                        setColors(
                            colors?.map((it, i) =>
                                i == selectedIndex ? color : it
                            ) ?? []
                        )
                    }}
                    onCloseRequest={() => setIsOpenColorPicker(false)}
                />
            </div>
            <button
                className={`mt-2 bg-black text-white px-4 py-2 rounded-lg`}
                type={`submit`}
            >イベントを保存する
            </button>
        </form>
    );
}
