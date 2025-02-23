import {EventDetail} from "@/features/event/types/event-detail";
import {ChevronRight, Info} from "lucide-react";
import Link from "next/link";

export default function EventItemComponent(props: {event: EventDetail}) {
    return (
        <Link
            className={`flex justify-between items-center space-x-2 bg-cyan-400 p-4 rounded-md shadow-md mb-2`}
            href={{
                pathname: `/event/detail/${props.event.uuid}`,
            }}
        >
            <Info color="black" size={24}/>
            <span className={`w-full`}>{props.event.name}</span>
            <ChevronRight color="black" size={24}/>
        </Link>
    );
}
