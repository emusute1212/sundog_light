import {EventDetail} from "@/features/event/types/event-detail";

export type EventUpdateRequest = {
    type: "update-request";
    userId: string;
    eventDetail: EventDetail;
}