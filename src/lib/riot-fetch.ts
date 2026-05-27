import https from 'node:https';

export async function riotFetch(
  url: string,
  apiKey: string,
  retries = 3
): Promise<{ statusCode: number; data: unknown }> {
  const parsedUrl = new URL(url);

  const { statusCode, headers, data } = await new Promise<{
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    data: unknown;
  }>((resolve, reject) => {
    const req = https.get(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: { 'x-riot-token': apiKey },
      },
      (res) => {
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
      }
    );
    req.on('error', reject);
  });

  if (statusCode === 429 && retries > 0) {
    const wait = (Number(headers['retry-after'] ?? 10) + 1) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    return riotFetch(url, apiKey, retries - 1);
  }

  return { statusCode, data };
}
