import { apiRequest } from "@/lib/api-client";
import { AuthSession } from "../types/auth-session";

type AuthResponse = {
    token?: string;
    user?: {
        id?: string;
    };
};

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>({
        path: "/api/auth/google",
        method: "POST",
        body: {
            idToken,
        },
        requiresAuth: false,
    });

    if (!response.token || !response.user?.id) {
        throw new Error("ログインレスポンスの形式が不正です。");
    }

    return {
        token: response.token,
        user: {
            id: response.user.id,
        },
    };
}
