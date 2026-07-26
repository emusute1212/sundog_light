const DEFAULT_POST_LOGIN_PATH = "/event/list";
const POST_LOGIN_PATH_KEY = "sundog-light.post-login-path";

function normalizePostLoginPath(candidate: string | null, currentOrigin: string) {
    if (!candidate?.startsWith("/") || candidate.startsWith("//")) {
        return DEFAULT_POST_LOGIN_PATH;
    }

    try {
        const url = new URL(candidate, currentOrigin);

        if (
            url.origin !== currentOrigin ||
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
            normalizePostLoginPath(candidate, window.location.origin)
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

        return normalizePostLoginPath(storedPath, window.location.origin);
    } catch {
        return DEFAULT_POST_LOGIN_PATH;
    }
}
