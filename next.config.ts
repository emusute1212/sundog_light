import type { NextConfig } from "next";
import { resolveLegacyHosts, resolveSiteUrl } from "./src/lib/site";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createLegacyRedirects(
    canonicalOrigin: string,
    legacyHosts: string[]
) {
    const canonicalHostname = new URL(canonicalOrigin).hostname.toLowerCase();

    return legacyHosts
        .filter((host) => host !== canonicalHostname)
        .map((host) => ({
            source: "/:path*",
            has: [
                {
                    type: "host" as const,
                    value: escapeRegex(host),
                },
            ],
            destination: `${canonicalOrigin}/:path*`,
            permanent: true,
        }));
}

const nextConfig: NextConfig = {
    async redirects() {
        const canonicalOrigin = resolveSiteUrl();

        return createLegacyRedirects(canonicalOrigin, resolveLegacyHosts());
    },
    async rewrites() {
        const backendBaseUrl = (
            process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
        ).replace(/\/$/, "");

        return [
            {
                source: "/login/google",
                destination: `${backendBaseUrl}/login/google`,
            },
            {
                source: "/ws",
                destination: `${backendBaseUrl}/ws`,
            },
            {
                source: "/api/:path*",
                destination: `${backendBaseUrl}/api/:path*`,
            },
            {
                source: "/ws/:path*",
                destination: `${backendBaseUrl}/ws/:path*`,
            },
        ];
    },
};

export default nextConfig;
