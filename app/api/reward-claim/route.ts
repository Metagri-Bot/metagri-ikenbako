import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { isRateLimited } from '@/lib/rate-limit';
import { notifyRewardClaim } from '@/lib/notification';
import { appendRewardClaimToSheet } from '@/lib/sheets';
import { rewardClaimSchema } from '@/lib/validation';

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

  const parsed = rewardClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((issue) => issue.message).join(' / ') },
      { status: 400 }
    );
  }

  try {
    await appendRewardClaimToSheet(
      {
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        sheetName: env.GOOGLE_SHEET_NAME
      },
      parsed.data,
      ip
    );

    if (env.NOTIFICATION_WEBHOOK_URL && env.NOTIFICATION_TO_ADDRESS) {
      try {
        await notifyRewardClaim({
          webhookUrl: env.NOTIFICATION_WEBHOOK_URL,
          toAddress: env.NOTIFICATION_TO_ADDRESS,
          discordId: parsed.data.discordId,
          memberType: parsed.data.memberType,
          rewardType: parsed.data.rewardType,
          ip
        });
      } catch (notificationError) {
        console.error('[reward-claim-api] notification failed', notificationError);
      }
    }

    return NextResponse.json({ message: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('[reward-claim-api] failed to append to sheet', error);
    return NextResponse.json({ message: '特典情報の保存に失敗しました' }, { status: 500 });
  }
}
