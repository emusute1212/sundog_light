import { getBackendOrigin, apiRequest } from "@/lib/api-client";
import { hexColorToInt, intColorToHex } from "@/lib/color";
import { EventCreateRequest } from "../types/event-create-request";
import { EventDetail } from "../types/event-detail";
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

type PublicCurrentColorResponse = {
    eventId?: string;
    currentColor?: number | null;
};

function requireString(value: string | undefined, fieldName: string) {
    if (!value) {
        throw new Error(`APIレスポンスに ${fieldName} が含まれていません。`);
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

export function buildClientPageUrl(
    eventId: string,
    clientPageUrl?: string
) {
    if (typeof window !== "undefined") {
        return `${window.location.origin}/client/${eventId}`;
    }

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

export async function fetchPublicCurrentColor(eventId: string) {
    const response = await apiRequest<PublicCurrentColorResponse>({
        path: `/api/public/events/${eventId}/current-color`,
        requiresAuth: false,
    });

    return intColorToHex(response.currentColor);
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
