import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ eventUuid: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "認証が必要です" }, { status: 403 });
    }

    const userEventsKey = session.user.id;
    const eventUuid = (await params).eventUuid;
    const eventDetails: EventDetail[] = await redis.lrange(
        userEventsKey,
        0,
        -1
    );
    const targetEventDetail = eventDetails.find((it) => it.uuid == eventUuid);
    await redis.lrem(userEventsKey, 1, targetEventDetail);
    return Response.json(JSON.stringify({}), { status: 200 });
}
