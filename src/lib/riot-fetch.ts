import { request as undiciRequest } from 'undici';

export async function riotFetch(
  url: string,
  apiKey: string,
  retries = 3
): Promise<{ statusCode: number; data: unknown }> {
  const { statusCode, headers, body } = await undiciRequest(url, {
    headers: { 'x-riot-token': apiKey },
  });
  const data = await body.json().catch(() => null);

  if (statusCode === 429 && retries > 0) {
    const wait = (Number(headers['retry-after'] ?? 10) + 1) * 1000;
    console.log(`[riot] 429 rate limit — waiting ${wait / 1000}s then retrying...`);
    await new Promise((r) => setTimeout(r, wait));
    return riotFetch(url, apiKey, retries - 1);
  }

  return { statusCode, data };
}
