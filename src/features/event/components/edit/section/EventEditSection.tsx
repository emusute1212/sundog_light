"use client";
import EditColorList from "@/features/event/components/core/EditColorList";
import { useState } from "react";
import { ColorPickerDialog } from "@/features/event/components/core/ColorPickerDialog";
import EventEditSubmitButton from "@/features/event/components/edit/section/component/EventEditSubmitButton";
import { EventDetail } from "@/features/event/types/event-detail";
import { EventCreateRequest } from "@/features/event/types/event-create-request";
import { EventUpdateRequest } from "@/features/event/types/event-update-request";

export default function EventEditSection({
    eventDetail = undefined,
}: {
    eventDetail?: EventDetail;
}) {
    const [name, setName] = useState(eventDetail?.name ?? "");
    const [colors, setColors] = useState<string[]>(eventDetail?.colors ?? []);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isOpenColorPicker, setIsOpenColorPicker] = useState(false);

    const isValid = name.trim() !== "" && colors.length > 0;

    const request: EventCreateRequest | EventUpdateRequest =
        eventDetail === undefined
            ? {
                  type: "create-request",
                  event: {
                      name: name,
                      colors: colors,
                  },
              }
            : {
                  type: "update-request",
                  eventDetail: {
                      uuid: eventDetail.uuid,
                      name: name,
                      colors: colors,
                  },
              };
    return (
        <section className={`flex-1 flex flex-col px-8`}>
            <div className={`flex flex-col space-y-2 mb-8`}>
                <label className="flex items-center">
                    イベント名
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    className={`border border-gray-400 rounded-md p-2`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="イベント名を入力してください"
                />
                {name.trim() === "" && (
                    <p className="text-red-500 text-sm">イベント名は必須です</p>
                )}
            </div>
            <div className="mb-8">
                <label className="flex items-center mb-2">
                    カラー
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <EditColorList
                    colors={colors}
                    onSelectColorIndex={(targetIndex: number) => {
                        setSelectedIndex(targetIndex);
                        setIsOpenColorPicker(true);
                    }}
                    onAddColor={() => {
                        const addedColors = [
                            ...colors,
                            `#${Math.floor(Math.random() * 16777215)
                                .toString(16)
                                .padStart(6, "0")}`,
                        ];
                        setColors(addedColors);
                        setSelectedIndex(addedColors.length - 1);
                        setIsOpenColorPicker(true);
                    }}
                />
                {colors.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">
                        少なくとも1つのカラーを追加してください
                    </p>
                )}
            </div>
            <ColorPickerDialog
                isOpen={isOpenColorPicker}
                defaultColor={colors[selectedIndex]}
                onSelectColor={(color: string) => {
                    setColors(
                        colors?.map((it, i) =>
                            i == selectedIndex ? color : it
                        ) ?? []
                    );
                }}
                onCloseRequest={() => setIsOpenColorPicker(false)}
            />
            <EventEditSubmitButton request={request} isValid={isValid} />
        </section>
    );
}
