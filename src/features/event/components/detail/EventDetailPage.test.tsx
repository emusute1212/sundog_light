import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runBeforeLogoutCleanups } from "@/features/auth/lib/logout-lifecycle";
import { fetchEventDetail } from "@/features/event/api/event-client";
import { connectColorSocket } from "@/features/event/lib/color-websocket";
import {
    COLOR_SOCKET_SCRIPT_ERROR_MESSAGE,
    SOCKJS_SCRIPT_SRC,
    STOMP_SCRIPT_SRC,
} from "@/features/event/lib/use-color-socket-scripts";
import EventDetailPage from "./EventDetailPage";

type SocketCallbacks = {
    eventId: string;
    onConnected: () => void;
    onColorChanged: (color: string | null) => void;
    onError: (message: string) => void;
};

type ScriptCallbacks = {
    onError?: () => void;
    onLoad?: () => void;
    src: string;
};

const {
    scriptPropsBySrc,
    socketLibrariesAvailable,
    toastError,
} = vi.hoisted(() => ({
    scriptPropsBySrc: new Map<string, unknown>(),
    socketLibrariesAvailable: { value: true },
    toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useParams: () => ({ eventUuid: "event-id" }),
}));

vi.mock("next/script", () => ({
    default: (props: ScriptCallbacks) => {
        scriptPropsBySrc.set(props.src, props);
        return null;
    },
}));

vi.mock("@/features/event/api/event-client", () => ({
    fetchEventDetail: vi.fn(),
    buildClientPageUrl: vi.fn(),
}));

vi.mock("@/features/event/lib/color-websocket", () => ({
    hasColorSocketLibraries: () => socketLibrariesAvailable.value,
    connectColorSocket: vi.fn(),
}));

vi.mock(
    "@/features/event/components/detail/section/EventDetailSection",
    () => ({
        default: ({
            event,
            onClickColor,
            selectedColor,
        }: {
            event: { colors: string[]; name: string };
            onClickColor: (color: string) => void;
            selectedColor: string | null;
        }) => (
            <div>
                <div>{event.name}</div>
                <div data-testid="selected-color">
                    {selectedColor ?? "none"}
                </div>
                {event.colors.map((color) => (
                    <button key={color} onClick={() => onClickColor(color)}>
                        {color}
                    </button>
                ))}
            </div>
        ),
    })
);

vi.mock("react-hot-toast", () => ({
    default: { error: toastError },
}));

describe("EventDetailPage", () => {
    const callbacks: SocketCallbacks[] = [];
    const disconnects: Array<ReturnType<typeof vi.fn>> = [];
    const sendColors: Array<ReturnType<typeof vi.fn>> = [];

    beforeEach(() => {
        vi.useFakeTimers();
        callbacks.length = 0;
        disconnects.length = 0;
        sendColors.length = 0;
        scriptPropsBySrc.clear();
        socketLibrariesAvailable.value = true;
        toastError.mockReset();
        vi.mocked(fetchEventDetail).mockResolvedValue({
            colors: ["#112233", "#445566"],
            currentColor: "#112233",
            name: "Test event",
            uuid: "event-id",
        });
        vi.mocked(connectColorSocket).mockImplementation(
            (options: SocketCallbacks) => {
                const disconnect = vi.fn();
                const sendColor = vi.fn();
                callbacks.push(options);
                disconnects.push(disconnect);
                sendColors.push(sendColor);

                return {
                    disconnect,
                    sendColor,
                };
            }
        );
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    async function renderLoadedPage() {
        const view = render(<EventDetailPage />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByText("Test event")).toBeInTheDocument();
        return view;
    }

    it("registers its socket as a before-logout cleanup", async () => {
        const view = await renderLoadedPage();

        expect(connectColorSocket).toHaveBeenCalledOnce();

        act(() => {
            runBeforeLogoutCleanups();
        });

        expect(disconnects[0]).toHaveBeenCalledOnce();
        view.unmount();
    });

    it("resynchronizes the selected color after reconnecting", async () => {
        vi.mocked(fetchEventDetail)
            .mockResolvedValueOnce({
                colors: ["#112233", "#445566"],
                currentColor: "#112233",
                name: "Test event",
                uuid: "event-id",
            })
            .mockResolvedValueOnce({
                colors: ["#112233", "#445566"],
                currentColor: "#445566",
                name: "Test event",
                uuid: "event-id",
            });
        const view = await renderLoadedPage();

        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onError("temporary error");
            vi.advanceTimersByTime(1000);
        });

        expect(connectColorSocket).toHaveBeenCalledTimes(2);
        expect(disconnects[0]).toHaveBeenCalledOnce();
        expect(toastError).not.toHaveBeenCalled();

        await act(async () => {
            callbacks[1].onConnected();
            await Promise.resolve();
        });

        expect(fetchEventDetail).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("selected-color")).toHaveTextContent(
            "#445566"
        );

        fireEvent.click(screen.getByRole("button", { name: "#445566" }));

        expect(sendColors[1]).toHaveBeenCalledWith({ color: null });
        view.unmount();
    });

    it("keeps a live color received while reconnect synchronization is pending", async () => {
        let resolveReconnectDetail: (
            value: Awaited<ReturnType<typeof fetchEventDetail>>
        ) => void = () => undefined;
        vi.mocked(fetchEventDetail)
            .mockResolvedValueOnce({
                colors: ["#112233", "#445566"],
                currentColor: "#112233",
                name: "Test event",
                uuid: "event-id",
            })
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveReconnectDetail = resolve;
                })
            );
        const view = await renderLoadedPage();

        act(() => {
            callbacks[0].onConnected();
            callbacks[0].onError("temporary error");
            vi.advanceTimersByTime(1000);
            callbacks[1].onConnected();
            callbacks[1].onColorChanged("#445566");
        });
        await act(async () => {
            resolveReconnectDetail({
                colors: ["#112233", "#445566"],
                currentColor: "#112233",
                name: "Test event",
                uuid: "event-id",
            });
        });

        expect(fetchEventDetail).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("selected-color")).toHaveTextContent(
            "#445566"
        );
        view.unmount();
    });

    it("keeps a live color received before the detail request completes", async () => {
        let resolveDetail: (
            value: Awaited<ReturnType<typeof fetchEventDetail>>
        ) => void = () => undefined;
        vi.mocked(fetchEventDetail).mockReturnValue(
            new Promise((resolve) => {
                resolveDetail = resolve;
            })
        );
        const view = render(<EventDetailPage />);

        act(() => {
            callbacks[0].onColorChanged("#445566");
        });
        await act(async () => {
            resolveDetail({
                colors: ["#112233", "#445566"],
                currentColor: "#112233",
                name: "Test event",
                uuid: "event-id",
            });
        });

        expect(screen.getByTestId("selected-color")).toHaveTextContent(
            "#445566"
        );
        view.unmount();
    });

    it("sends null when the selected color is clicked and applies the acknowledgement", async () => {
        const view = await renderLoadedPage();

        act(() => {
            callbacks[0].onConnected();
        });
        fireEvent.click(screen.getByRole("button", { name: "#112233" }));

        expect(sendColors[0]).toHaveBeenCalledWith({ color: null });
        expect(screen.getByText("色を変更中...")).toBeInTheDocument();

        act(() => {
            callbacks[0].onColorChanged(null);
        });

        expect(screen.getByTestId("selected-color")).toHaveTextContent("none");
        expect(screen.queryByText("色を変更中...")).not.toBeInTheDocument();
        view.unmount();
    });

    it("reports a missing color acknowledgement after five seconds", async () => {
        const view = await renderLoadedPage();

        act(() => {
            callbacks[0].onConnected();
        });
        fireEvent.click(screen.getByRole("button", { name: "#445566" }));
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(toastError).toHaveBeenCalledWith("色変更の応答がありません。");
        expect(screen.queryByText("色を変更中...")).not.toBeInTheDocument();
        view.unmount();
    });

    it("reports a synchronous send failure", async () => {
        const view = await renderLoadedPage();
        sendColors[0].mockImplementation(() => {
            throw new Error("send failed");
        });

        act(() => {
            callbacks[0].onConnected();
        });
        fireEvent.click(screen.getByRole("button", { name: "#445566" }));

        expect(toastError).toHaveBeenCalledWith("色の変更に失敗しました。");
        expect(screen.queryByText("色を変更中...")).not.toBeInTheDocument();
        view.unmount();
    });

    it("shows the final socket error after reconnect attempts are exhausted", async () => {
        const view = await renderLoadedPage();

        act(() => callbacks[0].onError("socket failed"));
        act(() => vi.advanceTimersByTime(1000));
        act(() => callbacks[1].onError("socket failed"));
        act(() => vi.advanceTimersByTime(2000));
        act(() => callbacks[2].onError("socket failed"));
        act(() => vi.advanceTimersByTime(4000));
        act(() => callbacks[3].onError("socket failed"));

        expect(connectColorSocket).toHaveBeenCalledTimes(4);
        expect(toastError).toHaveBeenCalledWith("socket failed");
        expect(screen.getByText("socket failed")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "再接続" }));

        expect(connectColorSocket).toHaveBeenCalledTimes(5);
        expect(screen.queryByText("socket failed")).not.toBeInTheDocument();
        view.unmount();
    });

    it("surfaces pinned socket script load failures", async () => {
        socketLibrariesAvailable.value = false;
        const view = await renderLoadedPage();
        const sockJsScript = scriptPropsBySrc.get(
            SOCKJS_SCRIPT_SRC
        ) as ScriptCallbacks;

        expect(scriptPropsBySrc.has(STOMP_SCRIPT_SRC)).toBe(true);

        act(() => {
            sockJsScript.onError?.();
        });

        expect(
            screen.getByText(COLOR_SOCKET_SCRIPT_ERROR_MESSAGE)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "再読み込み" })
        ).toBeInTheDocument();
        expect(connectColorSocket).not.toHaveBeenCalled();
        view.unmount();
    });
});
