const ipStore = new Map<string, number[]>();

export function isRateLimited(ip: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now();
  const previous = ipStore.get(ip) ?? [];
  const active = previous.filter((timestamp) => now - timestamp < windowMs);

  if (active.length >= maxRequests) {
    ipStore.set(ip, active);
    return true;
  }

  active.push(now);
  ipStore.set(ip, active);
  return false;
}

export function isTooFast(submittedAtIso: string, minSubmitSeconds: number): boolean {
  const submittedAt = new Date(submittedAtIso).getTime();
  const now = Date.now();
  if (Number.isNaN(submittedAt)) {
    return true;
  }

  return (now - submittedAt) / 1000 < minSubmitSeconds;
}

export function clearRateLimitStore() {
  ipStore.clear();
}
