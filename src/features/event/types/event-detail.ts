export type EventDetail = {
    name: string;
    colors: string[];
    uuid: string;
    lastSelectedColor?: string | null; // 最後に選択された色（null = 未選択）
};
