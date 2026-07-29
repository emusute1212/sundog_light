import { beforeEach, describe, expect, it } from "vitest";
import {
    consumePostLoginPath,
    rememberPostLoginPath,
} from "./post-login-redirect";

describe("post-login redirect", () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it("preserves a same-origin path including query and hash", () => {
        rememberPostLoginPath("/event/detail/event-id?source=login#controls");

        expect(consumePostLoginPath()).toBe(
            "/event/detail/event-id?source=login#controls"
        );
    });

    it.each([
        "https://evil.example/steal",
        "//evil.example/steal",
        "/\\evil.example/steal",
        "/login",
    ])("falls back for an unsafe callback: %s", (candidate) => {
        rememberPostLoginPath(candidate);

        expect(consumePostLoginPath()).toBe("/event/list");
    });

    it("falls back after the stored path has already been consumed", () => {
        rememberPostLoginPath("/event/create");

        expect(consumePostLoginPath()).toBe("/event/create");
        expect(consumePostLoginPath()).toBe("/event/list");
    });
});
