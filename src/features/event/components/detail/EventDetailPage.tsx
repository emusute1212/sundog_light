"use client";
import { registerBeforeLogoutCleanup } from "@/features/auth/lib/logout-lifecycle";
import { fetchEventDetail } from "@/features/event/api/event-client";
import EventDetailSection from "@/features/event/components/detail/section/EventDetailSection";
import {
    connectColorSocket,
    ColorSocketConnection,
} from "@/features/event/lib/color-websocket";
import {
    SOCKJS_SCRIPT_SRC,
    STOMP_SCRIPT_SRC,
    useColorSocketScripts,
} from "@/features/event/lib/use-color-socket-scripts";
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
import { RefreshCw } from "lucide-react";

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;

export default function EventDetailPage() {
    const params = useParams();
    const eventUuid = params.eventUuid as string;
    const [eventDetail, setEventDetail] = useState<EventDetail>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<CoreError | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isColorChanging, setIsColorChanging] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [socketRetryVersion, setSocketRetryVersion] = useState(0);
    const socketConnectionRef = useRef<ColorSocketConnection | null>(null);
    const colorChangeTimeoutRef = useRef<number | null>(null);
    const reconnectTimerRef = useRef<number | null>(null);
    const reconnectAttemptRef = useRef(0);
    const hasReceivedSocketColorRef = useRef(false);
    const {
        isReady: isSocketReady,
        onScriptError,
        onScriptReady,
        scriptError,
    } = useColorSocketScripts();

    useEffect(() => {
        let isActive = true;
        hasReceivedSocketColorRef.current = false;
        setIsLoading(true);

        const callApi = async () => {
            try {
                const data = await fetchEventDetail(eventUuid);

                if (!isActive) {
                    return;
                }

                setError(null);
                setEventDetail(data);

                if (!hasReceivedSocketColorRef.current) {
                    setSelectedColor(data.currentColor ?? null);
                }
            } catch (error) {
                if (isActive) {
                    setError(toCoreError(error));
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void callApi();

        return () => {
            isActive = false;
        };
    }, [eventUuid]);

    useEffect(() => {
        if (!isSocketReady) {
            return;
        }

        let isActive = true;
        let connectionGeneration = 0;

        const clearColorChangeTimeout = () => {
            if (colorChangeTimeoutRef.current != null) {
                window.clearTimeout(colorChangeTimeoutRef.current);
                colorChangeTimeoutRef.current = null;
            }
        };

        const clearReconnectTimer = () => {
            if (reconnectTimerRef.current != null) {
                window.clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };

        const disconnectCurrent = () => {
            connectionGeneration += 1;
            socketConnectionRef.current?.disconnect();
            socketConnectionRef.current = null;
        };

        const scheduleReconnect = (message: string) => {
            const attemptIndex = reconnectAttemptRef.current;

            if (attemptIndex >= MAX_RECONNECT_ATTEMPTS) {
                setSocketError(message);
                toast.error(message);
                return;
            }

            reconnectAttemptRef.current += 1;
            clearReconnectTimer();
            reconnectTimerRef.current = window.setTimeout(() => {
                reconnectTimerRef.current = null;
                openConnection();
            }, RECONNECT_BASE_DELAY_MS * Math.pow(2, attemptIndex));
        };

        const handleConnectionFailure = (
            message: string,
            generation: number
        ) => {
            if (!isActive || generation !== connectionGeneration) {
                return;
            }

            clearColorChangeTimeout();
            disconnectCurrent();
            setIsSocketConnected(false);
            setIsColorChanging(false);
            scheduleReconnect(message);
        };

        function openConnection() {
            if (!isActive) {
                return;
            }

            const generation = ++connectionGeneration;

            try {
                const connection = connectColorSocket({
                    eventId: eventUuid,
                    onConnected: () => {
                        if (
                            !isActive ||
                            generation !== connectionGeneration
                        ) {
                            return;
                        }

                        reconnectAttemptRef.current = 0;
                        setIsSocketConnected(true);
                        setSocketError(null);
                    },
                    onColorChanged: (color) => {
                        if (
                            !isActive ||
                            generation !== connectionGeneration
                        ) {
                            return;
                        }

                        hasReceivedSocketColorRef.current = true;
                        clearColorChangeTimeout();
                        setSelectedColor(color);
                        setIsColorChanging(false);
                    },
                    onError: (message) => {
                        handleConnectionFailure(message, generation);
                    },
                });

                if (!isActive || generation !== connectionGeneration) {
                    connection.disconnect();
                    return;
                }

                socketConnectionRef.current = connection;
            } catch {
                handleConnectionFailure(
                    "色変更用 WebSocket の初期化に失敗しました。",
                    generation
                );
            }
        }

        reconnectAttemptRef.current = 0;
        setIsSocketConnected(false);
        openConnection();

        const unregisterBeforeLogout = registerBeforeLogoutCleanup(() => {
            isActive = false;
            clearReconnectTimer();
            clearColorChangeTimeout();
            setIsSocketConnected(false);
            setIsColorChanging(false);
            disconnectCurrent();
        });

        return () => {
            isActive = false;
            unregisterBeforeLogout();
            clearReconnectTimer();
            clearColorChangeTimeout();
            disconnectCurrent();
        };
    }, [eventUuid, isSocketReady, socketRetryVersion]);

    const retrySocket = () => {
        reconnectAttemptRef.current = 0;
        setSocketError(null);
        setSocketRetryVersion((current) => current + 1);
    };

    const onClickColor = (color: string) => {
        if (isColorChanging) return;
        if (!socketConnectionRef.current || !isSocketConnected) {
            toast.error("色変更用の接続を確立中です。");
            return;
        }

        setIsColorChanging(true);

        try {
            const eventSendableColor: EventSendableColor = {
                color: selectedColor === color ? null : color,
            };

            socketConnectionRef.current.sendColor(eventSendableColor);

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

    return (
        <>
            <Script
                src={SOCKJS_SCRIPT_SRC}
                strategy="afterInteractive"
                onLoad={() => onScriptReady("sockjs")}
                onReady={() => onScriptReady("sockjs")}
                onError={onScriptError}
            />
            <Script
                src={STOMP_SCRIPT_SRC}
                strategy="afterInteractive"
                onLoad={() => onScriptReady("stomp")}
                onReady={() => onScriptReady("stomp")}
                onError={onScriptError}
            />
            {scriptError ? (
                <div
                    className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-8 text-center"
                    role="alert"
                >
                    <p className="text-red-700">{scriptError}</p>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
                        onClick={() => window.location.reload()}
                        type="button"
                    >
                        <RefreshCw size={18} />
                        再読み込み
                    </button>
                </div>
            ) : isLoading ? (
                <EventDetailSkeleton />
            ) : error ? (
                <CoreErrorComponent coreError={error} />
            ) : (
                <>
                    {isColorChanging && (
                        <LoadingDialog message="色を変更中..." />
                    )}
                    {socketError && (
                        <div
                            className="mx-8 mb-4 flex flex-col items-center gap-3 border-y border-red-200 bg-red-50 px-4 py-3 text-center"
                            role="alert"
                        >
                            <p className="text-sm text-red-700">
                                {socketError}
                            </p>
                            <button
                                className="inline-flex items-center gap-2 rounded-lg border border-black bg-white px-3 py-2 text-sm text-black transition-colors hover:bg-gray-100"
                                onClick={retrySocket}
                                type="button"
                            >
                                <RefreshCw size={16} />
                                再接続
                            </button>
                        </div>
                    )}
                    <EventDetailSection
                        event={eventDetail!}
                        onClickColor={onClickColor}
                        selectedColor={selectedColor}
                        isColorChanging={isColorChanging}
                    />
                </>
            )}
        </>
    );
}
