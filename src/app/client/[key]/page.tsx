"use client";
import { fetchPublicCurrentColor } from "@/features/event/api/event-client";
import {
    ColorSocketConnection,
    connectColorSocket,
    hasColorSocketLibraries,
} from "@/features/event/lib/color-websocket";
import { getDisplayErrorMessage } from "@/lib/api-client";
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
    const [loadedSocketScriptCount, setLoadedSocketScriptCount] = useState(() =>
        hasColorSocketLibraries() ? 2 : 0
    );
    const [initialColorError, setInitialColorError] = useState<string | null>(
        null
    );
    const [socketError, setSocketError] = useState<string | null>(null);
    const socketConnectionRef = useRef<ColorSocketConnection | null>(null);
    const reconnectTimerRef = useRef<number | null>(null);
    const reconnectAttemptRef = useRef(0);
    const isSocketReady = loadedSocketScriptCount >= 2;
    const socketScripts = (
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
        </>
    );

    useEffect(() => {
        if (hasColorSocketLibraries()) {
            setLoadedSocketScriptCount(2);
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadCurrentColor = async () => {
            try {
                const color = await fetchPublicCurrentColor(eventId);

                if (!isActive) {
                    return;
                }

                setBackgroundColor(color);
                setInitialColorError(null);
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setInitialColorError(getDisplayErrorMessage(error));
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
    }, [eventId]);

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

                        setBackgroundColor(color);
                        setInitialColorError(null);
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
    }, [eventId, isSocketReady]);

    const fatalError = initialColorError ?? socketError;

    if (fatalError) {
        return (
            <>
                {socketScripts}
                <div className="flex h-screen items-center justify-center bg-gray-100 p-8 text-center text-red-600">
                    {fatalError}
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
