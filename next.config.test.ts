import { describe, expect, it } from "vitest";
import { createLegacyRedirects } from "./next.config";

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
