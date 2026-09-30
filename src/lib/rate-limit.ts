const windows = new Map<string, number[]>();

// Vercel serverless 实例之间不共享内存，这是适合黑客松演示的软限流，
// 不是可靠的跨实例防护；真实成本上限仍应在 OpenAI 控制台设置月度预算。
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (windows.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    windows.set(key, recent);
    return false;
  }
  recent.push(now);
  windows.set(key, recent);
  return true;
}

export function getForwardedIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(?::\d+)?$/i.test(origin)) return true;
  const allowed = (process.env.ALLOWED_ORIGIN || "https://cyberstage.vercel.app")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}
