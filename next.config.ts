import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: "/:path*",
                has: [
                    {
                        type: "host",
                        value: "sundog-light.vercel.app",
                    },
                ],
                destination: "https://app.sundog-org.com/:path*",
                permanent: true,
            },
        ];
    },
    async rewrites() {
        const backendBaseUrl = (
            process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
        ).replace(/\/$/, "");

        return [
            {
                source: "/ws",
                destination: `${backendBaseUrl}/ws`,
            },
            {
                source: "/api/:path*",
                destination: `${backendBaseUrl}/api/:path*`,
            },
            {
                source: "/ws/:path*",
                destination: `${backendBaseUrl}/ws/:path*`,
            },
        ];
    },
};

export default nextConfig;
