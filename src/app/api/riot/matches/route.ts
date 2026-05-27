import { NextRequest, NextResponse } from 'next/server';
import { riotFetch } from '@/lib/riot-fetch';
import { LoLMatchSummary } from '@/lib/types';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: NextRequest) {
  const puuid = req.nextUrl.searchParams.get('puuid');
  if (!puuid) return NextResponse.json({ error: 'puuid required' }, { status: 400 });
  if (!RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY not configured' }, { status: 500 });

  const { statusCode, data: matchIds } = await riotFetch(
    `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=10`,
    RIOT_API_KEY
  );
  if (statusCode !== 200) return NextResponse.json({ error: `Riot API error: ${statusCode}` }, { status: 502 });
  if ((matchIds as string[]).length === 0) return NextResponse.json([]);

  const summaries: LoLMatchSummary[] = [];
  for (const id of matchIds as string[]) {
    const { statusCode: s, data: match } = await riotFetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${id}`,
      RIOT_API_KEY
    );
    if (s !== 200) continue;

    const m = match as any;
    const participant = m.info.participants.find((p: { puuid: string }) => p.puuid === puuid);
    if (!participant) continue;

    summaries.push({
      matchId: m.metadata.matchId,
      championName: participant.championName,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      win: participant.win,
      gameDuration: m.info.gameDuration,
      gameCreation: m.info.gameCreation,
      queueId: m.info.queueId,
    });
  }

  return NextResponse.json(summaries);
}
