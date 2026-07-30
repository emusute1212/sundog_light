import { describe, expect, it } from "vitest";
import {
    createBackendRewrites,
    createLegacyRedirects,
    resolveBackendBaseUrl,
} from "./next.config";

describe("resolveBackendBaseUrl", () => {
    it("requires an explicit backend URL in production", () => {
        expect(() =>
            resolveBackendBaseUrl({
                NEXT_PUBLIC_API_BASE_URL: " ",
                NODE_ENV: "production",
            })
        ).toThrow(
            "NEXT_PUBLIC_API_BASE_URL must be set for production builds."
        );
    });

    it("uses localhost only outside production and removes a trailing slash", () => {
        expect(resolveBackendBaseUrl({ NODE_ENV: "development" })).toBe(
            "http://localhost:8080"
        );
        expect(
            resolveBackendBaseUrl({
                NEXT_PUBLIC_API_BASE_URL: "https://api.example.com/",
                NODE_ENV: "production",
            })
        ).toBe("https://api.example.com");
    });
});

describe("createBackendRewrites", () => {
    it("proxies WebSocket requests only when using the local backend", () => {
        expect(
            createBackendRewrites({ NODE_ENV: "development" })
        ).toContainEqual({
            source: "/ws/:path*",
            destination: "http://localhost:8080/ws/:path*",
        });

        expect(
            createBackendRewrites({
                NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
                NODE_ENV: "production",
            })
        ).not.toContainEqual(
            expect.objectContaining({
                source: expect.stringMatching(/^\/ws/),
            })
        );
    });
});

describe("createLegacyRedirects", () => {
    it("escapes hostnames before using them as host matchers", () => {
        const [redirect] = createLegacyRedirects(
            "https://app.light.example.com",
            ["old.example.com"]
        );
        const hostMatcher = new RegExp(`^(?:${redirect.has[0].value})$`);

        expect(hostMatcher.test("old.example.com")).toBe(true);
        expect(hostMatcher.test("oldXexampleYcom")).toBe(false);
        expect(redirect.destination).toBe(
            "https://app.light.example.com/:path*"
        );
    });

    it("does not redirect the canonical hostname even when its origin has a port", () => {
        expect(
            createLegacyRedirects("http://localhost:3000", [
                "localhost",
                "old.example.com",
            ])
        ).toHaveLength(1);
    });
});
