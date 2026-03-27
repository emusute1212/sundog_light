"use client";

import { loginWithGoogle } from "@/features/auth/api/auth-client";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getDisplayErrorMessage } from "@/lib/api-client";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type GoogleIdentityWindow = Window &
    typeof globalThis & {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential?: string }) => void;
                        ux_mode?: "popup";
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
    const { login } = useAuth();
    const buttonContainerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [callbackUrl, setCallbackUrl] = useState("/event/list");
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        setCallbackUrl(params.get("callbackUrl") ?? "/event/list");
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

        const handleCredentialResponse = async (response: {
            credential?: string;
        }) => {
            if (!response.credential) {
                toast.error("Google 認証に失敗しました。");
                return;
            }

            setIsSubmitting(true);

            try {
                const session = await loginWithGoogle(response.credential);
                login(session);
                router.replace(callbackUrl);
            } catch (error) {
                toast.error(getDisplayErrorMessage(error));
            } finally {
                setIsSubmitting(false);
            }
        };

        buttonContainerRef.current.innerHTML = "";

        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            ux_mode: "popup",
        });

        google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "signin_with",
            width: 320,
        });
    }, [callbackUrl, googleClientId, isGoogleScriptLoaded, login, router]);

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
                            {isSubmitting && (
                                <p className="text-sm text-gray-500">
                                    ログイン中...
                                </p>
                            )}
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
