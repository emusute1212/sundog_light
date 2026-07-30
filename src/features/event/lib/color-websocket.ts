import { hexColorToInt, intColorToHex } from "@/lib/color";
import { EventSendableColor } from "../types/event-sendable-color";

type SockJsSocket = {
    close: () => void;
};

type SockJsConstructor = new (url: string) => SockJsSocket;

type StompMessage = {
    body: string;
};

type StompSubscription = {
    unsubscribe: () => void;
};

type StompClient = {
    connected?: boolean;
    debug?: (message: string) => void;
    connect: (
        headers: Record<string, string>,
        onConnect: (frame: string) => void,
        onError: (error: unknown) => void
    ) => void;
    disconnect: (onDisconnect?: () => void) => void;
    subscribe: (
        destination: string,
        onMessage: (message: StompMessage) => void
    ) => StompSubscription;
    send: (
        destination: string,
        headers?: Record<string, string>,
        body?: string
    ) => void;
};

type StompFactory = {
    over: (socket: SockJsSocket) => StompClient;
};

declare global {
    interface Window {
        SockJS?: SockJsConstructor;
        Stomp?: StompFactory;
    }
}

type ColorTopicMessage = {
    color?: number | null;
    currentColor?: number | null;
    selectedColor?: number | null;
};

type ConnectColorSocketOptions = {
    eventId: string;
    onConnected: () => void;
    onColorChanged: (color: string | null) => void;
    onError: (message: string) => void;
};

export type ColorSocketConnection = {
    disconnect: () => void;
    sendColor: (message: EventSendableColor) => void;
};

function resolveColor(message: ColorTopicMessage) {
    return intColorToHex(
        message.selectedColor ?? message.currentColor ?? message.color
    );
}

export function hasColorSocketLibraries() {
    return typeof window !== "undefined" && !!window.SockJS && !!window.Stomp;
}

function getSocketLibraries() {
    if (!hasColorSocketLibraries()) {
        throw new Error("WebSocket libraries are not loaded.");
    }

    return {
        SockJS: window.SockJS as SockJsConstructor,
        Stomp: window.Stomp as StompFactory,
    };
}

function resolveColorSocketUrl() {
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

    if (!configuredBaseUrl) {
        // ローカル開発用
        return "http://localhost:8080/ws";
    }

    return `${configuredBaseUrl.replace(/\/$/, "")}/ws`;
}

export function connectColorSocket({
    eventId,
    onConnected,
    onColorChanged,
    onError,
}: ConnectColorSocketOptions): ColorSocketConnection {
    const { SockJS, Stomp } = getSocketLibraries();
    const socket = new SockJS(resolveColorSocketUrl());
    const client = Stomp.over(socket);
    let subscription: StompSubscription | null = null;
    let isDisposed = false;

    const closeRawSocket = () => {
        try {
            socket.close();
        } catch {
            // The SockJS transport may already be closed.
        }
    };

    client.debug = () => undefined;

    client.connect(
        {},
        () => {
            if (isDisposed) {
                closeRawSocket();
                return;
            }

            subscription = client.subscribe(
                `/topic/event/${eventId}`,
                (message) => {
                    if (isDisposed) {
                        return;
                    }

                    try {
                        const payload = JSON.parse(
                            message.body
                        ) as ColorTopicMessage;
                        onColorChanged(resolveColor(payload));
                    } catch {
                        onError("色更新メッセージの解析に失敗しました。");
                    }
                }
            );

            if (!isDisposed) {
                onConnected();
            }
        },
        (error) => {
            if (isDisposed) {
                return;
            }

            onError(
                error instanceof Error
                    ? error.message
                    : "色変更用 WebSocket の接続に失敗しました。"
            );
        }
    );

    return {
        disconnect: () => {
            if (isDisposed) {
                return;
            }

            // Mark the connection as intentionally closed before any callback
            // can be emitted by the underlying transport.
            isDisposed = true;

            try {
                subscription?.unsubscribe();
            } catch {
                // Ignore an unsubscribe race after transport loss.
            } finally {
                subscription = null;
            }

            if (client.connected) {
                try {
                    client.disconnect(() => undefined);
                } catch {
                    closeRawSocket();
                }
            } else {
                // Legacy stompjs disconnect() does not close a CONNECTING socket.
                closeRawSocket();
            }
        },
        sendColor: ({ color }: EventSendableColor) => {
            if (isDisposed || !client.connected) {
                throw new Error("Color WebSocket is not connected.");
            }

            client.send(
                `/app/event/${eventId}/color`,
                {},
                JSON.stringify({
                    eventId,
                    color: color == null ? null : hexColorToInt(color),
                })
            );
        },
    };
}
