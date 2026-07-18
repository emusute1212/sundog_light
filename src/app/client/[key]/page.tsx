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

export default function ClientPage() {
    const params = useParams();
    const eventId = params.key as string;
    const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInitialColorLoading, setIsInitialColorLoading] = useState(true);
    const [loadedSocketScriptCount, setLoadedSocketScriptCount] = useState(() =>
        hasColorSocketLibraries() ? 2 : 0
    );
    const [socketError, setSocketError] = useState<string | null>(null);
    const socketConnectionRef = useRef<ColorSocketConnection | null>(null);
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
                setSocketError(null);
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setSocketError(getDisplayErrorMessage(error));
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

        try {
            const connection = connectColorSocket({
                eventId,
                onConnected: () => {
                    setIsConnected(true);
                    setSocketError(null);
                },
                onColorChanged: (color) => {
                    setBackgroundColor(color);
                },
                onError: (message) => {
                    setSocketError(message);
                    setIsConnected(false);
                },
            });

            socketConnectionRef.current = connection;

            return () => {
                socketConnectionRef.current?.disconnect();
                socketConnectionRef.current = null;
                setIsConnected(false);
            };
        } catch {
            setSocketError("クライアント接続の初期化に失敗しました。");
            return;
        }
    }, [eventId, isSocketReady]);

    if (socketError) {
        return (
            <>
                {socketScripts}
                <div className="flex h-screen items-center justify-center bg-gray-100 p-8 text-center text-red-600">
                    {socketError}
                </div>
            </>
        );
    }

    if (!isConnected || isInitialColorLoading) {
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
