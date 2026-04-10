'use client';

import { useState } from 'react';

const categories = [
  { value: 'opinion', label: '意見', emoji: '💬' },
  { value: 'request', label: '要望', emoji: '✨' },
  { value: 'trouble', label: '困りごと', emoji: '😓' },
  { value: 'idea', label: 'アイデア', emoji: '💡' },
  { value: 'cheer', label: '応援メッセージ', emoji: '🎉' }
] as const;

const moods = [
  { value: 'わくわく', emoji: '🌟' },
  { value: '困ってる', emoji: '😔' },
  { value: '相談したい', emoji: '🗣️' },
  { value: '改善提案', emoji: '🔧' }
];

const successMessages: Record<string, { title: string; body: string }> = {
  opinion: {
    title: 'あなたの声を受け取りました！',
    body: 'あなたの意見がコミュニティを前に進める力になります。心よりありがとうございます。'
  },
  request: {
    title: 'ご要望、しっかり届きました！',
    body: '実現に向けてチームで検討します。声を上げてくれてありがとうございます！'
  },
  trouble: {
    title: '困りごとを聞かせてくれてありがとう！',
    body: '一人で抱え込まないで。一緒に解決策を探していきます。'
  },
  idea: {
    title: '素敵なアイデアが届きました！',
    body: 'あなたの発想がコミュニティの未来を広げます。ありがとうございます！'
  },
  cheer: {
    title: '応援メッセージが届きました！',
    body: 'チーム全員の大きな励みになります。本当にありがとうございます！'
  }
};

type Category = (typeof categories)[number]['value'];
type LotteryOutcome = 'win' | 'lose';

type FormState = {
  isAnonymous: boolean;
  name: string;
  category: Category;
  mood: string;
  message: string;
  honeypot: string;
  submittedAt: string;
};

const categoryBonusRate: Record<Category, number> = {
  opinion: 0.08,
  request: 0.12,
  trouble: 0.1,
  idea: 0.15,
  cheer: 0.05
};

function createDefaultForm(): FormState {
  return {
    isAnonymous: true,
    name: '',
    category: 'idea',
    mood: '',
    message: '',
    honeypot: '',
    submittedAt: new Date().toISOString()
  };
}

export function FeedbackForm() {
  const [form, setForm] = useState<FormState>(() => createDefaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCategory, setSubmittedCategory] = useState<Category | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [lotteryOutcome, setLotteryOutcome] = useState<LotteryOutcome | null>(null);
  const [hasDrawnLottery, setHasDrawnLottery] = useState(false);
  const [discordId, setDiscordId] = useState('');
  const [memberType, setMemberType] = useState<'member' | 'guest' | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [isRewardConfirmed, setIsRewardConfirmed] = useState(false);
  const [isRewardSubmitting, setIsRewardSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? '送信に失敗しました');
      }

      setSubmittedCategory(form.category);
      setSubmittedMessage(form.message);
      setLotteryOutcome(null);
      setHasDrawnLottery(false);
      setDiscordId('');
      setMemberType(null);
      setRewardError(null);
      setIsRewardConfirmed(false);
      setIsRewardSubmitting(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '送信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmittedCategory(null);
    setForm(createDefaultForm());
    setError(null);
    setLotteryOutcome(null);
    setHasDrawnLottery(false);
    setDiscordId('');
    setMemberType(null);
    setRewardError(null);
    setIsRewardConfirmed(false);
    setIsRewardSubmitting(false);
  }

  function computeWinRate(category: Category, message: string) {
    const baseRate = 0.1;
    const lengthRate = Math.min(message.trim().length, 500) / 500 * 0.25;
    const winRate = baseRate + lengthRate + categoryBonusRate[category];
    return Math.min(0.5, winRate);
  }

  function handleLotteryDraw() {
    if (hasDrawnLottery || !submittedCategory) {
      return;
    }

    const winRate = computeWinRate(submittedCategory, submittedMessage);
    setLotteryOutcome(Math.random() < winRate ? 'win' : 'lose');
    setHasDrawnLottery(true);
    setRewardError(null);
    setIsRewardConfirmed(false);
    setIsRewardSubmitting(false);
  }

  async function handleRewardConfirm() {
    if (!discordId.trim()) {
      setRewardError('当選特典の受け取りにはDiscord IDを入力してください。');
      return;
    }

    if (!memberType) {
      setRewardError('会員か非会員かを選択してください。');
      return;
    }

    setRewardError(null);
    setIsRewardSubmitting(true);

    const rewardType = memberType === 'member' ? 'token' : 'point';

    try {
      const response = await fetch('/api/reward-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: discordId.trim(),
          memberType,
          rewardType
        })
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? '特典情報の保存に失敗しました');
      }

      setIsRewardConfirmed(true);
    } catch (claimError) {
      setRewardError(claimError instanceof Error ? claimError.message : '特典情報の保存に失敗しました');
    } finally {
      setIsRewardSubmitting(false);
    }
  }

  if (submittedCategory) {
    const msg = successMessages[submittedCategory];
    const cat = categories.find((c) => c.value === submittedCategory);

    return (
      <div className="success-panel">
        <div className="success-icon">{cat?.emoji}</div>
        <h2 className="success-title">{msg.title}</h2>
        <p className="success-body">{msg.body}</p>
        <p className="success-sub">コミュニティを育てる一票を受け取りました🌱</p>

        <section className="lottery-box" aria-live="polite">
          <h3 className="lottery-title">🎰 投票ありがとう抽選</h3>
          <p className="lottery-note">
            抽選は1回のみです。基本当選率は10%で、投稿文字数とカテゴリに応じて最大50%まで上がります。
          </p>

          <button type="button" className="btn-lottery" onClick={handleLotteryDraw} disabled={hasDrawnLottery}>
            {hasDrawnLottery ? '抽選は完了しました' : '抽選を引く'}
          </button>

          {lotteryOutcome === 'lose' ? (
            <p className="lottery-lose">今回はハズレでした…！もう一度投稿すると再チャレンジできます 🙌</p>
          ) : null}

          {lotteryOutcome === 'win' ? (
            <div className="lottery-win">
              <p className="lottery-win-title">🎉 当選！特典の受け取り情報を入力してください。</p>

              <div className="row">
                <label htmlFor="discordId">Discord ID</label>
                  <input
                    id="discordId"
                    type="text"
                    placeholder="例: metagri_user"
                    value={discordId}
                    disabled={isRewardConfirmed}
                    onChange={(event) => setDiscordId(event.target.value)}
                  />
              </div>

              <div className="row">
                <label>会員ステータス</label>
                <div className="member-chips">
                  <button
                    type="button"
                    className={`chip${memberType === 'member' ? ' chip--active' : ''}`}
                    disabled={isRewardConfirmed}
                    onClick={() => setMemberType('member')}
                  >
                    会員
                  </button>
                  <button
                    type="button"
                    className={`chip${memberType === 'guest' ? ' chip--active' : ''}`}
                    disabled={isRewardConfirmed}
                    onClick={() => setMemberType('guest')}
                  >
                    非会員
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn-lottery"
                onClick={handleRewardConfirm}
                disabled={isRewardSubmitting || isRewardConfirmed}
              >
                {isRewardSubmitting ? '保存中...' : '特典を確定する'}
              </button>

              {rewardError ? <p className="error">{rewardError}</p> : null}

              {isRewardConfirmed ? (
                <div className="reward-panel">
                  <p className="reward-title">受け取り申請を受け付けました！</p>
                  <p className="reward-body">
                    {memberType === 'member'
                      ? '会員特典として独自トークンを付与します。'
                      : '非会員特典としてポイントを付与します。'}
                  </p>
                  <p className="reward-body">続けて参加する場合は「もう一件投稿する」から次の投稿へ進んでください。</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <button type="button" className="btn-reset" onClick={handleReset}>
          もう一件投稿する
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="checkbox">
        <input
          id="anonymous"
          type="checkbox"
          checked={form.isAnonymous}
          onChange={(event) => setForm((previous) => ({ ...previous, isAnonymous: event.target.checked }))}
        />
        <label htmlFor="anonymous">匿名で送信する</label>
      </div>

      <div className="row">
        <label htmlFor="name">お名前</label>
        <input
          id="name"
          type="text"
          maxLength={50}
          disabled={form.isAnonymous}
          required={!form.isAnonymous}
          value={form.name}
          onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
        />
      </div>

      <div className="row">
        <label>投稿種別</label>
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`chip${form.category === cat.value ? ' chip--active' : ''}`}
              onClick={() => setForm((previous) => ({ ...previous, category: cat.value }))}
            >
              <span className="chip-emoji">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <label>
          いまの気分 <span className="label-optional">（任意）</span>
        </label>
        <div className="mood-chips">
          {moods.map((mood) => (
            <button
              key={mood.value}
              type="button"
              className={`chip chip--mood${form.mood === mood.value ? ' chip--active' : ''}`}
              onClick={() =>
                setForm((previous) => ({
                  ...previous,
                  mood: previous.mood === mood.value ? '' : mood.value
                }))
              }
            >
              <span className="chip-emoji">{mood.emoji}</span>
              {mood.value}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <label htmlFor="message">内容</label>
        <textarea
          id="message"
          rows={6}
          minLength={10}
          maxLength={1000}
          required
          value={form.message}
          onChange={(event) => setForm((previous) => ({ ...previous, message: event.target.value }))}
        />
      </div>

      <div aria-hidden className="row" style={{ display: 'none' }}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          value={form.honeypot}
          onChange={(event) => setForm((previous) => ({ ...previous, honeypot: event.target.value }))}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button type="submit" disabled={loading}>{loading ? '送信中...' : '送信する'}</button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
