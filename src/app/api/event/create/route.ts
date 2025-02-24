import {Redis} from "@upstash/redis"
import {EventCreateRequest} from "@/features/event/types/event-create-request";
import {EventDetail} from "@/features/event/types/event-detail";
import {randomUUID} from "crypto";

const redis = Redis.fromEnv();

export async function POST(
    req: Request,
) {
    const request: EventCreateRequest = await req.json();
    const eventDetail = createEventDetail(request.event.name, request.event.colors)
    await redis.lpush(request.userId, JSON.stringify(eventDetail))
    return Response.json(JSON.stringify({uuid: eventDetail.uuid}), {status: 200});
}

export function createEventDetail(
    name: string,
    colors: string[],
): EventDetail {
    return {
        name: name,
        colors: colors,
        uuid: randomUUID(),
    }
}
