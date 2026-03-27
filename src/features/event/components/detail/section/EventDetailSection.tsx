import { buildClientPageUrl } from "@/features/event/api/event-client";
import { EventDetail } from "@/features/event/types/event-detail";
import EventColorListComponent from "@/features/event/components/detail/section/component/EventColorListComponent";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function EventDetailSection({
    event,
    onClickColor,
    selectedColor,
    isColorChanging = false,
}: {
    event: EventDetail;
    onClickColor: (color: string) => void;
    selectedColor: string | null;
    isColorChanging?: boolean;
}) {
    const router = useRouter();
    const onClickEditButton = () => {
        router.push(`/event/edit/${event.uuid}`);
    };
    const clientUrl = buildClientPageUrl(event.uuid, event.clientPageUrl);
    return (
        <section className={`flex-1 flex flex-col px-8`}>
            <span className={`text-2xl font-bold w-full text-center mb-2`}>
                {event.name}
            </span>

            {/* 現在選択中の色を表示 */}
            <div className="text-center mb-4">
                {selectedColor ? (
                    <div className="inline-flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            現在選択中:
                        </span>
                        <div
                            className="w-6 h-6 rounded border-2 border-gray-400"
                            style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-sm text-gray-600">
                            ({selectedColor})
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500">
                        色が選択されていません
                    </span>
                )}
            </div>

            <EventColorListComponent
                colors={event.colors}
                onClickColor={onClickColor}
                selectedColor={selectedColor}
                isDisabled={isColorChanging}
            />
            <span className={`text-center mt-4`}>{clientUrl}</span>
            <div className="w-full flex justify-center">
                <QRCodeCanvas
                    value={clientUrl}
                    marginSize={2}
                    imageSettings={{
                        src: "/favicon.ico",
                        height: 24,
                        width: 24,
                        excavate: true,
                    }}
                />
            </div>
            <div className="w-full p-4 flex justify-center mt-8">
                <button
                    className={`bg-white text-black px-4 py-2 rounded-lg border border-black hover:bg-gray-100 transition-colors`}
                    onClick={onClickEditButton}
                >
                    イベントを編集する
                </button>
            </div>
        </section>
    );
}
