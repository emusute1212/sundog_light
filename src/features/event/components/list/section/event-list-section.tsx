import {EventDetail} from "@/features/event/types/event-detail";
import EventItemComponent from "@/features/event/components/list/section/component/event-item-component";
import EventAddComponent from "@/features/event/components/list/section/component/event-add-component";

export default function EventListSection({events}: { events: EventDetail[] }) {
    return (
        <div className={`grid grid-rows-none`}>
            {events.map((event: EventDetail) => {
                    return (
                        <EventItemComponent
                            key={event.uuid}
                            event={event}
                        />
                    )
                }
            )}
            <EventAddComponent/>
        </div>
    );
}