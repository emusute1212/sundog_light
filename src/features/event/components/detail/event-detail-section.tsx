import {EventDetail} from "@/features/event/types/event-detail";
import EventColorListComponent from "@/features/event/components/detail/event-color-list-component";

export default function EventDetailSection(props: {
    event: EventDetail,
    onClickColor: (color: string) => void
}) {
    return (
        <div>
            <span>{props.event.name}</span>
            <EventColorListComponent
              colors={props.event.colors}
              onClickColor={props.onClickColor}/>
            <span>{window.location.origin}/{props.event.uuid}</span>
        </div>
    );
}
