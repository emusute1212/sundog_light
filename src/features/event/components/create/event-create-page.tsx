"use client"
import EventEditSection from "@/features/event/components/edit/section/event-edit-section";

export default function EventCreatePage({userId}: { userId: string }) {
    return (
        <EventEditSection
            userId={userId}
        />
    );
}