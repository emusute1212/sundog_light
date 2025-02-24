import {EventDetail} from "@/features/event/types/event-detail";

export type EventUpdateRequest = {
    userId: string;
    event: EventDetail;
}