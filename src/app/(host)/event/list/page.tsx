import {auth} from "@/auth";
import EventListPage from "@/features/event/components/list/EventListPage";
import crypto from "crypto-js";

export default async function EventListPageHost() {
    const session = await auth()
    const email = session?.user?.email
    if (email == null) {
        return (
            <div/>
        )
    }
    const userId = crypto.HmacSHA256(email, process.env.HASH_KEY!).toString()
    return (
        <EventListPage
            userId={userId}
        />
    );
}