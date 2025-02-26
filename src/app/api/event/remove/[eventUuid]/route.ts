import {Redis} from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";

const redis = Redis.fromEnv();

export async function POST(
    req: Request,
    {params}: { params: Promise<{ eventUuid: string }> },
) {
    const {key} = (await req.json());
    const eventUuid = (await params).eventUuid
    const eventDetails: EventDetail[] = await redis.lrange(key, 0, -1)
    const targetEventDetail = eventDetails.find((it) => it.uuid == eventUuid)
    await redis.lrem(key, 1, targetEventDetail)
    return Response.json(JSON.stringify({}), {status: 200});
}
