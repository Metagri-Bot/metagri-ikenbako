import { describe, expect, it } from 'vitest';
import { feedbackSchema } from '@/lib/validation';

describe('feedbackSchema', () => {
  it('匿名投稿は名前なしで通る', () => {
    const result = feedbackSchema.safeParse({
      isAnonymous: true,
      name: '',
      category: 'idea',
      message: 'これは十分な長さのフィードバックです。',
      submittedAt: new Date(Date.now() - 5000).toISOString(),
      honeypot: ''
    });

    expect(result.success).toBe(true);
  });

  it('非匿名投稿で名前が空の場合は失敗する', () => {
    const result = feedbackSchema.safeParse({
      isAnonymous: false,
      name: '',
      category: 'feature',
      message: 'これは十分な長さのフィードバックです。',
      submittedAt: new Date(Date.now() - 5000).toISOString(),
      honeypot: ''
    });

    expect(result.success).toBe(false);
  });
});
