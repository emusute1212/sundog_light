import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URIが環境変数に設定されていません");
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
    // 接続タイムアウトを5秒に設定
    connectTimeoutMS: 5000,
    // ソケットタイムアウトを10秒に設定
    socketTimeoutMS: 10000,
    // 接続プールサイズを設定
    maxPoolSize: 10,
    // サーバー選択タイムアウトを5秒に設定
    serverSelectionTimeoutMS: 5000,
};

// グローバル型拡張でTypeScriptエラーを回避
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// グローバル変数としてクライアントをキャッシュ
const clientPromise: Promise<MongoClient> = (() => {
    // シングルトンパターンでMongoDBクライアントを管理
    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect().catch((err) => {
            console.error("MongoDB接続エラー:", err);
            throw err;
        });
    }
    return global._mongoClientPromise;
})();

// MongoDBクライアントをエクスポート
export default clientPromise;
