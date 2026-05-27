import { NextRequest, NextResponse } from 'next/server';
import { riotFetch } from '@/lib/riot-fetch';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');

  if (!gameName || !tagLine) return NextResponse.json({ error: 'gameName and tagLine required' }, { status: 400 });
  if (!RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY not configured' }, { status: 500 });

  let statusCode: number;
  let data: unknown;
  try {
    ({ statusCode, data } = await riotFetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      RIOT_API_KEY
    ));
  } catch (err) {
    console.error('[account] riotFetch threw:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  if (statusCode !== 200) {
    const msg =
      statusCode === 404 ? '존재하지 않는 소환사 (404)' :
      statusCode === 403 ? 'API 키 만료 또는 권한 없음 (403)' :
      `Riot API 오류 (${statusCode})`;
    return NextResponse.json({ error: msg }, { status: statusCode === 404 ? 404 : 502 });
  }

  return NextResponse.json(data);
}
