import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAuthSession, logoutSession } from "../api/auth-client";
import {
    registerBeforeLogoutCleanup,
} from "../lib/logout-lifecycle";
import { AuthProvider, useAuth } from "./AuthProvider";

vi.mock("../api/auth-client", () => ({
    fetchAuthSession: vi.fn(),
    logoutSession: vi.fn(),
}));

function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button onClick={() => void logout()}>
            logout
        </button>
    );
}

function AuthStatus() {
    const {
        isReady,
        retrySession,
        session,
        sessionError,
    } = useAuth();

    return (
        <>
            <div>{isReady ? "ready" : "loading"}</div>
            <div>{session?.user.id ?? "no-session"}</div>
            {sessionError && <div>{sessionError}</div>}
            <button onClick={retrySession}>retry session</button>
        </>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        vi.mocked(fetchAuthSession).mockResolvedValue(null);
    });

    it("runs registered cleanup before the HTTP logout request", async () => {
        const order: string[] = [];
        const unregister = registerBeforeLogoutCleanup(() => {
            order.push("socket-disconnect");
        });
        vi.mocked(logoutSession).mockImplementation(async () => {
            order.push("http-logout");
        });

        try {
            render(
                <AuthProvider>
                    <LogoutButton />
                </AuthProvider>
            );

            fireEvent.click(screen.getByRole("button", { name: "logout" }));

            await waitFor(() => {
                expect(order).toEqual([
                    "socket-disconnect",
                    "http-logout",
                ]);
            });
        } finally {
            unregister();
        }
    });

    it("keeps a failed session lookup in a retryable error state", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        vi.mocked(fetchAuthSession)
            .mockRejectedValueOnce(new Error("backend unavailable"))
            .mockResolvedValueOnce({ user: { id: "user-id" } });

        render(
            <AuthProvider>
                <AuthStatus />
            </AuthProvider>
        );

        expect(
            await screen.findByText(
                "ログイン状態を確認できませんでした。通信状況を確認して再試行してください。"
            )
        ).toBeInTheDocument();
        expect(screen.getByText("ready")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "retry session" })
        );

        expect(await screen.findByText("user-id")).toBeInTheDocument();
        expect(fetchAuthSession).toHaveBeenCalledTimes(2);
        consoleError.mockRestore();
    });
});
