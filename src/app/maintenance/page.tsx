import { getMaintenanceStatus } from "@/lib/maintenance";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "メンテナンス中 | SUNDOG Light",
    description: "SUNDOG Lightは現在メンテナンス中です。",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function MaintenancePage() {
    const { maintenanceStatus } = await getMaintenanceStatus();

    if (!maintenanceStatus.enabled) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-white text-black font-sans">
            <header className="sticky top-0 w-full bg-white pb-4">
                <div className="relative flex items-center justify-between px-4">
                    <div className="w-20" />
                    <div className="relative select-none">
                        <h1 className="p-2 text-center text-4xl font-extrabold text-black [-webkit-text-stroke:2px_black]">
                            SUNDOG Light
                        </h1>
                        <h1 className="absolute left-0 top-0 bg-gradient-to-r from-gray-200 to-cyan-200 bg-clip-text p-2 text-center text-4xl font-extrabold text-transparent">
                            SUNDOG Light
                        </h1>
                    </div>
                    <div className="w-20" />
                </div>
            </header>

            <main className="flex w-full max-w-lg flex-grow flex-col items-center justify-center px-6 pb-16 text-center">
                <h2 className="text-3xl font-bold leading-tight">
                    ただいまメンテナンス中です
                </h2>
                <p className="mt-6 text-base leading-8 text-gray-700">
                    {maintenanceStatus.message}
                </p>
                <p className="mt-4 text-sm leading-7 text-gray-500">
                    作業中はイベントの作成、編集、色の変更、参加者画面への接続を一時停止しています。
                </p>

                <a
                    href="/maintenance"
                    className="mt-10 inline-flex rounded-2xl bg-black px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
                >
                    状態を確認する
                </a>
            </main>
        </div>
    );
}
