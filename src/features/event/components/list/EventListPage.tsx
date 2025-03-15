"use client";
import { useEffect, useState } from "react";
import { EventDetail } from "@/features/event/types/event-detail";
import EventListSection from "@/features/event/components/list/section/EventListSection";

export default function EventListPage() {
    const [eventList, setEventList] = useState<EventDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const callApi = async () => {
            try {
                const response = await fetch("/api/event/list", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setEventList(
                    JSON.parse(await response.json()).result as EventDetail[]
                );
            } catch (error) {
                console.error("イベント一覧の取得に失敗しました:", error);
            } finally {
                setIsLoading(false);
            }
        };
        callApi();
    }, []);

    return <EventListSection isLoading={isLoading} events={eventList} />;
}
