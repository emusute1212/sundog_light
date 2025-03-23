"use client";
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
                const response = await fetch(`/api/event/${eventUuid}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    setError({
                        errorCode: response.status,
                        errorMessage: response.statusText,
                    });
                } else {
                    setError(null);
                    setEventDetail(
                        JSON.parse(await response.json()).result as EventDetail
                    );
                }
            } catch (error) {
                console.error("イベント一覧の取得に失敗しました:", error);
            } finally {
                setIsLoading(false);
            }
        };
        callApi();
    }, [eventUuid]);

    if (isLoading) {
        return <EventEditSkeleton />;
    }

    if (error) {
        return <CoreErrorComponent coreError={error} />;
    }
    return <EventEditSection eventDetail={eventDetail} />;
}
