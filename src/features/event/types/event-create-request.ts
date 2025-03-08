export type EventCreateRequest = {
    type: "create-request";
    userId: string;
    event: {
        name: string;
        colors: string[];
    };
}