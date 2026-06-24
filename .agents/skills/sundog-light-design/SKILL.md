---
name: sundog-light-design
description: SUNDOG Lightの既存デザインに合わせてフロントエンドUIを作成・修正するためのデザイン指針。メンテナンス画面、ログイン画面、イベント作成・一覧・詳細・編集画面、ランディングページ、ボタン、文言、Tailwind CSSの見た目を既存UIに寄せる必要があるときに使う。
---

# SUNDOG Light Design

## 基本方針

新しいUIを作る前に、必ず既存画面と近いコンポーネントを読む。特に次を優先して確認する。

- `src/app/page.tsx`: ランディングページ、CTA、セクション構成。
- `src/features/core/components/SundogLightHeader.tsx`: SUNDOG Lightロゴ表現。
- `src/app/(host)/layout.tsx`: ホスト画面の幅、ヘッダー、余白。
- `src/features/event/components/**`: イベント系画面のフォーム、ボタン、状態表示。

既存UIは「白地、黒文字、薄い水色アクセント、黒い主要ボタン、控えめな角丸」が軸。新しい強いテーマを足さず、既存の延長として作る。

## 見た目のルール

- 背景は原則 `bg-white text-black font-sans` を使う。
- ホスト向け画面は `max-w-lg` を中心に、スマホで自然に使える縦積みレイアウトにする。
- ランディングページの広いセクションは既存どおり `max-w-5xl` や `max-w-4xl` を使う。
- アクセント背景は `bg-sky-200` を基本にする。
- 本文は `text-gray-700`、補足は `text-gray-500` から始める。
- 主要ボタンは黒背景、白文字、`rounded-2xl`、`shadow-lg`、`hover:scale-105 transition` を基本にする。
- セカンダリ操作は白背景、黒文字、黒または薄いグレーの枠線、`rounded-lg` を基本にする。
- 既存と違う暗色全面背景、派手な多色バー、紫系グラデーション、装飾的な光彩・ぼかし背景は避ける。

## ロゴ表現

SUNDOG Lightの見出しロゴを置くときは、既存の二重テキスト表現に合わせる。

```tsx
<div className="relative select-none">
    <h1 className="w-full p-2 text-center text-4xl font-extrabold text-black [-webkit-text-stroke:2px_black]">
        SUNDOG Light
    </h1>
    <h1 className="absolute left-0 top-0 w-full bg-gradient-to-r from-gray-200 to-cyan-200 bg-clip-text p-2 text-center text-4xl font-extrabold text-transparent">
        SUNDOG Light
    </h1>
</div>
```

ランディングのヒーロー上では、既存どおり白縁取りと `drop-shadow-2xl` を使ってよい。

## ヘッダー配置

LP以外の通常画面では、SUNDOG Lightのヘッダーを画面上部の中央に配置する。現状のホスト画面とメンテナンス画面に合わせて、`header` は `top-0` の白背景で、左右に同幅の余白要素を置き、中央にロゴを置く。

```tsx
<header className="sticky top-0 w-full bg-white pb-4">
    <div className="relative flex items-center justify-between px-4">
        <div className="w-20" />
        {/* SUNDOG Lightロゴ */}
        <div className="w-20" />
    </div>
</header>
```

ランディングページは例外。LPではヒーロー体験を優先し、背景動画の上に白縁取りのロゴを中央配置してよい。

## 画面別の考え方

- メンテナンス・エラー・空状態は、中央寄せ、白背景、ロゴ、短い見出し、グレー本文、黒い主要ボタンでまとめる。
- フォーム画面は幅を広げすぎず、入力とアクションが縦に追いやすい構成にする。
- イベント詳細の色操作は操作性を優先し、選択状態・処理中状態が一目で分かるようにする。
- ランディングページは既存の動画・スクリーンショット・`bg-sky-200` セクションを尊重し、別の広告サイト風に作り替えない。

## 実装手順

1. 変更対象に近い既存ファイルを読む。
2. 既存のTailwind class、余白、幅、ボタン表現を再利用する。
3. 新しい共通化は、重複が増えてから検討する。
4. `pnpm build` で型とビルドを確認する。
5. 見た目に関わる変更は、可能ならブラウザで対象画面を開いてスクリーンショット確認する。
