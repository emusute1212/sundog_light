import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { connectColorSocket } from "./color-websocket";

type ConnectSuccess = (frame: string) => void;
type ConnectError = (error: unknown) => void;
type MessageCallback = (message: { body: string }) => void;

describe("connectColorSocket", () => {
    let connectSuccess: ConnectSuccess | null;
    let connectError: ConnectError | null;
    let messageCallback: MessageCallback | null;
    let rawSocketClose: ReturnType<typeof vi.fn>;
    let unsubscribe: ReturnType<typeof vi.fn>;
    let socketUrl: string | null;
    let client: {
        connected: boolean;
        debug: (message: string) => void;
        connect: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
        subscribe: ReturnType<typeof vi.fn>;
        send: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        connectSuccess = null;
        connectError = null;
        messageCallback = null;
        rawSocketClose = vi.fn();
        unsubscribe = vi.fn();
        socketUrl = null;

        client = {
            connected: false,
            debug: vi.fn(),
            connect: vi.fn(
                (
                    _headers: Record<string, string>,
                    onConnect: ConnectSuccess,
                    onError: ConnectError
                ) => {
                    connectSuccess = onConnect;
                    connectError = onError;
                }
            ),
            disconnect: vi.fn((onDisconnect?: () => void) => {
                onDisconnect?.();
            }),
            subscribe: vi.fn(
                (_destination: string, onMessage: MessageCallback) => {
                    messageCallback = onMessage;
                    return { unsubscribe };
                }
            ),
            send: vi.fn(),
        };

        class MockSockJs {
            close = rawSocketClose;

            constructor(url: string) {
                socketUrl = url;
            }
        }

        window.SockJS = MockSockJs;
        window.Stomp = {
            over: () => client,
        };
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("closes a connecting transport and ignores its late error", () => {
        const onError = vi.fn();
        const connection = connectColorSocket({
            eventId: "event-id",
            onConnected: vi.fn(),
            onColorChanged: vi.fn(),
            onError,
        });

        connection.disconnect();
        connectError?.("Whoops! Lost connection");

        expect(rawSocketClose).toHaveBeenCalledOnce();
        expect(onError).not.toHaveBeenCalled();
    });

    it("does not subscribe when connect succeeds after disposal", () => {
        const onConnected = vi.fn();
        const connection = connectColorSocket({
            eventId: "event-id",
            onConnected,
            onColorChanged: vi.fn(),
            onError: vi.fn(),
        });

        connection.disconnect();
        connectSuccess?.("CONNECTED");

        expect(client.subscribe).not.toHaveBeenCalled();
        expect(onConnected).not.toHaveBeenCalled();
    });

    it("unsubscribes and disconnects a connected client only once", () => {
        const onError = vi.fn();
        const connection = connectColorSocket({
            eventId: "event-id",
            onConnected: vi.fn(),
            onColorChanged: vi.fn(),
            onError,
        });

        client.connected = true;
        connectSuccess?.("CONNECTED");
        connection.disconnect();
        connection.disconnect();
        connectError?.("Whoops! Lost connection");

        expect(unsubscribe).toHaveBeenCalledOnce();
        expect(client.disconnect).toHaveBeenCalledOnce();
        expect(onError).not.toHaveBeenCalled();
    });

    it("ignores messages received after disposal", () => {
        const onColorChanged = vi.fn();
        const onError = vi.fn();
        const connection = connectColorSocket({
            eventId: "event-id",
            onConnected: vi.fn(),
            onColorChanged,
            onError,
        });

        client.connected = true;
        connectSuccess?.("CONNECTED");
        connection.disconnect();
        messageCallback?.({ body: JSON.stringify({ color: 0xff0000 }) });

        expect(onColorChanged).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });

    it("sends selected colors and deselection as the socket payload", () => {
        const connection = connectColorSocket({
            eventId: "event-id",
            onConnected: vi.fn(),
            onColorChanged: vi.fn(),
            onError: vi.fn(),
        });

        client.connected = true;
        connectSuccess?.("CONNECTED");

        connection.sendColor({ color: "#112233" });
        connection.sendColor({ color: null });

        expect(client.send).toHaveBeenNthCalledWith(
            1,
            "/app/event/event-id/color",
            {},
            JSON.stringify({
                eventId: "event-id",
                color: 0x112233,
            })
        );
        expect(client.send).toHaveBeenNthCalledWith(
            2,
            "/app/event/event-id/color",
            {},
            JSON.stringify({
                eventId: "event-id",
                color: null,
            })
        );
    });

    it("connects directly to the configured API WebSocket endpoint", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/");

        connectColorSocket({
            eventId: "event-id",
            onConnected: vi.fn(),
            onColorChanged: vi.fn(),
            onError: vi.fn(),
        });

        expect(socketUrl).toBe("https://api.example.com/ws");
    });

    it("uses the same-origin proxy when the API base URL is not configured", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

        connectColorSocket({
            eventId: "event-id",
            onConnected: vi.fn(),
            onColorChanged: vi.fn(),
            onError: vi.fn(),
        });

        expect(socketUrl).toBe("/ws");
    });
});
