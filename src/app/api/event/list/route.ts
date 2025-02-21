import { Redis } from "@upstash/redis"
import {EventDetail} from "@/features/event/types/event-detail";

const redis = Redis.fromEnv();

export async function POST(req: Request)  {
    const { key } = (await req.json());
    const result = await Promise.all([...new Array(await redis.llen(key)).keys()].map(async (it) => {
        return await redis.lindex(key, it) as EventDetail
    }));
    return Response.json(JSON.stringify({ result }), { status: 200 });
}
