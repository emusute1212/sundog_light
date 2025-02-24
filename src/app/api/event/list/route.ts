import { Redis } from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";

const redis = Redis.fromEnv();

export async function POST(req: Request)  {
    const { key } = (await req.json());
    const result: EventDetail[] = await redis.lrange(key, 0, -1);
    return Response.json(JSON.stringify({ result }), { status: 200 });
}
