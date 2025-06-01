import { EventDetail } from "@/features/event/types/event-detail";
import { auth } from "@/auth";
import { MongoRedis } from "@/lib/mongodb-redis";

const redis = MongoRedis.fromEnv();

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "認証が必要です" }, { status: 403 });
        }

        const userEventsKey = session.user.id;
        let result: EventDetail[];

        try {
            result = await redis.lrange(userEventsKey, 0, -1);
        } catch (error) {
            console.error("データ取得に失敗:", error);
            return Response.json(
                { error: "サーバーでエラーが発生しました" },
                { status: 500 }
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
