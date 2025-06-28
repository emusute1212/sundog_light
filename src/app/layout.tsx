import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import GoogleAnalytics from "@/features/core/components/GoogleAnalytics";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SUNDOG Light - スマホをペンライト代わりに！",
    description:
        "アプリ不要でスマホがペンライトの代わりになります！結婚式や学園祭イベントなど中小イベントでも使いやすく誰でも無料で使えます。使い方は簡単！",
    keywords: [
        "ペンライト",
        "スマホライト",
        "LED",
        "イベント",
        "結婚式",
        "学園祭",
        "コンサート",
        "応援",
    ],
    authors: [{ name: "SUNDOG Light" }],
    creator: "SUNDOG Light",
    publisher: "SUNDOG Light",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://sundog-light.vercel.app"),
    openGraph: {
        title: "SUNDOG Light - スマホをペンライト代わりに！",
        description:
            "アプリ不要でスマホがペンライトの代わりになります！結婚式や学園祭イベントなど中小イベントでも使いやすく誰でも無料で使えます。",
        url: "https://sundog-light.vercel.app",
        siteName: "SUNDOG Light",
        images: [
            {
                url: "/og-image.png", // 後でこの画像を作成します
                width: 1200,
                height: 630,
                alt: "SUNDOG Light - スマホをペンライト代わりに！",
            },
        ],
        locale: "ja_JP",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "SUNDOG Light - スマホをペンライト代わりに！",
        description:
            "アプリ不要でスマホがペンライトの代わりになります！結婚式や学園祭イベントなど中小イベントでも使いやすく誰でも無料で使えます。",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "SUNDOG Light",
        description:
            "アプリ不要でスマホがペンライトの代わりになります！結婚式や学園祭イベントなど中小イベントでも使いやすく誰でも無料で使えます。",
        url: "https://sundog-light.vercel.app",
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web Browser",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY",
        },
        creator: {
            "@type": "Organization",
            name: "SUNDOG Light",
        },
        keywords:
            "ペンライト, スマホライト, LED, イベント, 結婚式, 学園祭, コンサート, 応援",
    };

    return (
        <html lang="ja">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <GoogleAnalytics />
                {children}
            </body>
        </html>
    );
}
