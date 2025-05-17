import { EventDetail } from "@/features/event/types/event-detail";
import { randomUUID } from "crypto";
import { EventCreateRequest } from "@/features/event/types/event-create-request";
import { auth } from "@/auth";
import { MongoRedis } from "@/lib/mongodb-redis";

const redis = MongoRedis.fromEnv();

// ヘルパー関数として内部で定義
function createEventDetail(name: string, colors: string[]): EventDetail {
    return {
        name: name,
        colors: colors,
        uuid: randomUUID(),
    };
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "認証が必要です" }, { status: 403 });
        }

        let request: EventCreateRequest;
        try {
            request = await req.json();
        } catch (error) {
            console.error("リクエストのパースに失敗:", error);
            return Response.json(
                { error: "無効なリクエスト形式です" },
                { status: 400 }
            );
        }

        // リクエストのバリデーション
        if (!request?.event?.name || typeof request.event.name !== "string") {
            return Response.json(
                { error: "イベント名は必須です" },
                { status: 400 }
            );
        }

        if (!request?.event?.colors || !Array.isArray(request.event.colors)) {
            return Response.json(
                { error: "カラーの指定が不正です" },
                { status: 400 }
            );
        }

        if (request.event.colors.length === 0) {
            return Response.json(
                { error: "少なくとも1つのカラーを指定してください" },
                { status: 400 }
            );
        }

        if (
            !request.event.colors.every(
                (color) =>
                    typeof color === "string" &&
                    color.match(/^#[0-9A-Fa-f]{6}$/)
            )
        ) {
            return Response.json(
                { error: "無効なカラーコードが含まれています" },
                { status: 400 }
            );
        }

        const eventDetail = createEventDetail(
            request.event.name,
            request.event.colors
        );

        try {
            const userEventsKey = session.user.id;
            await redis.lpush(userEventsKey, JSON.stringify(eventDetail));
        } catch (error) {
            console.error("データ保存に失敗:", error);
            return Response.json(
                { error: "サーバーでエラーが発生しました" },
                { status: 500 }
            );
        }

        return Response.json({ uuid: eventDetail.uuid }, { status: 201 });
    } catch (error) {
        console.error("予期せぬエラーが発生:", error);
        return Response.json(
            { error: "サーバーでエラーが発生しました" },
            { status: 500 }
        );
    }
}
