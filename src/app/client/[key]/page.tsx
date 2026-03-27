"use client";
import { buildClientPageUrl } from "@/features/event/api/event-client";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ClientRedirectPage() {
    const params = useParams();
    const eventId = params.key as string;

    useEffect(() => {
        window.location.replace(buildClientPageUrl(eventId));
    }, [eventId]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="text-gray-600">クライアントページへ移動しています...</div>
        </div>
    );
}
