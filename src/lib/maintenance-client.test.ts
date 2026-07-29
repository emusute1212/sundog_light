import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientMaintenanceStatus } from "./maintenance-client";

describe("getClientMaintenanceStatus", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("checks maintenance through the same-origin API rewrite", async () => {
        const timeoutSignal = new AbortController().signal;
        vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutSignal);
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                maintenanceStatus: {
                    enabled: false,
                    message: "利用できます。",
                    retryAfterSeconds: 0,
                },
                notice: {
                    enabled: false,
                    message: "",
                },
            }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await getClientMaintenanceStatus();

        expect(fetchMock).toHaveBeenCalledWith("/api/maintenance/status", {
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
            signal: timeoutSignal,
        });
    });
});
