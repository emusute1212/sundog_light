"use client";
import {useEffect, useState} from "react";
import {pusherClient} from "@/libs/pusher/client";
import {EventObservableColor} from "@/features/event/types/event-observable-color";
import {useParams} from "next/navigation";

export default function Client() {
    const params = useParams()
    const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF")
    useEffect(() => {
        const channel = pusherClient
            .subscribe(`selected-color-channel-${params.key}`)
            .bind("evt::color", (data: EventObservableColor) => {
                setBackgroundColor(() => data.color);
            });

        return () => {
            channel.unbind();
        };
    }, [params.key]);
    return (
        <div
            className={`w-full h-screen`}
            style={{backgroundColor: `${backgroundColor}`}}
        />
    );
}
