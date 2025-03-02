import {auth} from "@/auth";
import EventDetailPage from "@/features/event/components/detail/event-detail-page";
import crypto from "crypto-js";

export default async function EventDetailPageHost() {
    const session = await auth()
    const email = session?.user?.email
    if (email == null) {
        return (
            <div/>
        )
    }
    const userId = crypto.HmacSHA256(email, process.env.HASH_KEY!).toString()
    return (
        <EventDetailPage
            userId={userId}
        />
    );
}
