import Link from "next/link";
import type {Metadata} from 'next'

export const metadata: Metadata = {
    title: "SUNDOG Light | 色を使ってイベントを盛り上げよう",
    description: "ホストが色を変更すると、参加者の画面の色がリアルタイムで変わるイベントアプリ",
    openGraph: {
        type: "website",
        url: "https://sundog-light.vercel.app",
        title: "イベント盛り上げアプリ",
        description: "ホストが色を変更すると、参加者の画面の色がリアルタイムで変わるイベントアプリ",
        images: [
            {
                url: "/sundog.png",
                width: 1200,
                height: 630,
                alt: "sundog light",
            },
        ],
    }
};

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="text-center py-24 px-4 bg-sky-200">
                <div
                    className="relative mb-6"
                >
                    {/* アウトライン付きの背面テキスト */}
                    <h1
                        className={`w-full text-4xl md:text-6xl text-center font-extrabold p-2 text-black [-webkit-text-stroke:2px_black] drop-shadow-lg`}
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
                <p className="text-xl md:text-2xl mb-10">
                    主催者が選んだ色で、参加者のスマホが一斉に光る。
                    <br/>
                    スマホを振って、光と歓声のウェーブをつくろう。
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/login"
                        className="bg-black text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition">
                        今すぐはじめる
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 max-w-5xl mx-auto grid gap-16 md:grid-cols-3 text-center">
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-black">🌈 主催者が選んだ色でスマホが染まる</h3>
                    <p>ワンタップで会場全体が一色に。リアルタイム反映で一体感アップ！</p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-black">📱 振れば振るほど盛り上がる</h3>
                    <p>スマホを振って、光のアニメーションで参加感を演出。</p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-black">💒 結婚式・ライブ・パーティーに最適</h3>
                    <p>どんなイベントでもOK。簡単操作で感動の演出ができる！</p>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-sky-200 text-black py-20 px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">使い方はカンタン、3ステップ</h2>
                <div className="max-w-4xl mx-auto grid gap-12 md:grid-cols-3 text-center">
                    <div>
                        <div className="text-4xl mb-4">1️⃣</div>
                        <h4 className="font-bold text-xl mb-2">イベントを作成</h4>
                        <p>スマホで簡単にイベント作成できます。</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">2️⃣</div>
                        <h4 className="font-bold text-xl mb-2">URLを共有</h4>
                        <p>参加者にリンクやQRコードで共有しましょう。</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">3️⃣</div>
                        <h4 className="font-bold text-xl mb-2">色を選ぶだけ！</h4>
                        <p>選んだ色が、全員のスマホに即反映されます！</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6 text-center bg-sky-200">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">色のチカラで、あなたのイベントを特別に。</h2>
                <p className="mb-10 text-lg">今すぐ始めて、一体感と感動を演出しよう！</p>
                <Link
                    href="/login"
                    className="bg-black text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition">
                    今すぐはじめる
                </Link>
            </section>

            {/* Footer */}
            <footer className="py-10 text-center text-sm text-gray-500 bg-white">
                © 2025 SUNDOG Light. All rights reserved.
            </footer>
        </main>
    );
}
