import {EventDetail} from "@/features/event/types/event-detail";
import EventItemComponent from "@/features/event/components/list/section/component/EventItemComponent";
import EventAddComponent from "@/features/event/components/list/section/component/EventAddComponent";

export default function EventListSection({events}: { events: EventDetail[] }) {
    return (
        <section className={`grid grid-rows-none px-8`}>
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
        </section>
    );
}