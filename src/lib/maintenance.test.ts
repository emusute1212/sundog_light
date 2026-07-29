import { afterEach, describe, expect, it, vi } from "vitest";
import { getMaintenanceStatus } from "./maintenance";

describe("getMaintenanceStatus", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("bounds the maintenance status request with a five-second timeout", async () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/");

        const timeoutSignal = new AbortController().signal;
        const timeoutSpy = vi
            .spyOn(AbortSignal, "timeout")
            .mockReturnValue(timeoutSignal);
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
                    message: "予定はありません。",
                },
            }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await getMaintenanceStatus();

        expect(timeoutSpy).toHaveBeenCalledWith(5000);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/api/maintenance/status",
            {
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
                signal: timeoutSignal,
            }
        );
    });
});
