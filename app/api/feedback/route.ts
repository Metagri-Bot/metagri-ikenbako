import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { isRateLimited, isTooFast } from '@/lib/rate-limit';
import { appendFeedbackToSheet } from '@/lib/sheets';
import { feedbackSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const env = getEnv();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip, env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX_REQUESTS)) {
    return NextResponse.json({ message: '短時間での送信が多すぎます。しばらく待って再試行してください。' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON形式が不正です' }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((issue) => issue.message).join(' / ') },
      { status: 400 }
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ message: 'スパムとしてブロックされました' }, { status: 400 });
  }

  if (isTooFast(parsed.data.submittedAt, env.MIN_SUBMIT_SECONDS)) {
    return NextResponse.json({ message: '送信が速すぎます。数秒待ってから送信してください。' }, { status: 400 });
  }

  try {
    await appendFeedbackToSheet(
      {
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        sheetName: env.GOOGLE_SHEET_NAME
      },
      parsed.data,
      ip
    );

    return NextResponse.json({ message: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('[feedback-api] failed to append to sheet', error);
    return NextResponse.json({ message: '保存に失敗しました' }, { status: 500 });
  }
}
