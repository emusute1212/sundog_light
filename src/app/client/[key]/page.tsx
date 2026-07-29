"use client";
import { fetchPublicCurrentColor } from "@/features/event/api/event-client";
import {
    ColorSocketConnection,
    connectColorSocket,
} from "@/features/event/lib/color-websocket";
import {
    SOCKJS_SCRIPT_SRC,
    STOMP_SCRIPT_SRC,
    useColorSocketScripts,
} from "@/features/event/lib/use-color-socket-scripts";
import { getDisplayErrorMessage } from "@/lib/api-client";
import { event as gtagEvent } from "@/libs/gtag";
import { RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;

export default function ClientPage() {
    const params = useParams();
    const eventId = params.key as string;

    return <ClientLightPage key={eventId} eventId={eventId} />;
}

function ClientLightPage({ eventId }: { eventId: string }) {
    const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInitialColorLoading, setIsInitialColorLoading] = useState(true);
    const [initialColorError, setInitialColorError] = useState<string | null>(
        null
    );
    const [socketError, setSocketError] = useState<string | null>(null);
    const [initialColorRequestVersion, setInitialColorRequestVersion] =
        useState(0);
    const [socketRetryVersion, setSocketRetryVersion] = useState(0);
    const socketConnectionRef = useRef<ColorSocketConnection | null>(null);
    const reconnectTimerRef = useRef<number | null>(null);
    const reconnectAttemptRef = useRef(0);
    const hasReceivedSocketColorRef = useRef(false);
    const {
        isReady: isSocketReady,
        onScriptError,
        onScriptReady,
        scriptError: socketScriptError,
    } = useColorSocketScripts();
    const socketScripts = (
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
        </>
    );

    useEffect(() => {
        let isActive = true;
        setIsInitialColorLoading(true);

        const loadCurrentColor = async () => {
            try {
                const color = await fetchPublicCurrentColor(eventId);

                if (!isActive) {
                    return;
                }

                if (!hasReceivedSocketColorRef.current) {
                    setBackgroundColor(color);
                }

                setInitialColorError(null);
                gtagEvent({
                    action: "client_connect",
                    category: "client_engagement",
                    label: eventId,
                });
            } catch (error) {
                if (!isActive) {
                    return;
                }

                if (!hasReceivedSocketColorRef.current) {
                    setInitialColorError(getDisplayErrorMessage(error));
                }
            } finally {
                if (isActive) {
                    setIsInitialColorLoading(false);
                }
            }
        };

        void loadCurrentColor();

        return () => {
            isActive = false;
        };
    }, [eventId, initialColorRequestVersion]);

    useEffect(() => {
        if (!isSocketReady) {
            return;
        }

        let isActive = true;
        let connectionGeneration = 0;

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
                return;
            }

            reconnectAttemptRef.current += 1;
            setIsConnected(false);

            const delay =
                RECONNECT_BASE_DELAY_MS * Math.pow(2, attemptIndex);

            clearReconnectTimer();
            reconnectTimerRef.current = window.setTimeout(() => {
                reconnectTimerRef.current = null;
                openConnection();
            }, delay);
        };

        const handleConnectionFailure = (
            message: string,
            generation: number
        ) => {
            if (!isActive || generation !== connectionGeneration) {
                return;
            }

            connectionGeneration += 1;
            socketConnectionRef.current?.disconnect();
            socketConnectionRef.current = null;
            setIsConnected(false);
            scheduleReconnect(message);
        };

        function openConnection() {
            if (!isActive) {
                return;
            }

            const generation = ++connectionGeneration;

            try {
                const connection = connectColorSocket({
                    eventId,
                    onConnected: () => {
                        if (
                            !isActive ||
                            generation !== connectionGeneration
                        ) {
                            return;
                        }

                        reconnectAttemptRef.current = 0;
                        setIsConnected(true);
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
                        setBackgroundColor(color);
                        setInitialColorError(null);
                        gtagEvent({
                            action: "color_received",
                            category: "client_engagement",
                            label: eventId,
                        });
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
                    "クライアント接続の初期化に失敗しました。",
                    generation
                );
            }
        }

        reconnectAttemptRef.current = 0;
        setSocketError(null);
        openConnection();

        return () => {
            isActive = false;
            clearReconnectTimer();
            disconnectCurrent();
        };
    }, [eventId, isSocketReady, socketRetryVersion]);

    const fatalError =
        initialColorError ?? socketScriptError ?? socketError;

    const retry = () => {
        if (initialColorError) {
            setInitialColorError(null);
            setIsInitialColorLoading(true);
            setInitialColorRequestVersion((current) => current + 1);
            return;
        }

        if (socketScriptError) {
            window.location.reload();
            return;
        }

        reconnectAttemptRef.current = 0;
        setSocketError(null);
        setSocketRetryVersion((current) => current + 1);
    };

    if (fatalError) {
        return (
            <>
                {socketScripts}
                <div
                    className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-8 text-center"
                    role="alert"
                >
                    <p className="text-red-700">{fatalError}</p>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
                        onClick={retry}
                        type="button"
                    >
                        <RefreshCw size={18} />
                        再試行
                    </button>
                </div>
            </>
        );
    }

    if (
        isInitialColorLoading ||
        (!isConnected && backgroundColor === null)
    ) {
        return (
            <>
                {socketScripts}
                <div className="flex h-screen items-center justify-center bg-gray-100">
                    <div className="text-gray-600">接続中...</div>
                </div>
            </>
        );
    }

    if (backgroundColor === null) {
        return (
            <>
                {socketScripts}
                <div className="flex h-screen items-center justify-center bg-gray-100">
                    <div className="text-center p-8">
                        <div className="mb-2 text-2xl font-bold text-gray-700">
                            色が選択されていません
                        </div>
                        <div className="text-gray-600">
                            主催者が色を選択するまでお待ちください
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {socketScripts}
            <div
                className="h-screen w-full"
                style={{ backgroundColor }}
            />
        </>
    );
}
