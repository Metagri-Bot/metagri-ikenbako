type RewardClaimNotificationParams = {
  webhookUrl: string;
  toAddress: string;
  discordId: string;
  memberType: 'member' | 'guest';
  rewardType: 'token' | 'point';
  ip: string;
};

export async function notifyRewardClaim(params: RewardClaimNotificationParams) {
  const memberLabel = params.memberType === 'member' ? '会員' : '非会員';
  const rewardLabel = params.rewardType === 'token' ? '独自トークン' : 'ポイント';

  const message = [
    '🎯 当選情報が入力されました',
    `通知先: ${params.toAddress}`,
    `Discord ID: ${params.discordId}`,
    `会員区分: ${memberLabel}`,
    `特典: ${rewardLabel}`,
    `IP: ${params.ip}`
  ].join('\n');

  const response = await fetch(params.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message })
  });

  if (!response.ok) {
    throw new Error(`notification failed: ${response.status}`);
  }
}
