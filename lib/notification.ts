type RewardClaimPayload = {
  discordId: string;
  memberType: 'member' | 'guest';
  rewardType: 'token' | 'point';
  ip: string;
};

type RewardClaimNotificationParams = {
  webhookUrl?: string;
  emailApiKey?: string;
  emailTo?: string;
  emailFrom?: string;
  payload: RewardClaimPayload;
};

function buildMessage(payload: RewardClaimPayload) {
  const memberLabel = payload.memberType === 'member' ? '会員' : '非会員';
  const rewardLabel = payload.rewardType === 'token' ? '独自トークン' : 'ポイント';

  return [
    '🎯 当選情報が入力されました',
    `Discord ID: ${payload.discordId}`,
    `会員区分: ${memberLabel}`,
    `特典: ${rewardLabel}`,
    `IP: ${payload.ip}`
  ].join('\n');
}

async function sendWebhookNotification(webhookUrl: string, message: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      content: message,
      message
    })
  });

  if (!response.ok) {
    throw new Error(`webhook notification failed: ${response.status}`);
  }
}

async function sendEmailNotification(apiKey: string, to: string, from: string, message: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: '【Metagri】当選情報が入力されました',
      text: message
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`email notification failed: ${response.status} ${body}`);
  }
}

export async function notifyRewardClaim(params: RewardClaimNotificationParams) {
  const message = buildMessage(params.payload);

  const jobs: Promise<void>[] = [];
  if (params.webhookUrl) {
    jobs.push(sendWebhookNotification(params.webhookUrl, message));
  }

  if (params.emailApiKey && params.emailTo && params.emailFrom) {
    jobs.push(sendEmailNotification(params.emailApiKey, params.emailTo, params.emailFrom, message));
  }

  if (jobs.length === 0) {
    throw new Error('no notification channel configured');
  }

  await Promise.all(jobs);
}
