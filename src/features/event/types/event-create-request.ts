
export type EventCreateRequest = {
    userId: string;
    event: {
        name: string;
        colors: string[];
    };
}