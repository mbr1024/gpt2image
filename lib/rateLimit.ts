const rateLimitMap = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 分钟窗口
const MAX_REQUESTS = 10;  // 每窗口最大请求数

/**
 * 检查是否超出限流
 * 返回 { allowed, retryAfter }
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) ?? [];

  // 清理过期记录
  const valid = timestamps.filter(t => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    const oldest = valid[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    rateLimitMap.set(key, valid);
    return { allowed: false, retryAfter };
  }

  valid.push(now);
  rateLimitMap.set(key, valid);
  return { allowed: true, retryAfter: 0 };
}

// 定期清理过期 key，防止内存泄漏
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap) {
    const valid = timestamps.filter(t => now - t < WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }
}, 60_000);
