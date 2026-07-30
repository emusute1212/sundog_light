import type { NextConfig } from "next";
import { resolveLegacyHosts, resolveSiteUrl } from "./src/lib/site";

const LOCAL_BACKEND_BASE_URL = "http://localhost:8080";

type BackendEnvironment = {
    NEXT_PUBLIC_API_BASE_URL?: string;
    NODE_ENV?: string;
};

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function resolveBackendBaseUrl(
    environment: BackendEnvironment = {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
    }
) {
    const configuredBaseUrl = environment.NEXT_PUBLIC_API_BASE_URL?.trim();

    if (configuredBaseUrl) {
        return configuredBaseUrl.replace(/\/$/, "");
    }

    if (environment.NODE_ENV === "production") {
        throw new Error(
            "NEXT_PUBLIC_API_BASE_URL must be set for production builds."
        );
    }

    return LOCAL_BACKEND_BASE_URL;
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
        const backendBaseUrl = resolveBackendBaseUrl();

        return [
            {
                source: "/login/google",
                destination: `${backendBaseUrl}/login/google`,
            },
            {
                source: "/api/:path*",
                destination: `${backendBaseUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
