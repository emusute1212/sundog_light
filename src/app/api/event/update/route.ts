import {Redis} from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";
import {EventUpdateRequest} from "@/features/event/types/event-update-request";

const redis = Redis.fromEnv();

export async function POST(
    req: Request,
) {
    const request: EventUpdateRequest = await req.json();
    const key = request.userId
    const events: EventDetail[] = await redis.lrange(key, 0, -1)
    const targetIndex = events
        .findIndex((it) => {
            return it.uuid == request.eventDetail.uuid
        })
    await redis.lset(key, targetIndex, JSON.stringify(request.eventDetail))
    return Response.json(request.eventDetail, {status: 200});
}
