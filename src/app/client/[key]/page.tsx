"use client";
import { useEffect, useState } from "react";
import { pusherClient } from "@/libs/pusher/client";
import { EventObservableColor } from "@/features/event/types/event-observable-color";
import { useParams } from "next/navigation";
import { event as gtagEvent } from "@/libs/gtag";

export default function Client() {
    const params = useParams();
    const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 接続時に現在の色を取得
        const fetchCurrentColor = async () => {
            try {
                const response = await fetch(`/api/event/${params.key}/color`);
                if (response.ok) {
                    const data = await response.json();
                    setBackgroundColor(data.color);

                    // GAイベント送信：クライアント接続
                    gtagEvent({
                        action: "client_connect",
                        category: "client_engagement",
                        label: params.key as string,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch current color:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentColor();

        // Pusherで色の変更を監視
        const channel = pusherClient
            .subscribe(`selected-color-channel-${params.key}`)
            .bind("evt::color", (data: EventObservableColor) => {
                setBackgroundColor(() => data.color);

                // GAイベント送信：色変更受信
                gtagEvent({
                    action: "color_received",
                    category: "client_engagement",
                    label: params.key as string,
                });
            });

        return () => {
            channel.unbind();
        };
    }, [params.key]);

    // ローディング中
    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-600">接続中...</div>
            </div>
        );
    }

    // 色が選択されていない場合
    if (backgroundColor === null) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center p-8">
                    <div className="text-2xl font-bold text-gray-700 mb-2">
                        色が選択されていません
                    </div>
                    <div className="text-gray-600">
                        主催者が色を選択するまでお待ちください
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`w-full h-screen`}
            style={{ backgroundColor: `${backgroundColor}` }}
        />
    );
}
