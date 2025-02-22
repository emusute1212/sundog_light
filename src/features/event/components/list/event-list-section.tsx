import {EventDetail} from "@/features/event/types/event-detail";
import EventItemComponent from "@/features/event/components/list/event-item-component";
import EventAddComponent from "@/features/event/components/list/event-add-component";

export default function EventListSection(props: { events: EventDetail[] }) {
    return (
        <div className={`grid grid-rows-none`}>
            {props.events.map((event: EventDetail) => {
                    return (
                        <EventItemComponent
                            key={event.id}
                            event={event}
                        />
                    )
                }
            )}
            <EventAddComponent />
        </div>
    );
}