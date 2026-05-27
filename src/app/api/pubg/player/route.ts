import { NextRequest, NextResponse } from 'next/server';

const PUBG_API_KEY = process.env.PUBG_API_KEY;
const BASE = 'https://api.pubg.com';

const HEADERS = () => ({
  Authorization: `Bearer ${PUBG_API_KEY}`,
  Accept: 'application/vnd.api+json',
});

async function getCurrentSeason(platform: string): Promise<string> {
  const res = await fetch(`${BASE}/shards/${platform}/seasons`, {
    headers: HEADERS(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Seasons API error: ${res.status}`);
  const data = await res.json();
  const current = data.data.find(
    (s: { attributes: { isCurrentSeason: boolean } }) => s.attributes.isCurrentSeason
  );
  if (!current) throw new Error('No current season found');
  return current.id;
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  const platform = req.nextUrl.searchParams.get('platform') || 'steam';

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!PUBG_API_KEY) return NextResponse.json({ error: 'PUBG_API_KEY not configured' }, { status: 500 });

  const playersRes = await fetch(
    `${BASE}/shards/${platform}/players?filter[playerNames]=${encodeURIComponent(name)}`,
    { headers: HEADERS(), next: { revalidate: 300 } }
  );

  if (playersRes.status === 404 || playersRes.status === 422) {
    return NextResponse.json({ error: '플레이어를 찾을 수 없습니다' }, { status: 404 });
  }
  if (!playersRes.ok) {
    return NextResponse.json({ error: `PUBG API error: ${playersRes.status}` }, { status: 502 });
  }

  const playersData = await playersRes.json();
  const player = playersData.data?.[0];
  if (!player) return NextResponse.json({ error: '플레이어를 찾을 수 없습니다' }, { status: 404 });

  const playerId = player.id;
  const playerName = player.attributes.name;

  const seasonId = await getCurrentSeason(platform);

  const statsRes = await fetch(
    `${BASE}/shards/${platform}/players/${playerId}/seasons/${seasonId}`,
    { headers: HEADERS(), next: { revalidate: 300 } }
  );

  if (!statsRes.ok) {
    return NextResponse.json({ error: `Stats API error: ${statsRes.status}` }, { status: 502 });
  }

  const statsData = await statsRes.json();
  const gameModeStats = statsData.data?.attributes?.gameModeStats ?? {};

  return NextResponse.json({
    playerId,
    playerName,
    seasonStats: {
      squad: gameModeStats['squad'] ?? null,
      'squad-fpp': gameModeStats['squad-fpp'] ?? null,
      solo: gameModeStats['solo'] ?? null,
      'solo-fpp': gameModeStats['solo-fpp'] ?? null,
      duo: gameModeStats['duo'] ?? null,
      'duo-fpp': gameModeStats['duo-fpp'] ?? null,
    },
  });
}
