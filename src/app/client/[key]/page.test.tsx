import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
} = vi.hoisted(() => ({
    connectColorSocketMock: vi.fn(),
    currentEventId: { value: "event-id" },
    fetchPublicCurrentColorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useParams: () => ({ key: currentEventId.value }),
}));

vi.mock("next/script", () => ({
    default: () => null,
}));

vi.mock("@/features/event/api/event-client", () => ({
    fetchPublicCurrentColor: fetchPublicCurrentColorMock,
}));

vi.mock("@/features/event/lib/color-websocket", () => ({
    hasColorSocketLibraries: () => true,
    connectColorSocket: connectColorSocketMock,
}));

describe("ClientPage WebSocket reconnection", () => {
    const callbacks: SocketCallbacks[] = [];
    const disconnects: Array<ReturnType<typeof vi.fn>> = [];

    beforeEach(() => {
        vi.useFakeTimers();
        callbacks.length = 0;
        disconnects.length = 0;
        currentEventId.value = "event-id";
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

        act(() => {
            callbacks[1].onConnected();
        });

        expect(screen.queryByText("再接続中...")).not.toBeInTheDocument();
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
