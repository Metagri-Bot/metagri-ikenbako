# Metagri Feedback Box (Next.js / Vercel)

Metagri向けの**本番運用を前提としたMVPフィードバックフォーム**です。  
App Router構成で、モバイル対応UI・匿名/記名投稿・クライアント/サーバー両方のバリデーション・Google Sheets追記・基本スパム対策を含みます。

## 機能要件の実装内容

- モバイルファーストUI（1画面完結フォーム）
- 匿名投稿 / 記名投稿切り替え
- 入力検証
  - クライアント：必須/文字数
  - サーバー：Zodスキーマで再検証
- Google Sheets保存（サービスアカウント）
- 投票完了後のランダム抽選ギミック
  - 抽選は投稿ごとに `1回のみ`
  - 基本当選率 `10%`
  - 投稿文字数とカテゴリで当選率が上昇し、`最大50%` まで傾斜
  - カテゴリー別の当選率ボーナス（改善要望/アイデアを高めに設定）
    - `idea`（アイデア）: `+15%`
    - `request`（改善要望）: `+12%`
    - `trouble`（困りごと）: `+10%`
    - `opinion`（意見）: `+8%`
    - `cheer`（応援メッセージ）: `+5%`
  - 当選時は Discord ID + 会員/非会員を入力して特典申請
  - 会員は独自トークン、非会員はポイントを案内
- 当選情報のGoogle Sheets保存
  - `POST /api/reward-claim` で当選入力情報を追記
- 当選情報入力時の通知
  - Webhook通知（Discord/Slack等）
  - メール通知（Resend API）
- スパム対策（MVP向け）
  - Honeypot
  - 送信速度チェック（フォーム表示直後の送信を拒否）
  - IP単位の簡易レート制限
- Hydration mismatch対策
  - 送信時刻を submit 時に生成
  - `<body suppressHydrationWarning>` を適用（ブラウザ拡張の属性注入などを許容）

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
- `NOTIFICATION_WEBHOOK_URL`（任意。通知先サービスのWebhook URL）
- `NOTIFICATION_TO_ADDRESS`（任意。通知メッセージ内に含める通知先アドレス）
- `RESEND_API_KEY`（任意。メール通知を有効化する場合）
- `NOTIFICATION_EMAIL_TO`（任意。通知メール送信先）
- `NOTIFICATION_EMAIL_FROM`（任意。通知メール送信元。Resendで検証済みドメインが必要）
- `RATE_LIMIT_WINDOW_MS`（デフォルト: 60000）
- `RATE_LIMIT_MAX_REQUESTS`（デフォルト: 5）
- `MIN_SUBMIT_SECONDS`（デフォルト: 3）

> `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` は `\n` を含む文字列形式で設定してください。
> VercelのEnvironment Variablesに登録する際、値の先頭/末尾に`"`（ダブルクォーテーション）を含めないでください。
> `"-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----"` のように囲むと認証エラーの原因になります。

## Google Sheets準備

1. 対象スプレッドシートを作成
2. サービスアカウントに編集権限を共有
3. シート名を `GOOGLE_SHEET_NAME` に合わせる
4. API有効化（Google Sheets API）

### シート推奨列順（現行実装）

`type`, `timestamp`, `name_or_anonymous_or_discord`, `category`, `mood`, `message_or_claim_note`, `ip`, `submitted_at`, `is_anonymous`, `reward_type`

- `type=feedback` の行: 通常のフィードバック投稿
- `type=reward-claim` の行: 当選時の特典申請

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
