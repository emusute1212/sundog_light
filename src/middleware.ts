import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // /api/auth/* へのリクエストは認証チェックをスキップ
    if (request.nextUrl.pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const session = await auth();

    // APIリクエスト（サーバー向け）の処理
    if (request.nextUrl.pathname.startsWith("/api/")) {
        if (!session) {
            return new NextResponse(
                JSON.stringify({ error: "認証が必要です" }),
                {
                    status: 403,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
        return NextResponse.next();
    }

    // クライアント向けページの処理
    // ログインページはスキップ
    if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
    }

    // 未認証の場合はログインページにリダイレクト
    if (!session) {
        const url = new URL("/login", request.url);
        url.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
    matcher: [
        // APIルート
        "/api/event/:path*",
        "/api/color/:path*",
        "/api/pusher/:path*",
        // クライアントページ
        "/event/:path*",
        // ログインページ
        "/login",
    ],
};
