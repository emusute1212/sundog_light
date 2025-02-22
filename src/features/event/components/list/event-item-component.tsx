import {EventDetail} from "@/features/event/types/event-detail";
import {ChevronRight, Info} from "lucide-react";

export default function EventItemComponent(props: {event: EventDetail}) {
    return (
        <div className={`flex justify-between items-center space-x-2 bg-cyan-400 p-4 rounded-xl shadow-md mb-2`}>
            <Info color="black" size={24}/>
            <span className={`w-full`}>{props.event.name}</span>
            <ChevronRight color="black" size={24}/>
        </div>
    );
}
