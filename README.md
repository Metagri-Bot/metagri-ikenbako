# Metagri Feedback Box (Next.js / Vercel)

Metagri向けの**本番運用を前提としたMVPフィードバックフォーム**です。  
App Router構成で、モバイル対応UI・匿名/記名投稿・クライアント/サーバー両方のバリデーション・Google Sheets追記・基本スパム対策を含みます。

## 機能要件の実装内容

- モバイルファーストUI（1画面完結フォーム）
- 匿名投稿 / 記名投稿切り替え
- 入力検証
  - クライアント：必須/文字数/メール形式
  - サーバー：Zodスキーマで再検証
- Google Sheets保存（サービスアカウント）
- スパム対策（MVP向け）
  - Honeypot
  - 送信速度チェック（フォーム表示直後の送信を拒否）
  - IP単位の簡易レート制限

## 技術スタック

- Next.js App Router
- TypeScript
- Zod
- googleapis
- Vitest

## ローカルセットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 環境変数

`.env.local` に以下を設定してください。

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_SHEET_NAME`（例: `feedback`）
- `APP_URL`（例: `https://xxxxx.vercel.app`）
- `RATE_LIMIT_WINDOW_MS`（デフォルト: 60000）
- `RATE_LIMIT_MAX_REQUESTS`（デフォルト: 5）
- `MIN_SUBMIT_SECONDS`（デフォルト: 3）

> `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` は `\n` を含む文字列形式で設定してください。

## Google Sheets準備

1. 対象スプレッドシートを作成
2. サービスアカウントに編集権限を共有
3. シート名を `GOOGLE_SHEET_NAME` に合わせる
4. API有効化（Google Sheets API）

## テスト

```bash
npm test
```

## Vercelデプロイ手順

1. GitHub連携でプロジェクトをVercelへインポート
2. Environment Variablesに `.env.local` と同じ値を登録
3. Build Command: `npm run build`（既定）
4. Deploy

## 補足（MVPのため将来拡張推奨）

- 永続的なレート制限（Redis/KV）
- reCAPTCHA/Turnstile導入
- 収集データの監査ログと可観測性（Sentry等）
