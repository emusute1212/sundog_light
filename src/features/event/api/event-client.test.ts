import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchEventList } from "./event-client";

const apiRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api-client", () => ({
    apiRequest: apiRequestMock,
    getBackendOrigin: vi.fn(() => "http://localhost:8080"),
}));

describe("fetchEventList", () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });

    it.each([
        {
            response: [{ eventName: "イベント" }],
            fieldName: "eventId",
        },
        {
            response: [{ eventId: "event-id" }],
            fieldName: "eventName",
        },
    ])(
        "returns a localized error when $fieldName is missing",
        async ({ response, fieldName }) => {
            apiRequestMock.mockResolvedValue(response);

            await expect(fetchEventList()).rejects.toThrow(
                `APIレスポンスに ${fieldName} が含まれていません。`
            );
        }
    );
});
