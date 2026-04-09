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

type FormState = {
  isAnonymous: boolean;
  name: string;
  category: Category;
  mood: string;
  message: string;
  honeypot: string;
};

const defaultForm: FormState = {
  isAnonymous: true,
  name: '',
  category: 'idea',
  mood: '',
  message: '',
  honeypot: ''
};

export function FeedbackForm() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCategory, setSubmittedCategory] = useState<Category | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submittedAt: new Date().toISOString() })
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? '送信に失敗しました');
      }

      setSubmittedCategory(form.category);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '送信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmittedCategory(null);
    setForm(defaultForm);
    setError(null);
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
        <label>いまの気分 <span className="label-optional">（任意）</span></label>
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
