import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // /api/auth/* へのリクエストは認証チェックをスキップ
    if (request.nextUrl.pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // APIリクエストの場合のみチェック
    if (request.nextUrl.pathname.startsWith("/api/")) {
        const session = await auth();

        // 未認証の場合は403を返す
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
    }

    return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
    matcher: ["/api/event/:path*", "/api/color/:path*", "/api/pusher/:path*"],
};
