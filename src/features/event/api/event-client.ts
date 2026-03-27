import { getBackendOrigin, apiRequest } from "@/lib/api-client";
import { hexColorToInt, intColorToHex } from "@/lib/color";
import { EventCreateRequest } from "../types/event-create-request";
import { EventDetail } from "../types/event-detail";
import { EventSendableColor } from "../types/event-sendable-color";
import { EventSummary } from "../types/event-summary";
import { EventUpdateRequest } from "../types/event-update-request";

type EventGetResponse = {
    eventId?: string;
    eventName?: string;
};

type EventGetDetailResponse = {
    eventId?: string;
    eventName?: string;
    currentColor?: number | null;
    clientPageUrl?: string;
    colors?: number[];
};

type EventCreateResponse = {
    eventId?: string;
};

type EventColorResponse = {
    color?: number | string | null;
    selectedColor?: number | string | null;
};

function requireString(value: string | undefined, fieldName: string) {
    if (!value) {
        throw new Error(`${fieldName} is missing in API response.`);
    }

    return value;
}

function mapSummary(response: EventGetResponse): EventSummary {
    return {
        uuid: requireString(response.eventId, "eventId"),
        name: requireString(response.eventName, "eventName"),
    };
}

function mapDetail(response: EventGetDetailResponse): EventDetail {
    return {
        uuid: requireString(response.eventId, "eventId"),
        name: requireString(response.eventName, "eventName"),
        colors:
            response.colors?.map((color) => intColorToHex(color) ?? "#000000") ??
            [],
        currentColor: intColorToHex(response.currentColor),
        clientPageUrl:
            response.clientPageUrl && response.clientPageUrl.length > 0
                ? response.clientPageUrl
                : undefined,
    };
}

function mapColorResponse(color: number | string | null | undefined) {
    if (color == null) {
        return null;
    }

    if (typeof color === "number") {
        return intColorToHex(color);
    }

    return color;
}

export function buildClientPageUrl(
    eventId: string,
    clientPageUrl?: string
) {
    return clientPageUrl ?? `${getBackendOrigin()}/client/${eventId}`;
}

export async function fetchEventList() {
    const response = await apiRequest<EventGetResponse[]>({
        path: "/api/events",
    });

    return response.map(mapSummary);
}

export async function fetchEventDetail(eventId: string) {
    const response = await apiRequest<EventGetDetailResponse>({
        path: `/api/events/${eventId}`,
    });

    return mapDetail(response);
}

export async function createEvent(request: EventCreateRequest) {
    const response = await apiRequest<EventCreateResponse>({
        path: "/api/events",
        method: "POST",
        body: {
            eventName: request.event.name,
            colors: request.event.colors.map(hexColorToInt),
        },
    });

    return requireString(response.eventId, "eventId");
}

export async function updateEvent(request: EventUpdateRequest) {
    await apiRequest({
        path: "/api/events",
        method: "PUT",
        body: {
            eventId: request.eventDetail.uuid,
            eventName: request.eventDetail.name,
            colors: request.eventDetail.colors.map(hexColorToInt),
        },
    });
}

export async function deleteEvent(eventId: string) {
    await apiRequest({
        path: "/api/events",
        method: "DELETE",
        body: {
            eventId,
        },
    });
}

export async function selectEventColor(request: EventSendableColor) {
    // This endpoint exists in the current backend contract, but is not yet
    // described in the shared OpenAPI schema.
    const response = await apiRequest<EventColorResponse>({
        path: "/api/color",
        method: "POST",
        body: request,
    });

    return mapColorResponse(response.selectedColor ?? response.color);
}
