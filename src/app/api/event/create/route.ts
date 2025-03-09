import { Redis } from "@upstash/redis";
import { EventDetail } from "@/features/event/types/event-detail";
import { randomUUID } from "crypto";
import { EventCreateRequest } from "@/features/event/types/event-create-request";
import { auth } from "@/auth";

const redis = Redis.fromEnv();

// ヘルパー関数として内部で定義
function createEventDetail(name: string, colors: string[]): EventDetail {
    return {
        name: name,
        colors: colors,
        uuid: randomUUID(),
    };
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "認証が必要です" }, { status: 403 });
    }

    const request: EventCreateRequest = await req.json();
    const eventDetail = createEventDetail(
        request.event.name,
        request.event.colors
    );

    const userEventsKey = session.user.id;
    await redis.lpush(userEventsKey, JSON.stringify(eventDetail));

    return Response.json({ uuid: eventDetail.uuid }, { status: 200 });
}
