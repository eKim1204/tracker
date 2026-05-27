const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3분

// 동시 요청 최대 8개 제한
let active = 0;
const waitQueue: (() => void)[] = [];

function acquireSlot(): Promise<void> {
  if (active < 8) { active++; return Promise.resolve(); }
  return new Promise<void>((r) => waitQueue.push(r));
}

function releaseSlot() {
  const next = waitQueue.shift();
  if (next) { next(); } else { active--; }
}

export async function riotFetch(
  url: string,
  apiKey: string,
  retries = 3
): Promise<{ statusCode: number; data: unknown }> {
  const cached = cache.get(url);
  if (cached && Date.now() < cached.expires) {
    return { statusCode: 200, data: cached.data };
  }

  await acquireSlot();
  try {
    const res = await fetch(url, {
      headers: { 'x-riot-token': apiKey },
      cache: 'no-store',
    });

    if (res.status === 429 && retries > 0) {
      const retryAfter = Number(res.headers.get('retry-after') ?? 1);
      await new Promise((r) => setTimeout(r, (retryAfter + 1) * 1000));
      return riotFetch(url, apiKey, retries - 1);
    }

    const data = await res.json().catch(() => null);
    if (res.status === 200) {
      cache.set(url, { data, expires: Date.now() + CACHE_TTL });
    }
    return { statusCode: res.status, data };
  } finally {
    releaseSlot();
  }
}
