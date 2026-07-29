import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./AuthProvider";
import HostShell from "./HostShell";

const { currentPathname, routerReplace, toastError } = vi.hoisted(() => ({
    currentPathname: { value: "/event/detail/event-id" },
    routerReplace: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    usePathname: () => currentPathname.value,
    useRouter: () => ({ replace: routerReplace }),
}));

vi.mock("./AuthProvider", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@/features/core/components/SundogLightHeader", () => ({
    default: ({
        onClickLogoutButton,
    }: {
        onClickLogoutButton: () => void;
    }) => <button onClick={onClickLogoutButton}>logout</button>,
}));

vi.mock("@/features/core/components/MaintenanceNoticeBanner", () => ({
    default: () => null,
}));

vi.mock("react-hot-toast", () => ({
    default: { error: toastError },
    Toaster: () => null,
}));

describe("HostShell", () => {
    beforeEach(() => {
        currentPathname.value = "/event/detail/event-id";
        routerReplace.mockReset();
        toastError.mockReset();
    });

    it("renders the login page after a successful logout", async () => {
        const logout = vi.fn().mockResolvedValue(undefined);

        vi.mocked(useAuth).mockReturnValue({
            isReady: true,
            retrySession: vi.fn(),
            session: { user: { id: "user-id" } },
            sessionError: null,
            logout,
        });

        const view = render(
            <HostShell notice={{ enabled: false, message: "" }}>
                <div>event detail</div>
            </HostShell>
        );

        fireEvent.click(screen.getByRole("button", { name: "logout" }));

        await waitFor(() => {
            expect(routerReplace).toHaveBeenCalledWith("/login");
        });

        currentPathname.value = "/login";
        vi.mocked(useAuth).mockReturnValue({
            isReady: true,
            retrySession: vi.fn(),
            session: null,
            sessionError: null,
            logout,
        });
        view.rerender(
            <HostShell notice={{ enabled: false, message: "" }}>
                <div>login page</div>
            </HostShell>
        );

        expect(screen.getByText("login page")).toBeInTheDocument();
        expect(routerReplace).toHaveBeenCalledTimes(1);

        await act(async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 0));
        });

        currentPathname.value = "/event/detail/event-id";
        view.rerender(
            <HostShell notice={{ enabled: false, message: "" }}>
                <div>protected page</div>
            </HostShell>
        );

        await waitFor(() => {
            expect(routerReplace).toHaveBeenLastCalledWith(
                "/login?callbackUrl=%2Fevent%2Fdetail%2Fevent-id"
            );
        });
    });

    it("unmounts children while logout is pending and remounts on failure", async () => {
        let rejectLogout: (reason: unknown) => void = () => undefined;
        const logout = vi.fn(
            () =>
                new Promise<void>((_resolve, reject) => {
                    rejectLogout = reject;
                })
        );
        const childMounted = vi.fn();
        const childUnmounted = vi.fn();

        vi.mocked(useAuth).mockReturnValue({
            isReady: true,
            retrySession: vi.fn(),
            session: { user: { id: "user-id" } },
            sessionError: null,
            logout,
        });

        function Child() {
            useEffect(() => {
                childMounted();
                return childUnmounted;
            }, []);

            return <div>event detail</div>;
        }

        render(
            <HostShell notice={{ enabled: false, message: "" }}>
                <Child />
            </HostShell>
        );

        fireEvent.click(screen.getByRole("button", { name: "logout" }));

        expect(logout).toHaveBeenCalledOnce();
        expect(childUnmounted).toHaveBeenCalledOnce();
        expect(screen.queryByText("event detail")).not.toBeInTheDocument();

        rejectLogout(new Error("logout failed"));

        await waitFor(() => {
            expect(screen.getByText("event detail")).toBeInTheDocument();
        });
        expect(childMounted).toHaveBeenCalledTimes(2);
        expect(toastError).toHaveBeenCalledOnce();
    });

    it("shows a retry action instead of redirecting after session lookup failure", () => {
        const retrySession = vi.fn();

        vi.mocked(useAuth).mockReturnValue({
            isReady: true,
            retrySession,
            session: null,
            sessionError: "ログイン状態を確認できませんでした。",
            logout: vi.fn(),
        });

        render(
            <HostShell notice={{ enabled: false, message: "" }}>
                <div>protected page</div>
            </HostShell>
        );

        expect(
            screen.getByText("ログイン状態を確認できませんでした。")
        ).toBeInTheDocument();
        expect(routerReplace).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "再試行" }));

        expect(retrySession).toHaveBeenCalledOnce();
    });
});
