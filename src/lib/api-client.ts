import {
    clearStoredAuthSession,
    getStoredAuthSession,
} from "@/features/auth/lib/auth-storage";

type ApiRequestOptions = {
    path: string;
    method?: "DELETE" | "GET" | "POST" | "PUT";
    body?: unknown;
    headers?: HeadersInit;
    requiresAuth?: boolean;
};

export class ApiError extends Error {
    status: number;
    statusText: string;

    constructor(message: string, status: number, statusText: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
    }
}

function getApiBaseUrl() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080")
        .replace(/\/$/, "");
}

export function getBackendOrigin() {
    return new URL(getApiBaseUrl()).origin;
}

async function getErrorMessage(response: Response) {
    const responseText = await response.text();

    if (!responseText) {
        return response.statusText || "API request failed.";
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
        return responseText;
    }

    try {
        const payload = JSON.parse(responseText) as {
            error?: string;
            message?: string;
        };

        return payload.message ?? payload.error ?? responseText;
    } catch {
        return responseText;
    }
}

export async function apiRequest<T>({
    path,
    method = "GET",
    body,
    headers: headerInit,
    requiresAuth = true,
}: ApiRequestOptions): Promise<T> {
    const headers = new Headers(headerInit);

    if (body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    if (requiresAuth) {
        const session = getStoredAuthSession();

        if (!session?.token) {
            clearStoredAuthSession();
            throw new ApiError(
                "認証情報が見つかりません。再ログインしてください。",
                401,
                "Unauthorized"
            );
        }

        headers.set("Authorization", `Bearer ${session.token}`);
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response);

        if (response.status === 401) {
            clearStoredAuthSession();
        }

        throw new ApiError(message, response.status, response.statusText);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const responseText = await response.text();

    if (!responseText) {
        return undefined as T;
    }

    return JSON.parse(responseText) as T;
}

export function getDisplayErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "予期しないエラーが発生しました。";
}
