import {Redis} from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";

const redis = Redis.fromEnv();

export async function POST(
    req: Request,
    {params}: { params: { eventUuid: string } },
) {
    const {key} = (await req.json());
    const eventDetails: EventDetail[] = await redis.lrange(key, 0, -1)
    const result = eventDetails.find((it) => {
        return it.uuid == params.eventUuid
    })
    return Response.json(JSON.stringify({result}), {status: 200});
}
