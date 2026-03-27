import { EventSummary } from "@/features/event/types/event-summary";
import EventItemComponent from "@/features/event/components/list/section/component/EventItemComponent";
import EventAddComponent from "@/features/event/components/list/section/component/EventAddComponent";
import EventListSkeleton from "./component/EventListSkeleton";

export default function EventListSection({
    isLoading,
    events,
}: {
    isLoading: boolean;
    events: EventSummary[];
}) {
    return (
        <section className={`grid grid-rows-none px-8`}>
            {isLoading ? (
                <>
                    {[...Array(3)].map((_, index) => (
                        <EventListSkeleton key={index} />
                    ))}
                </>
            ) : (
                <>
                    {events.map((event: EventSummary) => (
                        <EventItemComponent key={event.uuid} event={event} />
                    ))}
                    <EventAddComponent />
                </>
            )}
        </section>
    );
}
