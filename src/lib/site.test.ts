import { describe, expect, it } from "vitest";
import { resolveLegacyHosts, resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
    it("uses the configured canonical origin", () => {
        expect(
            resolveSiteUrl({
                APP_PUBLIC_ORIGIN: "https://app.light.example.com/",
                NODE_ENV: "production",
            })
        ).toBe("https://app.light.example.com");
    });

    it("falls back to localhost outside a configured deployment", () => {
        expect(resolveSiteUrl({ NODE_ENV: "development" })).toBe(
            "http://localhost:3000"
        );
    });

    it("requires an explicit canonical origin for production", () => {
        expect(() => resolveSiteUrl({ NODE_ENV: "production" })).toThrow(
            "APP_PUBLIC_ORIGIN"
        );
    });

    it.each([
        "https://example.com/path",
        "https://example.com?query=1",
        "https://user@example.com",
        "javascript:alert(1)",
    ])("rejects a value that is not an origin: %s", (value) => {
        expect(() =>
            resolveSiteUrl({
                APP_PUBLIC_ORIGIN: value,
            })
        ).toThrow("APP_PUBLIC_ORIGIN");
    });
});

describe("resolveLegacyHosts", () => {
    it("normalizes and deduplicates configured hostnames", () => {
        expect(
            resolveLegacyHosts(
                "OLD.EXAMPLE.COM, app.example.com, old.example.com"
            )
        ).toEqual(["old.example.com", "app.example.com"]);
    });

    it("returns no redirects when the setting is empty", () => {
        expect(resolveLegacyHosts("")).toEqual([]);
    });

    it.each([
        "https://old.example.com",
        "old.example.com/path",
        "old.example.com:8443",
        ".*",
        "-old.example.com",
        "old..example.com",
    ])("rejects a value that is not a hostname: %s", (value) => {
        expect(() => resolveLegacyHosts(value)).toThrow("APP_LEGACY_HOSTS");
    });
});
