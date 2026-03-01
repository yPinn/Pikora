# Pikora

Meta 生態系社群抽獎管理工具，整合 Facebook、Instagram、Threads，支援進階篩選與公正隨機抽獎。

## Tech Stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript
- **Auth** — NextAuth.js v5，Facebook OAuth 2.0
- **Database** — PostgreSQL + Prisma ORM
- **UI** — Radix UI, Tailwind CSS v4, shadcn/ui
- **API** — Meta Graph API

## Getting Started

```bash
# 安裝相依套件
npm install

# 設定環境變數
cp .env.example .env.local

# 同步資料庫 schema
npm run db:push

# 啟動開發伺服器
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## Environment Variables

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=
```

## Scripts

| 指令                 | 說明                           |
| -------------------- | ------------------------------ |
| `npm run dev`        | 啟動開發伺服器                 |
| `npm run build`      | 正式建置（含 prisma generate） |
| `npm run lint`       | ESLint 檢查                    |
| `npm run format`     | Prettier 格式化                |
| `npm run db:migrate` | 建立並執行 migration           |
| `npm run db:studio`  | 開啟 Prisma Studio             |
