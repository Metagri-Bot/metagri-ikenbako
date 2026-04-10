import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1),
  GOOGLE_SPREADSHEET_ID: z.string().min(1),
  GOOGLE_SHEET_NAME: z.string().min(1).default('feedback'),
  APP_URL: z.string().url().optional(),
  NOTIFICATION_WEBHOOK_URL: z.string().url().optional(),
  NOTIFICATION_TO_ADDRESS: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  NOTIFICATION_EMAIL_TO: z.string().email().optional(),
  NOTIFICATION_EMAIL_FROM: z.string().email().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(5),
  MIN_SUBMIT_SECONDS: z.coerce.number().int().positive().default(3)
});

export function getEnv() {
  return envSchema.parse(process.env);
}
