import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    COLOR_SOCKET_SCRIPT_ERROR_MESSAGE,
    useColorSocketScripts,
} from "./use-color-socket-scripts";

const socketLibrariesAvailable = vi.hoisted(() => ({ value: false }));

vi.mock("./color-websocket", () => ({
    hasColorSocketLibraries: () => socketLibrariesAvailable.value,
}));

describe("useColorSocketScripts", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        socketLibrariesAvailable.value = false;
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("deduplicates callbacks and rejects scripts that expose no libraries", () => {
        const { result } = renderHook(() => useColorSocketScripts());

        act(() => {
            result.current.onScriptReady("sockjs");
            result.current.onScriptReady("sockjs");
        });

        expect(result.current.isReady).toBe(false);
        expect(result.current.scriptError).toBeNull();

        act(() => {
            result.current.onScriptReady("stomp");
        });

        expect(result.current.isReady).toBe(false);
        expect(result.current.scriptError).toBe(
            COLOR_SOCKET_SCRIPT_ERROR_MESSAGE
        );
    });

    it("recovers when both libraries become available", () => {
        const { result } = renderHook(() => useColorSocketScripts());

        act(() => {
            result.current.onScriptError();
        });
        socketLibrariesAvailable.value = true;
        act(() => {
            result.current.onScriptReady("stomp");
        });

        expect(result.current.isReady).toBe(true);
        expect(result.current.scriptError).toBeNull();
    });
});
