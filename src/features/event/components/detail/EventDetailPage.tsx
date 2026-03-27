"use client";
import { fetchEventDetail, selectEventColor } from "@/features/event/api/event-client";
import EventDetailSection from "@/features/event/components/detail/section/EventDetailSection";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventDetail } from "@/features/event/types/event-detail";
import { EventSendableColor } from "@/features/event/types/event-sendable-color";
import { CoreError } from "../../types/core-error";
import EventDetailSkeleton from "./section/component/EventDetailSkelton";
import CoreErrorComponent from "../core/CoreErrorComponent";
import { LoadingDialog } from "../core/LoadingDialog";
import { toCoreError } from "../../lib/to-core-error";
import toast from "react-hot-toast";

export default function EventDetailPage() {
    const params = useParams();
    const eventUuid = params.eventUuid as string;
    const [eventDetail, setEventDetail] = useState<EventDetail>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<CoreError | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isColorChanging, setIsColorChanging] = useState(false);

    useEffect(() => {
        const callApi = async () => {
            try {
                const data = await fetchEventDetail(eventUuid);
                setError(null);
                setEventDetail(data);
                setSelectedColor(data.currentColor ?? null);
            } catch (error) {
                setError(toCoreError(error));
            } finally {
                setIsLoading(false);
            }
        };

        void callApi();
    }, [eventUuid]);

    const onClickColor = async (color: string) => {
        // 処理中は追加のクリックを防ぐ
        if (isColorChanging) return;

        setIsColorChanging(true);

        try {
            // トグル機能: 同じ色をクリックした場合はnullを送信
            const colorToSend = selectedColor === color ? null : color;

            const eventSendableColor: EventSendableColor = {
                uuid: eventUuid,
                color: colorToSend,
            };

            // 最小表示時間（300ms）を設定してチラつきを防ぐ
            const [response] = await Promise.all([
                selectEventColor(eventSendableColor),
                new Promise((resolve) => setTimeout(resolve, 300)),
            ]);

            setSelectedColor(response);
        } catch (error) {
            toast.error("色の変更に失敗しました。");
        } finally {
            setIsColorChanging(false);
        }
    };

    if (isLoading) {
        return <EventDetailSkeleton />;
    }

    if (error) {
        return <CoreErrorComponent coreError={error} />;
    }

    return (
        <>
            {isColorChanging && <LoadingDialog message="色を変更中..." />}
            <EventDetailSection
                event={eventDetail!}
                onClickColor={onClickColor}
                selectedColor={selectedColor}
                isColorChanging={isColorChanging}
            />
        </>
    );
}
