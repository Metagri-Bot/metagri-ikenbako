import { google } from 'googleapis';
import type { FeedbackInput } from '@/lib/validation';

type SheetsConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
};

export async function appendFeedbackToSheet(config: SheetsConfig, feedback: FeedbackInput, ip: string | null) {
  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        new Date().toISOString(),
        feedback.isAnonymous ? '匿名' : feedback.name ?? '',
        feedback.email ?? '',
        feedback.category,
        feedback.message,
        ip ?? '',
        feedback.submittedAt,
        feedback.isAnonymous ? 'yes' : 'no'
      ]]
    }
  });
}
