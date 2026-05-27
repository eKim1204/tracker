export async function riotFetch(
  url: string,
  apiKey: string,
  retries = 3
): Promise<{ statusCode: number; data: unknown }> {
  const res = await fetch(url, {
    headers: { 'x-riot-token': apiKey },
    cache: 'no-store',
  });

  if (res.status === 429 && retries > 0) {
    const wait = (Number(res.headers.get('retry-after') ?? 10) + 1) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    return riotFetch(url, apiKey, retries - 1);
  }

  const data = await res.json().catch(() => null);
  return { statusCode: res.status, data };
}
