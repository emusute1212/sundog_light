"use client"
import {useEffect, useState} from "react";
import {EventDetail} from "@/features/event/types/event-detail";
import EventListSection from "@/features/event/components/list/section/event-list-section";

export default function EventListPage({userId}: { userId: string }) {
    const [eventList, setEventList] = useState<EventDetail[]>([])
    useEffect(() => {
        const callApi = async () => {
            const response = await fetch("/api/event/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({key: userId}),
            });
            setEventList(JSON.parse(await response.json()).result as EventDetail[])
        }
        callApi().then()
    }, [userId]);
    return (
        <EventListSection
            events={eventList}
        />
    );
}