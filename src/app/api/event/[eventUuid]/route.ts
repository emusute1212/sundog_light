import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

export async function GET(
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

        if (eventDetails.length === 0) {
            return Response.json(
                { error: "指定されたイベントは存在しません" },
                { status: 404 }
            );
        }

        const result = eventDetails.find((it) => it.uuid === eventUuid);
        if (!result) {
            return Response.json(
                { error: "指定されたイベントは存在しません" },
                { status: 404 }
            );
        }

        return Response.json(JSON.stringify({ result }), { status: 200 });
    } catch (error) {
        console.error("予期せぬエラーが発生:", error);
        return Response.json(
            { error: "サーバーでエラーが発生しました" },
            { status: 500 }
        );
    }
}
