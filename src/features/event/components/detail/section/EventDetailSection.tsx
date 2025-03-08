import {EventDetail} from "@/features/event/types/event-detail";
import EventColorListComponent from "@/features/event/components/detail/section/component/EventColorListComponent";
import {useRouter} from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function EventDetailSection({event, onClickColor}: {
    event: EventDetail,
    onClickColor: (color: string) => void
}) {
    const router = useRouter();
    const onClickEditButton = () => {
        router.push(`/event/edit/${event.uuid}`)
    }
    const clientUrl = `${window.location.origin}/client/${event.uuid}`
    return (
        <section className={`flex-1 flex flex-col px-8`}>
            <span className={`text-2xl font-bold w-full text-center mb-2`}>{event.name}</span>
            <EventColorListComponent
                colors={event.colors}
                onClickColor={onClickColor}/>
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
                >イベントを編集する</button>
            </div>
        </section>
    );
}
