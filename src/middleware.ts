import { auth } from "@/auth";
import {
    getMaintenanceMessage,
    isMaintenanceModeEnabled,
    MAINTENANCE_RETRY_AFTER_SECONDS,
} from "@/lib/maintenance";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function buildMaintenanceHeaders() {
    return {
        "Cache-Control": "no-store",
        "Retry-After": MAINTENANCE_RETRY_AFTER_SECONDS.toString(),
        "X-Maintenance-Mode": "true",
    };
}

function maintenanceResponse(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
            {
                error: "メンテナンス中です",
                message: getMaintenanceMessage(),
            },
            {
                status: 503,
                headers: buildMaintenanceHeaders(),
            }
        );
    }

    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";

    const response = NextResponse.redirect(url);
    for (const [key, value] of Object.entries(buildMaintenanceHeaders())) {
        response.headers.set(key, value);
    }
    return response;
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (isMaintenanceModeEnabled()) {
        return maintenanceResponse(request);
    }

    // /api/auth/* へのリクエストは認証チェックをスキップ
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // /api/event/*/color へのリクエストは認証チェックをスキップ（クライアント用）
    if (pathname.match(/^\/api\/event\/[^\/]+\/color$/)) {
        return NextResponse.next();
    }

    // /client/* は参加者用の公開ページなので通常時は認証チェックをスキップ
    if (pathname === "/client" || pathname.startsWith("/client/")) {
        return NextResponse.next();
    }

    const session = await auth();

    // APIリクエスト（サーバー向け）の処理
    if (pathname.startsWith("/api/")) {
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
    if (pathname === "/login") {
        return NextResponse.next();
    }

    // 未認証の場合はログインページにリダイレクト
    if (!session) {
        const url = new URL("/login", request.url);
        url.searchParams.set("callbackUrl", pathname);
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
        "/client/:path*",
        // ログインページ
        "/login",
    ],
};
