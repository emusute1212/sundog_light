const DEFAULT_POST_LOGIN_PATH = "/event/list";
const POST_LOGIN_PATH_KEY = "sundog-light.post-login-path";
const VALIDATION_ORIGIN = "https://app.sundog-org.com";

function normalizePostLoginPath(candidate: string | null) {
    if (!candidate?.startsWith("/") || candidate.startsWith("//")) {
        return DEFAULT_POST_LOGIN_PATH;
    }

    try {
        const url = new URL(candidate, VALIDATION_ORIGIN);

        if (
            url.origin !== VALIDATION_ORIGIN ||
            url.pathname === "/login"
        ) {
            return DEFAULT_POST_LOGIN_PATH;
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return DEFAULT_POST_LOGIN_PATH;
    }
}

export function rememberPostLoginPath(candidate: string | null) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.sessionStorage.setItem(
            POST_LOGIN_PATH_KEY,
            normalizePostLoginPath(candidate)
        );
    } catch {
        // Login still succeeds; the server fallback is /event/list.
    }
}

export function consumePostLoginPath() {
    if (typeof window === "undefined") {
        return DEFAULT_POST_LOGIN_PATH;
    }

    try {
        const storedPath = window.sessionStorage.getItem(POST_LOGIN_PATH_KEY);
        window.sessionStorage.removeItem(POST_LOGIN_PATH_KEY);

        return normalizePostLoginPath(storedPath);
    } catch {
        return DEFAULT_POST_LOGIN_PATH;
    }
}
