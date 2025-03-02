import {auth} from "@/auth";
import EventEditPage from "@/features/event/components/edit/event-edit-page";
import crypto from "crypto-js";

export default async function EventEditPageHost() {
    const session = await auth()
    const email = session?.user?.email
    if (email == null) {
        return (
            <div/>
        )
    }
    const userId = crypto.HmacSHA256(email, process.env.HASH_KEY!).toString()
    return (
        <EventEditPage
            userId={userId}
        />
    );
}
