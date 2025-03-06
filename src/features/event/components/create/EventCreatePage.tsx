"use client"
import EventEditSection from "@/features/event/components/edit/section/EventEditSection";

export default function EventCreatePage({userId}: { userId: string }) {
    return (
        <EventEditSection
            userId={userId}
        />
    );
}