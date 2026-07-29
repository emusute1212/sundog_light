"use client";
import { fetchEventDetail } from "@/features/event/api/event-client";
import { toCoreError } from "@/features/event/lib/to-core-error";
import { useEffect, useState } from "react";
import { EventDetail } from "@/features/event/types/event-detail";
import EventEditSection from "@/features/event/components/edit/section/EventEditSection";
import { useParams } from "next/navigation";
import { CoreError } from "../../types/core-error";
import CoreErrorComponent from "../core/CoreErrorComponent";
import EventEditSkeleton from "./section/component/EventEditSkeleton";

export default function EventEditPage() {
    const params = useParams();
    const eventUuid = params.eventUuid as string;
    const [eventDetail, setEventDetail] = useState<EventDetail>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<CoreError | null>(null);

    useEffect(() => {
        if (eventUuid === undefined) return;
        const callApi = async () => {
            try {
                setEventDetail(await fetchEventDetail(eventUuid));
                setError(null);
            } catch (error) {
                setError(toCoreError(error));
            } finally {
                setIsLoading(false);
            }
        };

        void callApi();
    }, [eventUuid]);

    if (isLoading) {
        return <EventEditSkeleton />;
    }

    if (error) {
        return <CoreErrorComponent coreError={error} />;
    }
    return <EventEditSection eventDetail={eventDetail} />;
}
