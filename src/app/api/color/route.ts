import { getPusherInstance } from "@/libs/pusher/server";
import { EventObservableColor } from "@/features/event/types/event-observable-color";
import { EventSendableColor } from "@/features/event/types/event-sendable-color";
import { MongoRedis } from "@/lib/mongodb-redis";
import { auth } from "@/auth";
import { EventDetail } from "@/features/event/types/event-detail";
import { NextRequest } from "next/server";

const pusherServer = getPusherInstance();
const redis = MongoRedis.getInstance();
export const dynamic = "force-dynamic";

// 現在の色を取得するAPI
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const eventUuid = searchParams.get("uuid");

    if (!eventUuid) {
        return Response.json(
            { error: "イベントUUIDが必要です" },
            { status: 400 }
        );
    }

    try {
        const session = await auth();

        // クライアント側からもアクセス可能にするため、認証は必須ではない
        // ただし、イベントの所有者チェックは行わない

        // すべてのユーザーのイベントから該当するものを探す
        // 本来はイベントごとにデータを保存する方が効率的だが、現在の構造に合わせる

        // 認証済みユーザーのイベントをチェック
        if (session?.user?.id) {
            const userEventsKey = session.user.id;
            const events = await redis.lrange<EventDetail>(
                userEventsKey,
                0,
                -1
            );
            const event = events.find((e) => e.uuid === eventUuid);

            if (event) {
                return Response.json(
                    {
                        color: event.lastSelectedColor || null,
                    },
                    { status: 200 }
                );
            }
        }

        // イベントが見つからない場合は、色なしとして返す
        return Response.json(
            {
                color: null,
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

export async function POST(req: Request) {
    const eventSendableColor: EventSendableColor = await req.json();

    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "認証が必要です" }, { status: 403 });
        }

        // 現在のイベント情報を取得
        const userEventsKey = session.user.id;
        const events = await redis.lrange<EventDetail>(userEventsKey, 0, -1);
        const eventIndex = events.findIndex(
            (e) => e.uuid === eventSendableColor.uuid
        );

        if (eventIndex === -1) {
            return Response.json(
                { error: "イベントが見つかりません" },
                { status: 404 }
            );
        }

        const event = events[eventIndex];

        // 現在の色の状態を取得
        const currentColor = await redis.getEventColorState(
            eventSendableColor.uuid
        );

        // トグル機能: 同じ色が選択されている場合はnullに
        let colorToSend = eventSendableColor.color;
        if (currentColor === eventSendableColor.color) {
            colorToSend = null;
        }

        // 色の状態を更新（専用コレクションに保存）
        await redis.setEventColorState(
            eventSendableColor.uuid,
            colorToSend,
            session.user.id
        );

        // イベント情報も更新（互換性のため）
        event.lastSelectedColor = colorToSend;
        await redis.lset(userEventsKey, eventIndex, JSON.stringify(event));

        // Pusherで色の変更を通知
        await pusherServer.trigger(
            `selected-color-channel-${eventSendableColor.uuid}`,
            "evt::color",
            {
                color: colorToSend,
            } as EventObservableColor
        );

        return Response.json(
            {
                message: "Success",
                selectedColor: colorToSend,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return Response.json(
            { message: "Failed to update color", error: error },
            { status: 500 }
        );
    }
}
