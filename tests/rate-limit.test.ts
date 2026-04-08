import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRateLimitStore, isRateLimited, isTooFast } from '@/lib/rate-limit';

describe('rate limit', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it('上限までは許可される', () => {
    expect(isRateLimited('1.1.1.1', 60_000, 2)).toBe(false);
    expect(isRateLimited('1.1.1.1', 60_000, 2)).toBe(false);
    expect(isRateLimited('1.1.1.1', 60_000, 2)).toBe(true);
  });

  it('経過秒数が短すぎるとブロックされる', () => {
    vi.useFakeTimers();
    const now = new Date('2026-04-08T00:00:00.000Z');
    vi.setSystemTime(now);

    expect(isTooFast(now.toISOString(), 3)).toBe(true);
    expect(isTooFast(new Date(now.getTime() - 5_000).toISOString(), 3)).toBe(false);

    vi.useRealTimers();
  });
});
