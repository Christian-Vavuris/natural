const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

type Hit = { count: number; windowStart: number };

// In-memory store. Resets on redeploy / cold start restart — acceptable for v1.
// Swap for Upstash Redis if traffic grows past a single-instance deployment.
const hits = new Map<string, Hit>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const hit = hits.get(ip);

  if (!hit || now - hit.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (hit.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  hit.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - hit.count };
}
