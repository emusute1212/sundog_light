"use client";

import {useEffect, useState} from "react";
import {EventDetail} from "@/features/event/types/event-detail";
import EventList from "@/features/event/components/list/event-list";

export default function EventListPage() {
    const [eventList, setEventList] = useState<EventDetail[]>([])
    useEffect(() => {
        const callApi = async () => {
            const response = await fetch("/api/event/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "aiueo" }),
            });
            setEventList(JSON.parse(await response.json()).result as EventDetail[])
        }
        callApi().then()
    }, []);
    return (
        <EventList
            events={eventList}
        />
    );
}