import { MongoRedis } from "@/lib/mongodb-redis";

const redis = MongoRedis.getInstance();
export const dynamic = "force-dynamic";

// 現在の色を取得するAPI（認証不要）
export async function GET(
    _: Request,
    { params }: { params: Promise<{ eventUuid: string }> }
) {
    const { eventUuid } = await params;

    try {
        // 専用コレクションから色の状態を取得
        const color = await redis.getEventColorState(eventUuid);

        return Response.json(
            {
                color: color,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return Response.json(
            { message: "Failed to get color", error: error },
            { status: 500 }
        );
    }
}
