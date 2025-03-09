import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { EventUpdateRequest } from "@/features/event/types/event-update-request";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "認証が必要です" }, { status: 403 });
    }

    const userEventsKey = session.user.id;
    const request: EventUpdateRequest = await req.json();
    const events: EventDetail[] = await redis.lrange(userEventsKey, 0, -1);
    const targetIndex = events.findIndex((it) => {
        return it.uuid == request.eventDetail.uuid;
    });
    await redis.lset(
        userEventsKey,
        targetIndex,
        JSON.stringify(request.eventDetail)
    );
    return Response.json(request.eventDetail, { status: 200 });
}
