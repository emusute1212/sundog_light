import {EventDetail} from "@/features/event/types/event-detail";
import EventItem from "@/features/event/components/list/event-item";
import EventAdd from "@/features/event/components/list/event-add";

export default function EventList(props: { events: EventDetail[] }) {
    return (
        <div className={`grid grid-rows-none`}>
            {props.events.map((event: EventDetail) => {
                    return (
                        <EventItem
                            key={event.id}
                            event={event}
                        />
                    )
                }
            )}
            <EventAdd />
        </div>
    );
}