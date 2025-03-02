"use client"
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {EventDetail} from "@/features/event/types/event-detail";
import {EventSendableColor} from "@/features/event/types/event-sendable-color";
import EventDetailSection from "@/features/event/components/detail/section/event-detail-section";

export default function EventDetailPage({userId}: { userId: string }) {
    const params = useParams()
    const eventUuid = params.eventUuid as string;
    const [eventDetail, setEventDetail] = useState<EventDetail>()
    useEffect(() => {
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
    const onClickColor = async (color: string) => {
        const eventSendableColor: EventSendableColor = {
            uuid: eventUuid,
            color: color,
        };
        await fetch("/api/color", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventSendableColor),
        });
    };

    if (eventDetail === undefined) {
        return (
            <div/>
        )
    }
    return (
        <EventDetailSection
            event={eventDetail}
            onClickColor={onClickColor}
        />
    );
}