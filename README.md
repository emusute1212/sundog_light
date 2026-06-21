This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Maintenance Mode

サービスの更新作業など、一時的に利用者操作を止めたい場合は、環境変数でメンテナンスモードを有効にします。

```bash
MAINTENANCE_MODE=true
```

必要に応じて表示文言も変更できます。

```bash
MAINTENANCE_MESSAGE="サービス更新作業のため、一時的に停止しています。"
```

メンテナンスモード中の挙動:

- `/login`, `/event/*`, `/client/*` は `/maintenance` にリダイレクトします。
- `/` のランディングページは通常どおり表示します。
- `/api/event/*`, `/api/color/*`, `/api/pusher/*` は `503 Service Unavailable` を返します。
- `Retry-After: 300` と `Cache-Control: no-store` を返します。

想定手順:

1. `MAINTENANCE_MODE=true` でデプロイする。
2. 必要な更新作業を実施する。
3. 動作確認後、`MAINTENANCE_MODE=false` または未設定にして再デプロイする。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
