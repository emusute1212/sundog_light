// Google Analytics tracking functions
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if GA is enabled
export const isGAEnabled = GA_MEASUREMENT_ID && typeof window !== "undefined";

// Page view tracking
export const pageview = (url: string) => {
    if (isGAEnabled && GA_MEASUREMENT_ID) {
        window.gtag("config", GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};

// Event tracking
type EventAction = {
    action: string;
    category: string;
    label?: string;
    value?: number;
};

export const event = ({ action, category, label, value }: EventAction) => {
    if (isGAEnabled && GA_MEASUREMENT_ID) {
        // デバッグ用ログ
        console.log("📊 GA Event:", {
            action,
            category,
            label,
            value,
            measurement_id: GA_MEASUREMENT_ID,
        });

        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    } else {
        // GA無効時のログ
        console.log("⚠️ GA Event (not sent - GA disabled):", {
            action,
            category,
            label,
            value,
            isGAEnabled,
            measurement_id: GA_MEASUREMENT_ID,
        });
    }
};

// Define gtag config type for better type safety
type GtagConfig = {
    page_path?: string;
    [key: string]: string | number | boolean | undefined;
};

// Declare global gtag function for TypeScript
declare global {
    interface Window {
        gtag: (
            command: "config" | "event",
            targetId: string,
            config?:
                | GtagConfig
                | Record<string, string | number | boolean | undefined>
        ) => void;
    }
}
