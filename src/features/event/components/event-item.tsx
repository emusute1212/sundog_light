import {EventDetail} from "@/features/event/types/event-detail";

export default function EventItem(props: {event: EventDetail}) {
    return (
        <div className={`flex items-center space-x-2`}>
            <i className={`fab fa-regular fa-circle-info text-3xl1`}/>
            <span className={`text-lg text-gray-700`}>{props.event.name}</span>
        </div>
    );
}
