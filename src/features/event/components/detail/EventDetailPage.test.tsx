import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runBeforeLogoutCleanups } from "@/features/auth/lib/logout-lifecycle";
import { fetchEventDetail } from "@/features/event/api/event-client";
import { connectColorSocket } from "@/features/event/lib/color-websocket";
import EventDetailPage from "./EventDetailPage";

vi.mock("next/navigation", () => ({
    useParams: () => ({ eventUuid: "event-id" }),
}));

vi.mock("@/features/event/api/event-client", () => ({
    fetchEventDetail: vi.fn(),
}));

vi.mock("@/features/event/lib/color-websocket", () => ({
    hasColorSocketLibraries: () => true,
    connectColorSocket: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
    default: { error: vi.fn() },
}));

describe("EventDetailPage", () => {
    const disconnect = vi.fn();

    beforeEach(() => {
        disconnect.mockReset();
        vi.mocked(fetchEventDetail).mockReturnValue(
            new Promise(() => undefined)
        );
        vi.mocked(connectColorSocket).mockReturnValue({
            disconnect,
            sendColor: vi.fn(),
        });
    });

    it("registers its socket as a before-logout cleanup", () => {
        const view = render(<EventDetailPage />);

        expect(connectColorSocket).toHaveBeenCalledOnce();

        act(() => {
            runBeforeLogoutCleanups();
        });

        expect(disconnect).toHaveBeenCalledOnce();

        view.unmount();
    });
});
