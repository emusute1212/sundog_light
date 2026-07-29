"use client";

import { rememberPostLoginPath } from "@/features/auth/lib/post-login-redirect";
import { RefreshCw } from "lucide-react";
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
    const [googleScriptError, setGoogleScriptError] = useState(false);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        rememberPostLoginPath(params.get("callbackUrl"));
    }, []);

    const renderGoogleButton = () => {
        const google = (window as GoogleIdentityWindow).google;
        const buttonContainer = buttonContainerRef.current;

        if (!googleClientId) {
            return;
        }

        if (!google || !buttonContainer) {
            setGoogleScriptError(true);
            return;
        }

        try {
            buttonContainer.innerHTML = "";

            google.accounts.id.initialize({
                client_id: googleClientId,
                login_uri: `${window.location.origin}/login/google`,
                ux_mode: "redirect",
            });

            google.accounts.id.renderButton(buttonContainer, {
                theme: "outline",
                size: "large",
                shape: "rectangular",
                text: "signin_with",
                width: 320,
            });
            setGoogleScriptError(false);
        } catch {
            setGoogleScriptError(true);
        }
    };

    return (
        <div className="flex justify-center">
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={renderGoogleButton}
                onReady={renderGoogleButton}
                onError={() => setGoogleScriptError(true)}
            />
            <div className="w-full max-w-md p-8">
                <div className="mb-6 flex justify-center">
                    {!googleClientId ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            `NEXT_PUBLIC_GOOGLE_CLIENT_ID` が未設定です。
                        </div>
                    ) : googleScriptError ? (
                        <div
                            className="flex flex-col items-center gap-3 text-center"
                            role="alert"
                        >
                            <p className="text-sm text-red-700">
                                Googleログインの読み込みに失敗しました。
                            </p>
                            <button
                                className="inline-flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
                                onClick={() => window.location.reload()}
                                type="button"
                            >
                                <RefreshCw size={18} />
                                再読み込み
                            </button>
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
