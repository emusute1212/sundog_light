"use client";
import EventDetailSection from "@/features/event/components/detail/event-detail-section";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {EventDetail} from "@/features/event/types/event-detail";

export default function EventDetailPage() {
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
                body: JSON.stringify({ key: "aiueo" }),
            });
            setEventDetail(JSON.parse(await response.json()).result as EventDetail)
        }
        callApi().then()
    }, [eventUuid]);
    const onClickColor = async (color: string) => {
        const body = { selectedColor: color };
        const data = await fetch("/api/color", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const json = await data.json();
        console.log("handle_test_click_response", json);
    };

    if (eventDetail === undefined) {
        return <div />
    }
    return (
        <EventDetailSection
            event={eventDetail}
            onClickColor={onClickColor}
        />
    );
}
