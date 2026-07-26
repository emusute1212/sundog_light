const LOCAL_SITE_ORIGIN = "http://localhost:3000";

type SiteEnvironment = {
    APP_PUBLIC_ORIGIN?: string;
    NODE_ENV?: string;
};

const HOSTNAME_PATTERN =
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function normalizeOrigin(value: string, sourceName: string) {
    let url: URL;

    try {
        url = new URL(value);
    } catch {
        throw new Error(`${sourceName} must be an absolute HTTP(S) origin.`);
    }

    if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
    ) {
        throw new Error(`${sourceName} must contain only scheme, host, and port.`);
    }

    return url.origin;
}

export function resolveSiteUrl(
    environment: SiteEnvironment = {
        APP_PUBLIC_ORIGIN: process.env.APP_PUBLIC_ORIGIN,
        NODE_ENV: process.env.NODE_ENV,
    }
) {
    const configuredOrigin = environment.APP_PUBLIC_ORIGIN?.trim();

    if (configuredOrigin) {
        return normalizeOrigin(configuredOrigin, "APP_PUBLIC_ORIGIN");
    }

    if (environment.NODE_ENV === "production") {
        throw new Error(
            "APP_PUBLIC_ORIGIN must be set for production builds."
        );
    }

    return LOCAL_SITE_ORIGIN;
}

export function resolveLegacyHosts(value = process.env.APP_LEGACY_HOSTS) {
    if (!value?.trim()) {
        return [];
    }

    return Array.from(
        new Set(
            value
                .split(",")
                .map((host) => host.trim().toLowerCase())
                .filter(Boolean)
        )
    ).map((host) => {
        if (!HOSTNAME_PATTERN.test(host)) {
            throw new Error(
                "APP_LEGACY_HOSTS must be a comma-separated list of hostnames."
            );
        }

        return host;
    });
}

export const SITE_URL = resolveSiteUrl();
