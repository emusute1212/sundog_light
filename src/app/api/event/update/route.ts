import { EventDetail } from "@/features/event/types/event-detail";
import { EventUpdateRequest } from "@/features/event/types/event-update-request";
import { auth } from "@/auth";
import { MongoRedis } from "@/lib/mongodb-redis";

const redis = MongoRedis.fromEnv();

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "認証が必要です" }, { status: 403 });
        }

        let request: EventUpdateRequest;
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
        if (
            !request?.eventDetail?.uuid ||
            typeof request.eventDetail.uuid !== "string"
        ) {
            return Response.json(
                { error: "無効なイベントIDが指定されました" },
                { status: 400 }
            );
        }

        if (
            !request?.eventDetail?.name ||
            typeof request.eventDetail.name !== "string"
        ) {
            return Response.json(
                { error: "イベント名は必須です" },
                { status: 400 }
            );
        }

        if (
            !request?.eventDetail?.colors ||
            !Array.isArray(request.eventDetail.colors)
        ) {
            return Response.json(
                { error: "カラーの指定が不正です" },
                { status: 400 }
            );
        }

        if (request.eventDetail.colors.length === 0) {
            return Response.json(
                { error: "少なくとも1つのカラーを指定してください" },
                { status: 400 }
            );
        }

        if (
            !request.eventDetail.colors.every(
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

        const userEventsKey = session.user.id;
        let eventDetails: EventDetail[];

        try {
            eventDetails = await redis.lrange(userEventsKey, 0, -1);
        } catch (error) {
            console.error("データ取得に失敗:", error);
            return Response.json(
                { error: "サーバーでエラーが発生しました" },
                { status: 500 }
            );
        }

        const targetIndex = eventDetails.findIndex(
            (eventDetail) => eventDetail.uuid === request.eventDetail.uuid
        );

        if (targetIndex === -1) {
            return Response.json(
                { error: "指定されたイベントは存在しません" },
                { status: 404 }
            );
        }

        try {
            await redis.lset(
                userEventsKey,
                targetIndex,
                JSON.stringify(request.eventDetail)
            );
            return Response.json(request.eventDetail, { status: 200 });
        } catch (error) {
            console.error("データ更新に失敗:", error);
            return Response.json(
                { error: "サーバーでエラーが発生しました" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("予期せぬエラーが発生:", error);
        return Response.json(
            { error: "サーバーでエラーが発生しました" },
            { status: 500 }
        );
    }
}
