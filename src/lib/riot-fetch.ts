import https from 'https';

export async function riotFetch(
  url: string,
  apiKey: string,
  retries = 3
): Promise<{ statusCode: number; data: unknown }> {
  const { statusCode, headers, data } = await new Promise<{
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    data: unknown;
  }>((resolve, reject) => {
    const req = https.get(url, { headers: { 'x-riot-token': apiKey } }, (res) => {
      let raw = '';
      res.on('data', (chunk: string) => { raw += chunk; });
      res.on('end', () => {
        let parsed: unknown = null;
        try { parsed = JSON.parse(raw); } catch { /* ignore */ }
        resolve({
          statusCode: res.statusCode ?? 500,
          headers: res.headers as Record<string, string | string[] | undefined>,
          data: parsed,
        });
      });
    });
    req.on('error', reject);
  });

  if (statusCode === 429 && retries > 0) {
    const retryAfter = headers['retry-after'];
    const wait = (Number(retryAfter ?? 10) + 1) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    return riotFetch(url, apiKey, retries - 1);
  }

  return { statusCode, data };
}
