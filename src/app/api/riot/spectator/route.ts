import { NextRequest, NextResponse } from 'next/server';
import { riotFetch } from '@/lib/riot-fetch';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: NextRequest) {
  const puuid = req.nextUrl.searchParams.get('puuid');
  if (!puuid) return NextResponse.json({ error: 'puuid required' }, { status: 400 });
  if (!RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY not configured' }, { status: 500 });

  const { statusCode, data } = await riotFetch(
    `https://kr.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}`,
    RIOT_API_KEY
  );

  if (statusCode === 404) return NextResponse.json({ inGame: false });
  if (statusCode !== 200) return NextResponse.json({ inGame: false });

  const d = data as { gameMode: string; gameLength: number };
  return NextResponse.json({ inGame: true, gameMode: d.gameMode, gameLength: d.gameLength });
}
