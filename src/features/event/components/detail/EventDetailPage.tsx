"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventDetail } from "@/features/event/types/event-detail";
import { EventSendableColor } from "@/features/event/types/event-sendable-color";
import EventDetailSection from "@/features/event/components/detail/section/EventDetailSection";
import { CoreError } from "../../types/core-error";
import EventDetailSkeleton from "./section/component/EventDetailSkelton";
import CoreErrorComponent from "../core/CoreErrorComponent";

export default function EventDetailPage() {
    const params = useParams();
    const eventUuid = params.eventUuid as string;
    const [eventDetail, setEventDetail] = useState<EventDetail>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<CoreError | null>(null);

    useEffect(() => {
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

    if (isLoading) {
        return <EventDetailSkeleton />;
    }

    if (error) {
        return <CoreErrorComponent coreError={error} />;
    }

    return (
        <EventDetailSection event={eventDetail!} onClickColor={onClickColor} />
    );
}
