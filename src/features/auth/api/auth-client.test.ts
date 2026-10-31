import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAuthSession } from "./auth-client";

describe("fetchAuthSession cancellation", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("cancels the underlying network request with the supplied signal", async () => {
        const controller = new AbortController();
        const fetchMock = vi.fn((_url: string, options: RequestInit) => {
            return new Promise<Response>((_resolve, reject) => {
                options.signal?.addEventListener("abort", () => {
                    reject(new DOMException("Request aborted", "AbortError"));
                }, { once: true });
            });
        });
        vi.stubGlobal("fetch", fetchMock);

        const request = fetchAuthSession(controller.signal);
        const rejected = expect(request).rejects.toMatchObject({ name: "AbortError" });
        controller.abort();
        await rejected;

        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
    });
});
