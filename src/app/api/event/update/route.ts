import {Redis} from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";
import {EventUpdateRequest} from "@/features/event/types/event-update-request";

const redis = Redis.fromEnv();

export async function POST(
    req: Request,
) {
    const request: EventUpdateRequest = await req.json();
    const list = await redis.json.get(request.userId);

    if (!Array.isArray(list)) return false;

    const updatedList: EventDetail[] = list.map(it => {
            const eventDetail = it as EventDetail
            return eventDetail.uuid === request.event.uuid ? request.event : eventDetail
        }
    );

    await redis.json.set(request.userId, "$", updatedList);
    return Response.json(request.event, {status: 200});
}
