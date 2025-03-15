import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ eventUuid: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "認証が必要です" }, { status: 403 });
        }

        const eventUuid = (await params).eventUuid;
        if (!eventUuid || typeof eventUuid !== "string") {
            return Response.json(
                { error: "無効なイベントIDが指定されました" },
                { status: 400 }
            );
        }

        const userEventsKey = session.user.id;
        let eventDetails: EventDetail[];

        try {
            eventDetails = await redis.lrange(userEventsKey, 0, -1);
        } catch (error) {
            console.error("Redisからのデータ取得に失敗:", error);
            return Response.json(
                { error: "サーバーでエラーが発生しました" },
                { status: 500 }
            );
        }

        const targetEventDetail = eventDetails.find(
            (event) => event.uuid === eventUuid
        );
        if (!targetEventDetail) {
            return Response.json(
                { error: "指定されたイベントは存在しません" },
                { status: 404 }
            );
        }

        try {
            await redis.lrem(
                userEventsKey,
                1,
                JSON.stringify(targetEventDetail)
            );
            return Response.json({}, { status: 200 });
        } catch (error) {
            console.error("Redisからのデータ削除に失敗:", error);
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
