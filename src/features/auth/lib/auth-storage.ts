import { AuthSession } from "../types/auth-session";

const AUTH_STORAGE_KEY = "sundog-light.auth-session";
const AUTH_CHANGED_EVENT = "sundog-light:auth-changed";

function notifyAuthChanged() {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getStoredAuthSession(): AuthSession | null {
    if (typeof window === "undefined") {
        return null;
    }

    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
        return null;
    }

    try {
        return JSON.parse(rawSession) as AuthSession;
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function setStoredAuthSession(session: AuthSession) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    notifyAuthChanged();
}

export function clearStoredAuthSession() {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    notifyAuthChanged();
}

export function subscribeToAuthSession(onChange: () => void) {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === AUTH_STORAGE_KEY) {
            onChange();
        }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, onChange);
    window.addEventListener("storage", handleStorage);

    return () => {
        window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
        window.removeEventListener("storage", handleStorage);
    };
}
