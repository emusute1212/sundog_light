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
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

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
                    const data = JSON.parse(await response.json())
                        .result as EventDetail;
                    setEventDetail(data);

                    // イベント詳細から最後に選択された色を取得
                    if (data.lastSelectedColor !== undefined) {
                        setSelectedColor(data.lastSelectedColor);
                    } else {
                        // または専用APIから取得
                        const colorResponse = await fetch(
                            `/api/event/${eventUuid}/color`
                        );
                        if (colorResponse.ok) {
                            const colorData = await colorResponse.json();
                            setSelectedColor(colorData.color);
                        }
                    }
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
        // トグル機能: 同じ色をクリックした場合はnullを送信
        const colorToSend = selectedColor === color ? null : color;

        const eventSendableColor: EventSendableColor = {
            uuid: eventUuid,
            color: colorToSend,
        };

        const response = await fetch("/api/color", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventSendableColor),
        });

        if (response.ok) {
            const data = await response.json();
            setSelectedColor(data.selectedColor);
        }
    };

    if (isLoading) {
        return <EventDetailSkeleton />;
    }

    if (error) {
        return <CoreErrorComponent coreError={error} />;
    }

    return (
        <EventDetailSection
            event={eventDetail!}
            onClickColor={onClickColor}
            selectedColor={selectedColor}
        />
    );
}
