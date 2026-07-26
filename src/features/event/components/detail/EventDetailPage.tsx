"use client";
import { registerBeforeLogoutCleanup } from "@/features/auth/lib/logout-lifecycle";
import { fetchEventDetail } from "@/features/event/api/event-client";
import EventDetailSection from "@/features/event/components/detail/section/EventDetailSection";
import {
    connectColorSocket,
    ColorSocketConnection,
    hasColorSocketLibraries,
} from "@/features/event/lib/color-websocket";
import { useParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
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
    const [loadedSocketScriptCount, setLoadedSocketScriptCount] = useState(() =>
        hasColorSocketLibraries() ? 2 : 0
    );
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const socketConnectionRef = useRef<ColorSocketConnection | null>(null);
    const colorChangeTimeoutRef = useRef<number | null>(null);
    const isSocketReady = loadedSocketScriptCount >= 2;

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

    useEffect(() => {
        if (hasColorSocketLibraries()) {
            setLoadedSocketScriptCount(2);
        }
    }, []);

    useEffect(() => {
        if (!isSocketReady) {
            return;
        }

        const clearColorChangeTimeout = () => {
            if (colorChangeTimeoutRef.current != null) {
                window.clearTimeout(colorChangeTimeoutRef.current);
                colorChangeTimeoutRef.current = null;
            }
        };

        try {
            const connection = connectColorSocket({
                eventId: eventUuid,
                onConnected: () => {
                    setIsSocketConnected(true);
                },
                onColorChanged: (color) => {
                    clearColorChangeTimeout();
                    setSelectedColor(color);
                    setIsColorChanging(false);
                },
                onError: (message) => {
                    clearColorChangeTimeout();
                    setIsSocketConnected(false);
                    setIsColorChanging(false);
                    toast.error(message);
                },
            });

            socketConnectionRef.current = connection;

            const disconnectConnection = () => {
                clearColorChangeTimeout();
                connection.disconnect();

                if (socketConnectionRef.current === connection) {
                    socketConnectionRef.current = null;
                }
            };

            const unregisterBeforeLogout = registerBeforeLogoutCleanup(() => {
                setIsSocketConnected(false);
                setIsColorChanging(false);
                disconnectConnection();
            });

            return () => {
                unregisterBeforeLogout();
                disconnectConnection();
            };
        } catch {
            toast.error("色変更用 WebSocket の初期化に失敗しました。");
            return;
        }
    }, [eventUuid, isSocketReady]);

    const onClickColor = async (color: string) => {
        if (isColorChanging) return;
        if (!socketConnectionRef.current || !isSocketConnected) {
            toast.error("色変更用の接続を確立中です。");
            return;
        }

        setIsColorChanging(true);

        try {
            const eventSendableColor: EventSendableColor = {
                eventId: eventUuid,
                color,
            };

            socketConnectionRef.current.sendColor(eventSendableColor.color);

            colorChangeTimeoutRef.current = window.setTimeout(() => {
                setIsColorChanging(false);
                toast.error("色変更の応答がありません。");
            }, 5000);
        } catch {
            toast.error("色の変更に失敗しました。");
            setIsColorChanging(false);
        } finally {
            // WebSocket の応答を待つため、ここでは loading を解除しない
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
            <Script
                src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"
                strategy="afterInteractive"
                onLoad={() =>
                    setLoadedSocketScriptCount((current) =>
                        Math.min(current + 1, 2)
                    )
                }
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/stompjs@2/lib/stomp.min.js"
                strategy="afterInteractive"
                onLoad={() =>
                    setLoadedSocketScriptCount((current) =>
                        Math.min(current + 1, 2)
                    )
                }
            />
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
