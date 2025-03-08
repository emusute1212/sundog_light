"use client"
import EditColorList from "@/features/event/components/core/EditColorList";
import {useState} from "react";
import {ColorPickerDialog} from "@/features/event/components/core/ColorPickerDialog";
import EventEditSubmitButton from "@/features/event/components/edit/section/component/EventEditSubmitButton";
import {EventDetail} from "@/features/event/types/event-detail";
import {EventCreateRequest} from "@/features/event/types/event-create-request";
import {EventUpdateRequest} from "@/features/event/types/event-update-request";

export default function EventEditSection({userId, eventDetail = undefined}: {
    userId: string,
    eventDetail?: EventDetail,
}) {
    const [name, setName] = useState(eventDetail?.name ?? "");
    const [colors, setColors] = useState<string[]>(eventDetail?.colors ?? []);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isOpenColorPicker, setIsOpenColorPicker] = useState(false);
    const request: EventCreateRequest | EventUpdateRequest = (eventDetail === undefined) ? {
        type: "create-request",
        userId: userId,
        event: {
            name: name,
            colors: colors,
        },
    } : {
        type: "update-request",
        userId: userId,
        eventDetail: {
            uuid: eventDetail.uuid,
            name: name,
            colors: colors,
        }
    }
    return (
        <section className={`flex-1 flex flex-col px-8`}>
            <div className={`flex flex-col space-y-2 mb-8`}>
                <label>イベント名</label>
                <textarea
                    className={`border border-gray-400 rounded-md`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
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
            <EventEditSubmitButton
                request={request}/>
        </section>
    );
}
