'use client';

import { useMemo, useState } from 'react';

const categories = [
  { value: 'bug', label: '不具合' },
  { value: 'feature', label: '機能要望' },
  { value: 'idea', label: 'アイデア' },
  { value: 'other', label: 'その他' }
] as const;

type FormState = {
  isAnonymous: boolean;
  name: string;
  email: string;
  category: (typeof categories)[number]['value'];
  message: string;
  honeypot: string;
};

export function FeedbackForm() {
  const [form, setForm] = useState<FormState>({
    isAnonymous: true,
    name: '',
    email: '',
    category: 'idea',
    message: '',
    honeypot: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const submittedAt = useMemo(() => new Date().toISOString(), []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submittedAt })
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? '送信に失敗しました');
      }

      setStatus('フィードバックを送信しました。ありがとうございます！');
      setForm((previous) => ({ ...previous, name: '', email: '', message: '', honeypot: '' }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '送信エラーが発生しました');
    } finally {
      setLoading(false);
    }
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
        <label htmlFor="email">メールアドレス（任意）</label>
        <input
          id="email"
          type="email"
          maxLength={100}
          value={form.email}
          onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
        />
      </div>

      <div className="row">
        <label htmlFor="category">カテゴリ</label>
        <select
          id="category"
          value={form.category}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, category: event.target.value as FormState['category'] }))
          }
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
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
      {status ? <p className="status">{status}</p> : null}
    </form>
  );
}
