import clientPromise from "./mongodb";
import { Collection, Db } from "mongodb";

// ユーザーIDとそのイベントリストを格納するためのコレクション型
interface UserEventsDoc {
    _id: string; // ユーザーIDをドキュメントIDとして使用
    events: string[]; // JSON文字列の配列として保存（Redisと同様）
}

// Redisの代わりに使用するMongoDBクラス
export class MongoRedis {
    private static instance: MongoRedis;
    private initialized = false;
    private db: Db | null = null;
    private userEventsCollection: Collection<UserEventsDoc> | null = null;
    private initPromise: Promise<void> | null = null;

    private constructor() {}

    // シングルトンパターンでインスタンスを取得
    public static getInstance(): MongoRedis {
        if (!MongoRedis.instance) {
            MongoRedis.instance = new MongoRedis();
        }
        return MongoRedis.instance;
    }

    // 環境変数からインスタンスを初期化
    public static fromEnv(): MongoRedis {
        return MongoRedis.getInstance();
    }

    // コレクションを初期化（初回のみ）
    private async initIfNeeded() {
        if (this.initialized) return;

        // 同時に複数の初期化要求があった場合に備えて処理をキャッシュ
        if (!this.initPromise) {
            this.initPromise = this.initialize();
        }

        await this.initPromise;
    }

    // 実際の初期化処理
    private async initialize() {
        try {
            console.log("MongoDBに接続中...");
            const client = await clientPromise;
            this.db = client.db("sundogLight");
            this.userEventsCollection =
                this.db.collection<UserEventsDoc>("userEvents");

            // インデックスを作成してクエリを高速化
            await this.userEventsCollection.createIndex({ _id: 1 });

            this.initialized = true;
            console.log("MongoDB接続完了");
        } catch (error) {
            console.error("MongoDB初期化エラー:", error);
            throw error;
        } finally {
            // 成功・失敗に関わらず初期化プロセスをリセット
            this.initPromise = null;
        }
    }

    // RedisのLPUSH相当: リストの先頭に値を追加
    async lpush(key: string, value: string): Promise<number> {
        await this.initIfNeeded();

        if (!this.userEventsCollection) {
            throw new Error("MongoDB接続が初期化されていません");
        }

        // 同時に2つの操作を実行（時間短縮）
        await this.userEventsCollection.updateOne(
            { _id: key },
            { $push: { events: { $each: [value], $position: 0 } } },
            { upsert: true }
        );

        // 更新後の長さを返す（最新のドキュメントサイズを効率的に取得）
        const projection = {
            projection: { _id: 0, eventsLength: { $size: "$events" } },
        };
        const result = await this.userEventsCollection.findOne(
            { _id: key },
            projection
        );
        return (result?.eventsLength || 1) as number;
    }

    // RedisのLRANGE相当: 指定された範囲の値を取得して、JSON.parseで解析
    async lrange<T>(key: string, start: number, end: number): Promise<T[]> {
        await this.initIfNeeded();

        if (!this.userEventsCollection) {
            throw new Error("MongoDB接続が初期化されていません");
        }

        // 必要最小限のデータだけを取得（効率化）
        const pipeline = [
            { $match: { _id: key } },
            { $project: { events: 1, count: { $size: "$events" } } },
            { $limit: 1 },
        ];

        const results = await this.userEventsCollection
            .aggregate(pipeline)
            .toArray();
        const doc = results[0];

        if (!doc || !doc.events || !Array.isArray(doc.events)) {
            return [];
        }

        // -1は配列の最後まで（Redisと同様）
        const endIndex = end === -1 ? doc.events.length - 1 : end;

        try {
            // 指定範囲の要素を取得し、JSON解析
            const items = doc.events.slice(start, endIndex + 1);
            return items.map((item) => JSON.parse(item)) as T[];
        } catch (error) {
            console.error("JSON解析エラー:", error);
            return [];
        }
    }

    // RedisのLSET相当: 指定されたインデックスの値を更新
    async lset(key: string, index: number, value: string): Promise<string> {
        await this.initIfNeeded();

        if (!this.userEventsCollection) {
            throw new Error("MongoDB接続が初期化されていません");
        }

        // 効率的な更新パスを作成
        const updatePath = `events.${index}`;

        try {
            const result = await this.userEventsCollection.updateOne(
                { _id: key },
                { $set: { [updatePath]: value } }
            );

            if (result.matchedCount === 0) {
                throw new Error("指定されたキーが存在しません");
            }

            if (result.modifiedCount === 0) {
                // インデックスが範囲外の可能性があるが、直接エラーはわからないので
                // 追加の確認をする
                const doc = await this.userEventsCollection.findOne(
                    { _id: key },
                    { projection: { eventsLength: { $size: "$events" } } }
                );

                if (!doc || doc.eventsLength <= index) {
                    throw new Error("インデックスが範囲外です");
                }
            }

            return "OK";
        } catch (error) {
            console.error("MongoDB更新エラー:", error);
            throw error;
        }
    }

    // RedisのLREM相当: 指定された値を削除
    async lrem(key: string, count: number, value: string): Promise<number> {
        await this.initIfNeeded();

        if (!this.userEventsCollection) {
            throw new Error("MongoDB接続が初期化されていません");
        }

        try {
            // 現在のドキュメントを取得
            const doc = await this.userEventsCollection.findOne({ _id: key });
            if (!doc || !doc.events || doc.events.length === 0) {
                return 0;
            }

            // 対象の値と一致する要素のインデックスを特定
            const targetIndices: number[] = [];
            for (let i = 0; i < doc.events.length; i++) {
                if (doc.events[i] === value) {
                    targetIndices.push(i);
                    if (count > 0 && targetIndices.length >= count) break;
                }
            }

            if (targetIndices.length === 0) {
                return 0;
            }

            // 配列から該当要素を削除（events配列を直接更新）
            const updatedEvents = doc.events.filter(
                (_, index) => !targetIndices.includes(index)
            );
            const result = await this.userEventsCollection.updateOne(
                { _id: key },
                { $set: { events: updatedEvents } }
            );

            return result.modifiedCount === 1 ? targetIndices.length : 0;
        } catch (error) {
            console.error("MongoDB削除エラー:", error);
            throw error;
        }
    }
}
