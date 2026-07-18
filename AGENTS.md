# SUNDOG Light Agent Guide

## プロジェクト概要

SUNDOG Light は、参加者のスマートフォン画面をイベント用ライトとして使うモバイルファーストのWebアプリです。ホストがイベントを作成し、URLまたはQRコードを共有し、接続している参加者の画面色をリアルタイムに変更します。

元の企画書PDFと仕様設計HTMLから読み取った詳細は [docs/product-context.md](docs/product-context.md) にまとめています。

## プロダクトの前提

- ホストはイベントを管理する。参加者は共有された `/client/{eventUuid}` URLから、できるだけ少ない手間で参加できるべき。
- 参加者側の中心体験はライト画面だけ。状態は「接続中」「色が未選択」「選択色の全画面表示」。
- イベント色はフロントエンドで `#RRGGBB` として扱い、外部境界では既存の変換処理を再利用する。
- ホストの色操作は、接続中の参加者画面へリアルタイムに反映する。
- 1回だけ使う参加者にも扱いやすくする。明示的な方針変更がない限り、参加者アカウント作成は追加しない。

## 現在の画面構成

- `/` - 公開ランディングページ。
- `/login` - ホストログイン。
- `/event/list` - ホストのイベント一覧。
- `/event/create` - ホストのイベント作成。
- `/event/detail/[eventUuid]` - ホストの操作画面。色ボタン、参加者URL、QRコードを表示。
- `/event/edit/[eventUuid]` - ホストのイベント編集。
- `/client/[key]` - 参加者ライト画面。`key` はイベントUUID。
- `/maintenance` - メンテナンスモード画面。

## 主要なイベント型

主要なイベント型は `EventDetail`:

```ts
{
  name: string;
  colors: string[];
  uuid: string;
  currentColor?: string | null;
  clientPageUrl?: string;
}
```

## 開発コマンド

- 依存関係は `pnpm install` で入れる。`preinstall` でpnpmが強制される。
- ローカル起動は `pnpm dev`。
- ビルドは `pnpm build`。
- Lintは `pnpm lint`。

## 設定

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - 任意のGoogle Analytics ID。
- その他の設定項目と例は `.env.example` を参照し、実値はGit管理外で扱う。

## 実装ガイド

- ホスト専用操作と参加者アクセスの分離を守る。認証を触るときは、公開参加フローが維持されているか確認する。
- API契約を変更するときは、最新のOpenAPI契約とサーバー実装を確認し、関連するAPI clientをまとめて更新する。
- リアルタイム色変更を触る場合は、ホストと参加者の送受信処理およびメッセージ形状をまとめて確認する。
- ホスト画面はモバイルファーストで、既存の白・黒・スカイブルー・色スウォッチ中心のシンプルなUIに合わせる。
- 直接的で小さなコンポーネントを `src/features/event/components/...` 配下に置き、共有イベント型は `src/features/event/types/...` に置く。
- イベント寿命は現状ホストによる手動削除。自動期限切れは将来案であり、現在の挙動ではない。
