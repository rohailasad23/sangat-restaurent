/**
 * Small fixed-window rate limiter kept in memory. It protects a single server instance;
 * on multi-instance hosting put a shared limiter (e.g. Upstash) or a WAF rule in front as well.
 */
type Bucket = { count: number; resetAt: number };
const g = globalThis as unknown as { __rl?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = g.__rl ?? (g.__rl = new Map());

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  return { ok: b.count <= limit, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
