"use client"
import {useEffect, useState} from "react";
import {EventDetail} from "@/features/event/types/event-detail";
import EventEditSection from "@/features/event/components/edit/section/event-edit-section";
import {useParams} from "next/navigation";

export default function EventEditPage({userId}: { userId: string }) {
    const params = useParams()
    const eventUuid = params.eventUuid as string
    const [eventDetail, setEventDetail] = useState<EventDetail>()
    useEffect(() => {
        if (eventUuid === undefined) return
        const callApi = async () => {
            const response = await fetch(`/api/event/${eventUuid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({key: userId}),
            });
            setEventDetail(JSON.parse(await response.json()).result as EventDetail)
        }
        callApi().then()
    }, [userId, eventUuid]);

    if (eventDetail === undefined) {
        return (
            <div/>
        )
    }
    return (
        <EventEditSection
            userId={userId}
            eventDetail={eventDetail}
        />
    );
}
