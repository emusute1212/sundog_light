"use client";

import { rememberPostLoginPath } from "@/features/auth/lib/post-login-redirect";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type GoogleIdentityWindow = Window &
    typeof globalThis & {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        login_uri: string;
                        ux_mode: "redirect";
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme: "outline";
                            size: "large";
                            shape: "rectangular";
                            text: "signin_with";
                            width: number;
                        }
                    ) => void;
                };
            };
        };
    };

export default function HostLoginPage() {
    const buttonContainerRef = useRef<HTMLDivElement | null>(null);
    const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        rememberPostLoginPath(params.get("callbackUrl"));
    }, []);

    useEffect(() => {
        const google = (window as GoogleIdentityWindow).google;

        if (
            !isGoogleScriptLoaded ||
            !googleClientId ||
            !google ||
            !buttonContainerRef.current
        ) {
            return;
        }

        buttonContainerRef.current.innerHTML = "";

        google.accounts.id.initialize({
            client_id: googleClientId,
            login_uri: `${window.location.origin}/login/google`,
            ux_mode: "redirect",
        });

        google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "signin_with",
            width: 320,
        });
    }, [googleClientId, isGoogleScriptLoaded]);

    return (
        <div className="flex justify-center">
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setIsGoogleScriptLoaded(true)}
            />
            <div className="w-full max-w-md p-8">
                <div className="mb-6 flex justify-center">
                    {!googleClientId ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            `NEXT_PUBLIC_GOOGLE_CLIENT_ID` が未設定です。
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-center gap-3">
                            <div ref={buttonContainerRef} />
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        ログインすることで、
                        <a
                            href="/terms.html"
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            利用規約
                        </a>
                        および
                        <a
                            href="/privacy.html"
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            プライバシーポリシー
                        </a>
                        に同意したものとみなします。
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                        当サービスは無料でご利用いただけます
                    </p>
                </div>
            </div>
        </div>
    );
}
