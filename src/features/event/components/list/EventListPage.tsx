"use client";
import { fetchEventList } from "@/features/event/api/event-client";
import { EventSummary } from "@/features/event/types/event-summary";
import { useEffect, useState } from "react";
import EventListSection from "@/features/event/components/list/section/EventListSection";
import { CoreError } from "../../types/core-error";
import CoreErrorComponent from "../core/CoreErrorComponent";
import { toCoreError } from "../../lib/to-core-error";

export default function EventListPage() {
    const [eventList, setEventList] = useState<EventSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<CoreError | null>(null);

    useEffect(() => {
        const callApi = async () => {
            try {
                setEventList(await fetchEventList());
                setError(null);
            } catch (error) {
                setError(toCoreError(error));
            } finally {
                setIsLoading(false);
            }
        };

        void callApi();
    }, []);

    if (error) {
        return <CoreErrorComponent coreError={error} />;
    }

    return <EventListSection isLoading={isLoading} events={eventList} />;
}
