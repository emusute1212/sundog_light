import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HostLoginPage from "./page";

const { scriptProps } = vi.hoisted(() => ({
    scriptProps: {
        current: null as null | {
            onError?: () => void;
            onLoad?: () => void;
        },
    },
}));

vi.mock("next/script", () => ({
    default: (props: { onError?: () => void; onLoad?: () => void }) => {
        scriptProps.current = props;
        return null;
    },
}));

vi.mock("@/features/auth/lib/post-login-redirect", () => ({
    rememberPostLoginPath: vi.fn(),
}));

describe("HostLoginPage", () => {
    beforeEach(() => {
        scriptProps.current = null;
        vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "google-client-id");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("shows a recoverable error when Google Identity Services fails to load", () => {
        render(<HostLoginPage />);

        act(() => {
            scriptProps.current?.onError?.();
        });

        expect(
            screen.getByText("Googleログインの読み込みに失敗しました。")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "再読み込み" })
        ).toBeInTheDocument();
    });

    it("shows the same error when the loaded script exposes no Google API", () => {
        render(<HostLoginPage />);

        act(() => {
            scriptProps.current?.onLoad?.();
        });

        expect(
            screen.getByText("Googleログインの読み込みに失敗しました。")
        ).toBeInTheDocument();
    });
});
