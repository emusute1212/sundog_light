import {auth} from "@/auth";
import EventCreatePage from "@/features/event/components/create/EventCreatePage";
import crypto from 'crypto-js';

export default async function EventCreatePageHost() {
    const session = await auth()
    const email = session?.user?.email
    if (email == null) {
        return (
            <div/>
        )
    }
    const userId = crypto.HmacSHA256(email, process.env.HASH_KEY!).toString()
    return (
        <EventCreatePage
            userId={userId}
        />
    );
}