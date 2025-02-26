import {EventDetail} from "@/features/event/types/event-detail";
import EventColorListComponent from "@/features/event/components/detail/event-color-list-component";
import {useRouter} from "next/navigation";

export default function EventDetailSection(props: {
    event: EventDetail,
    onClickColor: (color: string) => void
}) {
    const router = useRouter();
    const onClickEditButton = () => {
        router.push(`/event/edit/${props.event.uuid}`)
    }
    return (
        <div className={`flex flex-col`}>
            <span>{props.event.name}</span>
            <EventColorListComponent
                colors={props.event.colors}
                onClickColor={props.onClickColor}/>
            <span>{window.location.origin}/client/{props.event.uuid}</span>
            <button
                className={`mt-2 bg-white text-black px-4 py-2 rounded-lg border border-black`}
                onClick={onClickEditButton}
            >イベントを編集する
            </button>
        </div>
    );
}
