import { google } from 'googleapis';
import type { FeedbackInput, RewardClaimInput } from '@/lib/validation';

type SheetsConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
};

function createSheetsClient(config: SheetsConfig) {
  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

export async function appendFeedbackToSheet(config: SheetsConfig, feedback: FeedbackInput, ip: string | null) {
  const sheets = createSheetsClient(config);
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!A:J`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'feedback',
        new Date().toISOString(),
        feedback.isAnonymous ? '匿名' : feedback.name ?? '',
        feedback.category,
        feedback.mood ?? '',
        feedback.message,
        ip ?? '',
        feedback.submittedAt,
        feedback.isAnonymous ? 'yes' : 'no',
        ''
      ]]
    }
  });
}

export async function appendRewardClaimToSheet(config: SheetsConfig, claim: RewardClaimInput, ip: string | null) {
  const sheets = createSheetsClient(config);

  const rewardLabel = claim.rewardType === 'token' ? '独自トークン' : 'ポイント';
  const memberLabel = claim.memberType === 'member' ? '会員' : '非会員';

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!A:J`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'reward-claim',
        new Date().toISOString(),
        claim.discordId,
        'lottery',
        '',
        `${memberLabel}当選`,
        ip ?? '',
        '',
        '',
        rewardLabel
      ]]
    }
  });
}
