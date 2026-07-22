import { ApiError, apiRequest } from "@/lib/api-client";
import { AuthSession } from "../types/auth-session";

type UserResponse = {
    id?: string;
};

export async function fetchAuthSession(): Promise<AuthSession | null> {
    try {
        const response = await apiRequest<UserResponse>({
            path: "/api/session/me",
            requiresAuth: false,
        });

        if (!response.id) {
            throw new Error("セッションレスポンスの形式が不正です。");
        }

        return {
            user: {
                id: response.id,
            },
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return null;
        }

        throw error;
    }
}

export async function logoutSession() {
    try {
        await apiRequest<void>({
            path: "/api/session/logout",
            method: "POST",
            requiresAuth: false,
        });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return;
        }

        throw error;
    }
}
