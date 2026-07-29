import { useCallback, useEffect, useRef, useState } from "react";
import { hasColorSocketLibraries } from "./color-websocket";

export const SOCKJS_SCRIPT_SRC =
    "https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js";
export const STOMP_SCRIPT_SRC =
    "https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js";
export const COLOR_SOCKET_SCRIPT_ERROR_MESSAGE =
    "リアルタイム接続の準備に失敗しました。";

const COLOR_SOCKET_SCRIPT_TIMEOUT_MS = 10_000;
type ColorSocketScript = "sockjs" | "stomp";

export function useColorSocketScripts() {
    const loadedScriptsRef = useRef(new Set<ColorSocketScript>());
    const [loadedScriptCount, setLoadedScriptCount] = useState(() =>
        hasColorSocketLibraries() ? 2 : 0
    );
    const [scriptError, setScriptError] = useState<string | null>(null);
    const isReady = loadedScriptCount >= 2;

    useEffect(() => {
        if (isReady || scriptError) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setScriptError(COLOR_SOCKET_SCRIPT_ERROR_MESSAGE);
        }, COLOR_SOCKET_SCRIPT_TIMEOUT_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isReady, scriptError]);

    const onScriptReady = useCallback((script: ColorSocketScript) => {
        const areLibrariesReady = hasColorSocketLibraries();

        if (areLibrariesReady) {
            setScriptError(null);
            loadedScriptsRef.current.add("sockjs");
            loadedScriptsRef.current.add("stomp");
            setLoadedScriptCount(2);
            return;
        }

        if (loadedScriptsRef.current.has(script)) {
            return;
        }

        loadedScriptsRef.current.add(script);

        if (loadedScriptsRef.current.size >= 2) {
            setScriptError(COLOR_SOCKET_SCRIPT_ERROR_MESSAGE);
            return;
        }

        setLoadedScriptCount(loadedScriptsRef.current.size);
    }, []);

    const onScriptError = useCallback(() => {
        setScriptError(COLOR_SOCKET_SCRIPT_ERROR_MESSAGE);
    }, []);

    return {
        isReady,
        onScriptError,
        onScriptReady,
        scriptError,
    };
}
