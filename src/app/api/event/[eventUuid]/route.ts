import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

export async function GET(
    _: Request,
    { params }: { params: Promise<{ eventUuid: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "認証が必要です" }, { status: 403 });
    }

    const userEventsKey = session.user.id;
    const eventDetails: EventDetail[] = await redis.lrange(
        userEventsKey,
        0,
        -1
    );

    console.log(params);
    console.log(await params);
    const eventUuid = (await params).eventUuid;
    const result = eventDetails.find((it) => {
        return it.uuid == eventUuid;
    });
    return Response.json(JSON.stringify({ result }), { status: 200 });
}
