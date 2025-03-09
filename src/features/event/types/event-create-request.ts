export type EventCreateRequest = {
    type: "create-request";
    event: {
        name: string;
        colors: string[];
    };
}