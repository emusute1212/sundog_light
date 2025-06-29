import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "スマホをペンライト代わりに！「SUNDOG Light」",
    description: `
アプリ不要でスマホがペンライトの代わりになります！結婚式や学園祭イベントなど中小イベントでも使いやすく誰でも無料で使えます。
使い方は簡単！参加者はホストが作成したQRコードを読み込むだけ！これだけで、ホストは参加者のスマホ画面を任意の色に操作できます。
        `,
    openGraph: {
        type: "website",
        url: "https://sundog-light.vercel.app",
        title: "スマホをペンライト代わりに！「SUNDOG Light」",
        description: `
アプリ不要でスマホがペンライトの代わりになります！結婚式や学園祭イベントなど中小イベントでも使いやすく誰でも無料で使えます。
使い方は簡単！参加者はホストが作成したQRコードを読み込むだけ！これだけで、ホストは参加者のスマホ画面を任意の色に操作できます。
        `,
        images: [
            {
                url: "/sundog.png",
                width: 1200,
                height: 630,
                alt: "sundog light",
            },
        ],
    },
};

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="relative text-center py-24 px-4 min-h-screen flex items-center overflow-hidden">
                {/* 背景動画 */}
                <video
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/lp/background.png"
                    aria-label="SUNDOG Light デモ動画 - スマホがペンライトのように光る様子"
                >
                    <source src="/lp/top_movie.mp4" type="video/mp4" />
                    {/* フォールバック画像 */}
                    <img
                        src="/lp/background.png"
                        alt="SUNDOG Light - スマホをペンライト代わりにするサービスのデモ画面"
                        className="w-full h-full object-cover"
                    />
                </video>

                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>

                {/* コンテンツ */}
                <div className="relative z-20 w-full">
                    <div className="relative mb-6">
                        {/* アウトライン付きの背面テキスト */}
                        <h1
                            className={`w-full text-4xl md:text-6xl text-center font-extrabold p-2 text-white [-webkit-text-stroke:2px_white] drop-shadow-2xl`}
                        >
                            SUNDOG Light
                        </h1>

                        {/* グラデーションの前面テキスト */}
                        <h1
                            className={`w-full text-4xl md:text-6xl text-center font-extrabold p-2 absolute top-0 left-0 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-cyan-200`}
                        >
                            SUNDOG Light
                        </h1>
                    </div>
                    {/* SEO・アクセシビリティ用の非表示テキスト */}
                    <p className="sr-only">
                        あなたが選んだ色で、みんなのスマホが一斉に光る。
                        スマホを振って、光と歓声のウェーブをつくろう。
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/login"
                            className="bg-white text-black font-semibold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition backdrop-blur-sm"
                        >
                            今すぐ無料ではじめる
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 max-w-5xl mx-auto grid gap-16 md:grid-cols-3 text-center">
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-black">
                        🌈 あなたが選んだ色でみんなのスマホが染まる
                    </h3>
                    <p>
                        ワンタップで会場全体が一色に。リアルタイム反映で一体感アップ！
                    </p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-black">
                        📱 振れば振るほど盛り上がる
                    </h3>
                    <p>スマホを振って、光のアニメーションで一体感を演出。</p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-black">
                        💒 結婚式・ライブ・パーティーに最適
                    </h3>
                    <p>どんなイベントでもOK。簡単操作で感動の演出ができる！</p>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-sky-200 text-black py-20 px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                    使い方はカンタン、3ステップ
                </h2>
                <div className="max-w-4xl mx-auto grid gap-12 md:grid-cols-3 text-center">
                    <div>
                        <div className="text-4xl mb-4">1️⃣</div>
                        <div className="mb-6">
                            <img
                                src="/lp/detail_1.png"
                                alt="イベント作成画面のスクリーンショット"
                                className="w-full max-w-xs h-64 mx-auto rounded-lg object-contain"
                            />
                        </div>
                        <h4 className="font-bold text-xl mb-2">
                            イベントを作成
                        </h4>
                        <p>スマホで簡単にイベント作成できます。</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">2️⃣</div>
                        <div className="mb-6">
                            <img
                                src="/lp/detail_2.png"
                                alt="URLとQRコード共有画面のスクリーンショット"
                                className="w-full max-w-xs h-64 mx-auto rounded-lg object-contain"
                            />
                        </div>
                        <h4 className="font-bold text-xl mb-2">URLを共有</h4>
                        <p>参加者にリンクやQRコードで共有しましょう。</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">3️⃣</div>
                        <div className="mb-6">
                            <img
                                src="/lp/detail_3.png"
                                alt="色選択とスマホライト制御画面のスクリーンショット"
                                className="w-full max-w-xs h-64 mx-auto rounded-lg object-contain"
                            />
                        </div>
                        <h4 className="font-bold text-xl mb-2">
                            色を選ぶだけ！
                        </h4>
                        <p>
                            選んだ色が、全員のスマホにリアルタイムで反映されます！
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6 text-center bg-sky-200">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
                    色のチカラで、あなたのイベントを特別に。
                </h2>
                <p className="mb-10 text-lg">
                    今すぐ始めて、一体感と感動を演出しよう！
                </p>
                <Link
                    href="/login"
                    className="bg-black text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition"
                >
                    今すぐ無料ではじめる
                </Link>
            </section>

            {/* Footer */}
            <footer className="py-10 text-center text-sm text-gray-500 bg-white">
                © 2025 SUNDOG Light. All rights reserved.
            </footer>
        </main>
    );
}
