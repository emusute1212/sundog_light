import { redirectOnMaintenanceResponse } from "@/lib/maintenance-client";

type ApiRequestOptions = {
    path: string;
    method?: "DELETE" | "GET" | "POST" | "PUT";
    body?: unknown;
    headers?: HeadersInit;
    requiresAuth?: boolean;
};

type CsrfTokenResponse = {
    headerName?: string;
    cookieName?: string;
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
    if (typeof window !== "undefined") {
        return "";
    }

    return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080")
        .replace(/\/$/, "");
}

function redirectToLogin() {
    if (
        typeof window === "undefined" ||
        window.location.pathname === "/login"
    ) {
        return;
    }

    const callbackUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams({ callbackUrl });

    window.location.replace(`/login?${params.toString()}`);
}

function getCookieValue(name: string) {
    if (typeof document === "undefined") {
        return null;
    }

    const prefix = `${name}=`;
    const cookie = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(prefix));

    if (!cookie) {
        return null;
    }

    const value = cookie.slice(prefix.length);

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

async function setCsrfHeader(headers: Headers) {
    const contract = await apiRequest<CsrfTokenResponse>({
        path: "/api/session/csrf",
        requiresAuth: false,
    });

    if (!contract.headerName || !contract.cookieName) {
        throw new Error("CSRFトークン情報の形式が不正です。");
    }

    const token = getCookieValue(contract.cookieName);

    if (!token) {
        throw new Error("CSRFトークンを取得できませんでした。");
    }

    headers.set(contract.headerName, token);
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

    if (method !== "GET") {
        await setCsrfHeader(headers);
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
        method,
        headers,
        credentials: "include",
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (redirectOnMaintenanceResponse(response)) {
        throw new ApiError(
            "メンテナンス中です。",
            response.status,
            response.statusText
        );
    }

    if (!response.ok) {
        const message = await getErrorMessage(response);

        if (response.status === 401 && requiresAuth) {
            redirectToLogin();
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
