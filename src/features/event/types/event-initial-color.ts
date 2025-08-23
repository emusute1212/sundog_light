// 新規接続時に送信される初期色情報
export type EventInitialColor = {
    color: string | null; // null は色が選択されていない状態
    isInitial: true; // 初期接続時のデータであることを示すフラグ
};
