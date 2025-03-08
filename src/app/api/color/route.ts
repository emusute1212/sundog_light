import { getPusherInstance } from "@/libs/pusher/server";
import {EventObservableColor} from "@/features/event/types/event-observable-color";
import {EventSendableColor} from "@/features/event/types/event-sendable-color";

const pusherServer = getPusherInstance();
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const eventSendableColor: EventSendableColor = await req.json()
    try {
        await pusherServer.trigger(`selected-color-channel-${eventSendableColor.uuid}`, "evt::color", {
            color: eventSendableColor.color,
        } as EventObservableColor);

        return Response.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json(
            { message: "Failed to sockets", error: error },
            { status: 500 }
        );
    }
}