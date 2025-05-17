import clientPromise from "./mongodb";
import { Collection } from "mongodb";

// ユーザーIDとそのイベントリストを格納するためのコレクション型
interface UserEventsDoc {
    _id: string; // ユーザーIDをドキュメントIDとして使用
    events: string[]; // JSON文字列の配列として保存（Redisと同様）
}

// Redisの代わりに使用するMongoDBクラス
export class MongoRedis {
    private static instance: MongoRedis;
    private initialized = false;
    private userEventsCollection: Collection<UserEventsDoc> | null = null;

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
        if (!this.initialized) {
            const client = await clientPromise;
            const db = client.db("sundogLight");
            this.userEventsCollection =
                db.collection<UserEventsDoc>("userEvents");
            this.initialized = true;
        }
    }

    // RedisのLPUSH相当: リストの先頭に値を追加
    async lpush(key: string, value: string): Promise<number> {
        await this.initIfNeeded();

        // 使用しない結果は削除し、直接更新操作を実行
        await this.userEventsCollection?.updateOne(
            { _id: key },
            { $push: { events: { $each: [value], $position: 0 } } },
            { upsert: true }
        );

        // 更新後のドキュメントを取得して長さを返す
        const updatedDoc = await this.userEventsCollection?.findOne({
            _id: key,
        });
        return updatedDoc?.events.length || 1;
    }

    // RedisのLRANGE相当: 指定された範囲の値を取得して、JSON.parseで解析
    async lrange<T>(key: string, start: number, end: number): Promise<T[]> {
        await this.initIfNeeded();

        const doc = await this.userEventsCollection?.findOne({ _id: key });
        if (!doc || !doc.events || !Array.isArray(doc.events)) {
            return [];
        }

        // -1は配列の最後まで（Redisと同様）
        const endIndex = end === -1 ? doc.events.length - 1 : end;

        // 指定範囲の要素を取得し、JSON解析
        const items = doc.events.slice(start, endIndex + 1);
        return items.map((item) => JSON.parse(item)) as T[];
    }

    // RedisのLSET相当: 指定されたインデックスの値を更新
    async lset(key: string, index: number, value: string): Promise<string> {
        await this.initIfNeeded();

        // 指定位置が存在するか確認
        const doc = await this.userEventsCollection?.findOne({ _id: key });
        if (!doc || !doc.events || index >= doc.events.length) {
            throw new Error("インデックスが範囲外です");
        }

        // indexを使って配列の特定位置を更新するための更新パス
        const updatePath = `events.${index}`;

        await this.userEventsCollection?.updateOne(
            { _id: key },
            { $set: { [updatePath]: value } }
        );

        return "OK";
    }

    // RedisのLREM相当: 指定された値を削除
    async lrem(key: string, count: number, value: string): Promise<number> {
        await this.initIfNeeded();

        // 現在のドキュメントを取得
        const doc = await this.userEventsCollection?.findOne({ _id: key });
        if (!doc || !doc.events) {
            return 0;
        }

        // 対象の値と一致する要素のインデックスを特定
        const targetIndices: number[] = [];
        for (let i = 0; i < doc.events.length; i++) {
            if (doc.events[i] === value) {
                targetIndices.push(i);
                if (targetIndices.length === count) break;
            }
        }

        if (targetIndices.length === 0) {
            return 0;
        }

        // 配列から該当要素を削除（events配列を直接更新）
        const updatedEvents = doc.events.filter(
            (_, index) => !targetIndices.includes(index)
        );
        await this.userEventsCollection?.updateOne(
            { _id: key },
            { $set: { events: updatedEvents } }
        );

        return targetIndices.length;
    }
}
