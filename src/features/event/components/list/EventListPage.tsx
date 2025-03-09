"use client"
import {useEffect, useState} from "react";
import {EventDetail} from "@/features/event/types/event-detail";
import EventListSection from "@/features/event/components/list/section/EventListSection";

export default function EventListPage() {
    const [eventList, setEventList] = useState<EventDetail[]>([])
    useEffect(() => {
        const callApi = async () => {
            const response = await fetch("/api/event/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setEventList(JSON.parse(await response.json()).result as EventDetail[])
        }
        callApi().then()
    }, []);
    return (
        <EventListSection
            events={eventList}
        />
    );
}