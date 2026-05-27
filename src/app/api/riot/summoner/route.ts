import { NextRequest, NextResponse } from 'next/server';
import { riotFetch } from '@/lib/riot-fetch';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: NextRequest) {
  const puuid = req.nextUrl.searchParams.get('puuid');
  if (!puuid) return NextResponse.json({ error: 'puuid required' }, { status: 400 });
  if (!RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY not configured' }, { status: 500 });

  const { statusCode, data } = await riotFetch(
    `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
    RIOT_API_KEY
  );

  if (statusCode !== 200) return NextResponse.json({ error: `Riot API error: ${statusCode}` }, { status: 502 });
  return NextResponse.json(data);
}
