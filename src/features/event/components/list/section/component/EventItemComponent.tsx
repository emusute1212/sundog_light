import {EventDetail} from "@/features/event/types/event-detail";
import {ChevronRight, Info} from "lucide-react";
import Link from "next/link";

export default function EventItemComponent({event}: { event: EventDetail }) {
    return (
        <Link
            className={`
                flex 
                justify-between 
                items-center 
                space-x-2 
                bg-cyan-200 
                p-4 
                rounded-md 
                shadow-md 
                mb-4
                hover:bg-cyan-300
                transition-colors
            `}
            href={{
                pathname: `/event/detail/${event.uuid}`,
            }}
        >
            <Info color="black" size={24}/>
            <span className={`w-full`}>{event.name}</span>
            <ChevronRight color="black" size={24}/>
        </Link>
    );
}
