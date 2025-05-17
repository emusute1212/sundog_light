import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// MongoDB接続テスト用のエンドポイント
export async function GET() {
    const startTime = Date.now();
    let error = null;

    try {
        // MongoDB接続をテスト
        const client = await clientPromise;

        // ping操作で接続を確認
        await client.db("admin").command({ ping: 1 });

        // 基本的な情報を取得
        const db = client.db("sundogLight");
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        // 応答時間を計算
        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: "success",
            message: "MongoDB接続成功",
            responseTime: `${responseTime}ms`,
            databaseName: "sundogLight",
            collections: collectionNames,
            connectionInfo: {
                host: client.options.hosts
                    ?.map((h) => `${h.host}:${h.port}`)
                    .join(", "),
                readPreference: client.readPreference.mode,
                writeConcern: client.writeConcern?.w || "default",
            },
        });
    } catch (err) {
        // エラー情報を適切に変換
        error =
            err instanceof Error
                ? { name: err.name, message: err.message, stack: err.stack }
                : String(err);

        const responseTime = Date.now() - startTime;

        return NextResponse.json(
            {
                status: "error",
                message: "MongoDB接続エラー",
                responseTime: `${responseTime}ms`,
                error,
                mongodbUri: process.env.MONGODB_URI
                    ? `${process.env.MONGODB_URI.substring(0, 20)}...`
                    : "未設定",
            },
            { status: 500 }
        );
    }
}
