import {EventDetail} from "@/features/event/types/event-detail";
import EventColorListComponent from "@/features/event/components/detail/section/component/event-color-list-component";
import {useRouter} from "next/navigation";

export default function EventDetailSection({event, onClickColor}: {
    event: EventDetail,
    onClickColor: (color: string) => void
}) {
    const router = useRouter();
    const onClickEditButton = () => {
        router.push(`/event/edit/${event.uuid}`)
    }
    return (
        <div className={`flex flex-col`}>
            <span>{event.name}</span>
            <EventColorListComponent
                colors={event.colors}
                onClickColor={onClickColor}/>
            <span>{window.location.origin}/client/{event.uuid}</span>
            <button
                className={`mt-2 bg-white text-black px-4 py-2 rounded-lg border border-black`}
                onClick={onClickEditButton}
            >イベントを編集する
            </button>
        </div>
    );
}
