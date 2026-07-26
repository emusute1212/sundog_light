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
});
