import { act, render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    COLOR_SOCKET_SCRIPT_ERROR_MESSAGE,
    SOCKJS_SCRIPT_SRC,
} from "@/features/event/lib/use-color-socket-scripts";
import ClientPage from "./page";

type SocketCallbacks = {
    eventId: string;
    onConnected: () => void;
    onColorChanged: (color: string | null) => void;
    onError: (message: string) => void;
};

const {
    connectColorSocketMock,
    currentEventId,
    fetchPublicCurrentColorMock,
    gtagEventMock,
    scriptPropsBySrc,
    socketLibrariesAvailable,
} = vi.hoisted(() => ({
    connectColorSocketMock: vi.fn(),
    currentEventId: { value: "event-id" },
    fetchPublicCurrentColorMock: vi.fn(),
    gtagEventMock: vi.fn(),
    scriptPropsBySrc: new Map<string, unknown>(),
    socketLibrariesAvailable: { value: true },
}));

vi.mock("next/navigation", () => ({
    useParams: () => ({ key: currentEventId.value }),
}));

vi.mock("next/script", () => ({
    default: (props: { src: string }) => {
        scriptPropsBySrc.set(props.src, props);
        return null;
    },
}));

vi.mock("@/features/event/api/event-client", () => ({
    fetchPublicCurrentColor: fetchPublicCurrentColorMock,
}));

vi.mock("@/features/event/lib/color-websocket", () => ({
    hasColorSocketLibraries: () => socketLibrariesAvailable.value,
    connectColorSocket: connectColorSocketMock,
}));

vi.mock("@/libs/gtag", () => ({
    event: gtagEventMock,
}));

describe("ClientPage WebSocket reconnection", () => {
    const callbacks: SocketCallbacks[] = [];
    const disconnects: Array<ReturnType<typeof vi.fn>> = [];

    beforeEach(() => {
        vi.useFakeTimers();
        callbacks.length = 0;
        disconnects.length = 0;
        currentEventId.value = "event-id";
        gtagEventMock.mockReset();
        scriptPropsBySrc.clear();
        socketLibrariesAvailable.value = true;
        fetchPublicCurrentColorMock.mockResolvedValue("#112233");
        connectColorSocketMock.mockImplementation(
            (options: SocketCallbacks) => {
                const disconnect = vi.fn();
                callbacks.push(options);
                disconnects.push(disconnect);

                return {
                    disconnect,
                    sendColor: vi.fn(),
                };
            }
        );
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("keeps the last color and reconnects after a transient error", async () => {
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });
        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onColorChanged("#112233");
            callbacks[0].onError(
                "色変更用 WebSocket の接続に失敗しました。"
            );
        });

        expect(
            screen.queryByText(
                "色変更用 WebSocket の接続に失敗しました。"
            )
        ).not.toBeInTheDocument();
        expect(screen.queryByText("再接続中...")).not.toBeInTheDocument();
        const colorSurface = view.container.querySelector("div[style]");
        expect(colorSurface).toHaveStyle({
            backgroundColor: "#112233",
        });

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(connectColorSocketMock).toHaveBeenCalledTimes(2);

        await act(async () => {
            callbacks[1].onConnected();
            await Promise.resolve();
        });

        expect(screen.queryByText("再接続中...")).not.toBeInTheDocument();
        expect(fetchPublicCurrentColorMock).toHaveBeenCalledTimes(2);
        expect(gtagEventMock).toHaveBeenCalledWith({
            action: "client_connect",
            category: "client_engagement",
            label: "event-id",
        });
        expect(gtagEventMock).toHaveBeenCalledWith({
            action: "color_received",
            category: "client_engagement",
            label: "event-id",
        });
        view.unmount();
    });

    it("resynchronizes the current color after reconnecting", async () => {
        fetchPublicCurrentColorMock
            .mockResolvedValueOnce("#112233")
            .mockResolvedValueOnce("#778899");
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });
        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onError("temporary error");
            vi.advanceTimersByTime(1000);
        });

        await act(async () => {
            callbacks[1].onConnected();
            await Promise.resolve();
        });

        expect(fetchPublicCurrentColorMock).toHaveBeenCalledTimes(2);
        expect(view.container.querySelector("div[style]")).toHaveStyle({
            backgroundColor: "#778899",
        });
        view.unmount();
    });

    it("keeps a live color received while reconnect synchronization is pending", async () => {
        let resolveReconnectColor: (color: string | null) => void = () =>
            undefined;
        fetchPublicCurrentColorMock
            .mockResolvedValueOnce("#112233")
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveReconnectColor = resolve;
                })
            );
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });
        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onError("temporary error");
            vi.advanceTimersByTime(1000);
            callbacks[1].onConnected();
            callbacks[1].onColorChanged("#445566");
        });
        await act(async () => {
            resolveReconnectColor("#778899");
        });

        expect(fetchPublicCurrentColorMock).toHaveBeenCalledTimes(2);
        expect(view.container.querySelector("div[style]")).toHaveStyle({
            backgroundColor: "#445566",
        });
        view.unmount();
    });

    it("keeps a live color received before the initial request completes", async () => {
        let resolveInitialColor: (color: string | null) => void = () => undefined;
        fetchPublicCurrentColorMock.mockReturnValue(
            new Promise((resolve) => {
                resolveInitialColor = resolve;
            })
        );
        const view = render(<ClientPage />);

        act(() => {
            callbacks[0].onColorChanged("#445566");
        });

        expect(screen.queryByText("接続中...")).not.toBeInTheDocument();
        expect(view.container.querySelector("div[style]")).toHaveStyle({
            backgroundColor: "#445566",
        });

        await act(async () => {
            resolveInitialColor("#112233");
        });

        expect(view.container.querySelector("div[style]")).toHaveStyle({
            backgroundColor: "#445566",
        });
        view.unmount();
    });

    it("keeps the live color when the older initial request fails", async () => {
        let rejectInitialColor: (reason: unknown) => void = () => undefined;
        fetchPublicCurrentColorMock.mockReturnValue(
            new Promise((_resolve, reject) => {
                rejectInitialColor = reject;
            })
        );
        const view = render(<ClientPage />);

        act(() => {
            callbacks[0].onColorChanged("#445566");
        });
        await act(async () => {
            rejectInitialColor(new Error("initial request failed"));
        });

        expect(view.container.querySelector("div[style]")).toHaveStyle({
            backgroundColor: "#445566",
        });
        expect(
            screen.queryByText("initial request failed")
        ).not.toBeInTheDocument();
        view.unmount();
    });

    it("keeps the generic connecting screen while retrying before a color is available", () => {
        fetchPublicCurrentColorMock.mockReturnValue(
            new Promise(() => undefined)
        );
        const view = render(<ClientPage />);

        act(() => {
            callbacks[0].onError("temporary error");
        });

        expect(screen.getByText("接続中...")).toBeInTheDocument();
        expect(screen.queryByText("再接続中...")).not.toBeInTheDocument();
        expect(screen.queryByText("temporary error")).not.toBeInTheDocument();
        view.unmount();
    });

    it("ignores callbacks from a stale connection", async () => {
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });
        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onColorChanged("#112233");
            callbacks[0].onError("temporary error");
            vi.advanceTimersByTime(1000);
        });

        expect(connectColorSocketMock).toHaveBeenCalledTimes(2);

        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onColorChanged("#ff0000");
            callbacks[0].onError("stale error");
        });

        expect(screen.queryByText("再接続中...")).not.toBeInTheDocument();
        const colorSurface = view.container.querySelector("div[style]");
        expect(colorSurface).toHaveStyle({
            backgroundColor: "#112233",
        });
        expect(screen.queryByText("stale error")).not.toBeInTheDocument();

        act(() => {
            callbacks[1].onConnected();
            callbacks[1].onColorChanged("#445566");
        });

        const updatedColorSurface = view.container.querySelector("div[style]");
        expect(updatedColorSurface).toHaveStyle({
            backgroundColor: "#445566",
        });
        view.unmount();
    });

    it("resets the previous event state when the route key changes", async () => {
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });
        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onColorChanged("#112233");
        });

        expect(view.container.querySelector("div[style]")).toHaveStyle({
            backgroundColor: "#112233",
        });

        currentEventId.value = "next-event-id";
        fetchPublicCurrentColorMock.mockReturnValue(
            new Promise(() => undefined)
        );
        view.rerender(<ClientPage />);

        expect(disconnects[0]).toHaveBeenCalledOnce();
        expect(
            view.container.querySelector('div[style*="17, 34, 51"]')
        ).not.toBeInTheDocument();
        expect(screen.getByText("接続中...")).toBeInTheDocument();
        view.unmount();
    });

    it("shows a terminal error only after three reconnect attempts fail", async () => {
        const view = render(<ClientPage />);
        const message = "色変更用 WebSocket の接続に失敗しました。";

        await act(async () => {
            await Promise.resolve();
        });

        act(() => callbacks[0].onError(message));
        act(() => vi.advanceTimersByTime(1000));
        act(() => callbacks[1].onError(message));
        act(() => vi.advanceTimersByTime(2000));
        act(() => callbacks[2].onError(message));
        act(() => vi.advanceTimersByTime(4000));
        act(() => callbacks[3].onError(message));

        expect(screen.getByText(message)).toBeInTheDocument();
        expect(connectColorSocketMock).toHaveBeenCalledTimes(4);

        fireEvent.click(screen.getByRole("button", { name: "再試行" }));

        expect(connectColorSocketMock).toHaveBeenCalledTimes(5);
        expect(screen.queryByText(message)).not.toBeInTheDocument();
        view.unmount();
    });

    it("surfaces a socket script load failure", async () => {
        socketLibrariesAvailable.value = false;
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });

        const sockJsScript = scriptPropsBySrc.get(SOCKJS_SCRIPT_SRC) as {
            onError?: () => void;
        };

        act(() => {
            sockJsScript.onError?.();
        });

        expect(
            screen.getByText(COLOR_SOCKET_SCRIPT_ERROR_MESSAGE)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "再試行" })
        ).toBeInTheDocument();
        expect(connectColorSocketMock).not.toHaveBeenCalled();
        view.unmount();
    });

    it("times out while waiting for socket scripts", async () => {
        socketLibrariesAvailable.value = false;
        const view = render(<ClientPage />);

        await act(async () => {
            await Promise.resolve();
        });
        act(() => {
            vi.advanceTimersByTime(10_000);
        });

        expect(
            screen.getByText(COLOR_SOCKET_SCRIPT_ERROR_MESSAGE)
        ).toBeInTheDocument();
        view.unmount();
    });

    it("cancels a pending reconnect when the page unmounts", () => {
        const view = render(<ClientPage />);

        act(() => {
            callbacks[0].onError("temporary error");
        });
        view.unmount();
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(connectColorSocketMock).toHaveBeenCalledOnce();
        expect(disconnects[0]).toHaveBeenCalledOnce();
    });
});
