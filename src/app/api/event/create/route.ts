import {Redis} from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";
import {randomUUID} from "crypto";
import {EventCreateRequest} from "@/features/event/types/event-create-request";

const redis = Redis.fromEnv();

// ヘルパー関数として内部で定義
function createEventDetail(
    name: string,
    colors: string[],
): EventDetail {
    return {
        name: name,
        colors: colors,
        uuid: randomUUID(),
    }
}

export async function POST(
    req: Request,
) {
    const request: EventCreateRequest = await req.json();
    const eventDetail = createEventDetail(request.event.name, request.event.colors)
    await redis.lpush(request.userId, JSON.stringify(eventDetail))
    return Response.json(JSON.stringify({uuid: eventDetail.uuid}), {status: 200});
}
