import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "認証が必要です" }, { status: 403 });
    }

    const userEventsKey = session.user.id;
    const result: EventDetail[] = await redis.lrange(userEventsKey, 0, -1);

    return Response.json(JSON.stringify({ result }), { status: 200 });
}
