import { act, render, screen, waitFor } from "@testing-library/react";
import type { MaintenanceStatusResponse } from "@/lib/maintenance";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EventMaintenanceGate from "./EventMaintenanceGate";

const {
    currentPathname,
    getClientMaintenanceStatusMock,
    router,
    routerReplace,
} = vi.hoisted(() => {
    const replace = vi.fn();

    return {
        currentPathname: { value: "/event/list" },
        getClientMaintenanceStatusMock: vi.fn(),
        router: { replace },
        routerReplace: replace,
    };
});

vi.mock("next/navigation", () => ({
    usePathname: () => currentPathname.value,
    useRouter: () => router,
}));

vi.mock("@/lib/maintenance-client", () => ({
    getClientMaintenanceStatus: getClientMaintenanceStatusMock,
}));

const availableStatus: MaintenanceStatusResponse = {
    maintenanceStatus: {
        enabled: false,
        message: "利用できます。",
        retryAfterSeconds: 0,
    },
    notice: {
        enabled: false,
        message: "",
    },
};

const maintenanceStatus: MaintenanceStatusResponse = {
    maintenanceStatus: {
        enabled: true,
        message: "メンテナンス中です。",
        retryAfterSeconds: 300,
    },
    notice: {
        enabled: false,
        message: "",
    },
};

describe("EventMaintenanceGate", () => {
    beforeEach(() => {
        currentPathname.value = "/event/list";
        getClientMaintenanceStatusMock.mockReset();
        getClientMaintenanceStatusMock.mockResolvedValue(availableStatus);
        routerReplace.mockReset();
    });

    it("uses the server-side check for the initial event route", () => {
        render(
            <EventMaintenanceGate>
                <div>event list</div>
            </EventMaintenanceGate>
        );

        expect(screen.getByText("event list")).toBeInTheDocument();
        expect(getClientMaintenanceStatusMock).not.toHaveBeenCalled();
    });

    it("hides the destination until maintenance is rechecked", async () => {
        let resolveStatus: (status: MaintenanceStatusResponse) => void = () =>
            undefined;
        getClientMaintenanceStatusMock.mockReturnValue(
            new Promise((resolve) => {
                resolveStatus = resolve;
            })
        );
        const view = render(
            <EventMaintenanceGate>
                <div>event list</div>
            </EventMaintenanceGate>
        );

        currentPathname.value = "/event/create";
        view.rerender(
            <EventMaintenanceGate>
                <div>event create</div>
            </EventMaintenanceGate>
        );

        expect(screen.getByText("読み込み中...")).toBeInTheDocument();
        expect(screen.queryByText("event create")).not.toBeInTheDocument();

        await act(async () => {
            resolveStatus(availableStatus);
        });

        expect(screen.getByText("event create")).toBeInTheDocument();
        expect(getClientMaintenanceStatusMock).toHaveBeenCalledOnce();
    });

    it("redirects an event navigation when maintenance is enabled", async () => {
        getClientMaintenanceStatusMock.mockResolvedValue(maintenanceStatus);
        const view = render(
            <EventMaintenanceGate>
                <div>event list</div>
            </EventMaintenanceGate>
        );

        currentPathname.value = "/event/create";
        view.rerender(
            <EventMaintenanceGate>
                <div>event create</div>
            </EventMaintenanceGate>
        );

        await waitFor(() => {
            expect(routerReplace).toHaveBeenCalledWith("/maintenance");
        });
        expect(screen.queryByText("event create")).not.toBeInTheDocument();
    });

    it("fails open when the maintenance check cannot complete", async () => {
        getClientMaintenanceStatusMock.mockRejectedValue(
            new Error("maintenance request failed")
        );
        const view = render(
            <EventMaintenanceGate>
                <div>event list</div>
            </EventMaintenanceGate>
        );

        currentPathname.value = "/event/create";
        view.rerender(
            <EventMaintenanceGate>
                <div>event create</div>
            </EventMaintenanceGate>
        );

        await waitFor(() => {
            expect(screen.getByText("event create")).toBeInTheDocument();
        });
        expect(routerReplace).not.toHaveBeenCalled();
    });

    it("rechecks when returning to the same event path", async () => {
        let resolveStatus: (status: MaintenanceStatusResponse) => void = () =>
            undefined;
        getClientMaintenanceStatusMock.mockReturnValue(
            new Promise((resolve) => {
                resolveStatus = resolve;
            })
        );
        const view = render(
            <EventMaintenanceGate>
                <div>event list</div>
            </EventMaintenanceGate>
        );

        currentPathname.value = "/login";
        view.rerender(
            <EventMaintenanceGate>
                <div>login page</div>
            </EventMaintenanceGate>
        );
        expect(screen.getByText("login page")).toBeInTheDocument();

        currentPathname.value = "/event/list";
        view.rerender(
            <EventMaintenanceGate>
                <div>event list again</div>
            </EventMaintenanceGate>
        );

        expect(screen.getByText("読み込み中...")).toBeInTheDocument();
        expect(screen.queryByText("event list again")).not.toBeInTheDocument();

        await act(async () => {
            resolveStatus(availableStatus);
        });

        expect(screen.getByText("event list again")).toBeInTheDocument();
        expect(getClientMaintenanceStatusMock).toHaveBeenCalledOnce();
    });

    it("ignores a stale result after another navigation", async () => {
        let resolveCreateStatus: (
            status: MaintenanceStatusResponse
        ) => void = () => undefined;
        let resolveDetailStatus: (
            status: MaintenanceStatusResponse
        ) => void = () => undefined;
        getClientMaintenanceStatusMock
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveCreateStatus = resolve;
                })
            )
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveDetailStatus = resolve;
                })
            );
        const view = render(
            <EventMaintenanceGate>
                <div>event list</div>
            </EventMaintenanceGate>
        );

        currentPathname.value = "/event/create";
        view.rerender(
            <EventMaintenanceGate>
                <div>event create</div>
            </EventMaintenanceGate>
        );
        currentPathname.value = "/event/detail/event-id";
        view.rerender(
            <EventMaintenanceGate>
                <div>event detail</div>
            </EventMaintenanceGate>
        );

        await act(async () => {
            resolveCreateStatus(maintenanceStatus);
        });

        expect(routerReplace).not.toHaveBeenCalled();
        expect(screen.getByText("読み込み中...")).toBeInTheDocument();

        await act(async () => {
            resolveDetailStatus(availableStatus);
        });

        expect(screen.getByText("event detail")).toBeInTheDocument();
        expect(getClientMaintenanceStatusMock).toHaveBeenCalledTimes(2);
    });
});
