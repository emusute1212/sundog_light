# SUNDOG Light Agent Guide

## プロジェクト概要

SUNDOG Light は、参加者のスマートフォン画面をイベント用ライトとして使うモバイルファーストのWebアプリです。ホストがイベントを作成し、URLまたはQRコードを共有し、接続している参加者の画面色をリアルタイムに変更します。

元の企画書PDFと仕様設計HTMLから読み取った詳細は [docs/product-context.md](docs/product-context.md) にまとめています。

## プロダクトの前提

- ホストはイベントを管理する。参加者は共有された `/client/{eventUuid}` URLから、できるだけ少ない手間で参加できるべき。
- 参加者側の中心体験はライト画面だけ。状態は「接続中」「色が未選択」「選択色の全画面表示」。
- イベント色は `#RRGGBB` 形式のhex文字列。イベント作成・編集では最低1色が必要。
- 選択色の `null` は「現在色が選択されていない」状態。同じ色をもう一度選ぶと `null` に戻すトグル挙動。
- リアルタイム更新は Pusher の `selected-color-channel-{eventUuid}` チャンネルと `evt::color` イベントを使う。
- 1回だけ使う参加者にも扱いやすくする。明示的な方針変更がない限り、参加者アカウント作成は追加しない。

## 現在の画面構成

- `/` - 公開ランディングページ。
- `/login` - ホストログイン。現在の認証プロバイダーは NextAuth の Google。
- `/event/list` - ホストのイベント一覧。
- `/event/create` - ホストのイベント作成。
- `/event/detail/[eventUuid]` - ホストの操作画面。色ボタン、参加者URL、QRコードを表示。
- `/event/edit/[eventUuid]` - ホストのイベント編集。
- `/client/[key]` - 参加者ライト画面。`key` はイベントUUID。
- `/maintenance` - メンテナンスモード画面。

## APIとデータ契約

- `POST /api/event/create` は認証済みホストのイベントを作成する。
- `GET /api/event/list` は認証済みホストのイベント一覧を返す。
- `GET /api/event/[eventUuid]` は認証済みホストの対象イベントを返す。
- `PUT /api/event/update` は認証済みホストのイベントを更新する。
- `DELETE /api/event/remove/[eventUuid]` は認証済みホストのイベントと色状態を削除する。
- `POST /api/color` は認証済みホストの選択色を変更し、Pusherへ配信する。
- `GET /api/event/[eventUuid]/color` は現在の選択色を返す。参加者用なので認証不要。
- `POST /api/pusher/auth` は Pusher チャンネル認可を行う。

主要なイベント型は `EventDetail`:

```ts
{
  name: string;
  colors: string[];
  uuid: string;
  lastSelectedColor?: string | null;
}
```

現在のストレージは MongoDB。`MongoRedis` がRedis風のアダプターとして動きます。DBは `sundogLight`、ホスト別イベント一覧は `userEvents`、イベントUUID別の現在色は `eventColorStates` に保存します。

## 開発コマンド

- 依存関係は `pnpm install` で入れる。`preinstall` で pnpm が強制される。
- ローカル起動は `pnpm dev`。
- ビルドは `pnpm build`。
- Lintは `pnpm lint`。

## 環境変数

- `MONGODB_URI` - MongoDB接続に必須。
- `AUTH_SECRET` / `NEXTAUTH_SECRET` 相当 - NextAuthのデプロイ設定に応じて必要。
- `AUTH_GOOGLE_ID` と `AUTH_GOOGLE_SECRET`、または導入中のNextAuthバージョンが期待するGoogleプロバイダー用env名。
- `PUSHER_APP_ID`
- `NEXT_PUBLIC_PUSHER_KEY`
- `PUSHER_SECRET`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - 任意のGoogle Analytics ID。
- `MAINTENANCE_MODE=true` - メンテナンスモードを有効化。
- `MAINTENANCE_MESSAGE` - メンテナンス画面/API向けの任意メッセージ。
- `MAINTENANCE_NOTICE_MODE=true` - メンテナンス予告バーを有効化。
- `MAINTENANCE_NOTICE_MESSAGE` - メンテナンス予告バー向けの任意メッセージ。

## 実装ガイド

- ホスト専用操作と参加者アクセスの分離を守る。middlewareやauthを触るときは、意図した公開参加フローが維持されているか確認する。
- リアルタイム色変更を触る場合は、ホストAPI、Pusher配信契約、`/client/[key]` の購読処理をまとめて更新する。
- APIレスポンス形状を変える場合は、一部クライアントが `Response.json` に包まれたJSON文字列を `JSON.parse(await response.json())` している点も同時に移行する。
- ホスト画面はモバイルファーストで、既存の白・黒・スカイブルー・色スウォッチ中心のシンプルなUIに合わせる。
- 直接的で小さなコンポーネントを `src/features/event/components/...` 配下に置き、共有イベント型は `src/features/event/types/...` に置く。
- イベント寿命は現状ホストによる手動削除。自動期限切れは将来案であり、現在の挙動ではない。
