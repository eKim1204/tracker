import { NextResponse } from 'next/server';
import { riotFetch } from '@/lib/riot-fetch';

const KEY = process.env.RIOT_API_KEY ?? '';

export async function GET() {
  // 1. Account
  const acct = await riotFetch(
    `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent('이제는 안녕')}/${encodeURIComponent('억거남')}`,
    KEY
  );
  if (acct.statusCode !== 200) return NextResponse.json({ step: 'account', ...acct });
  const puuid = (acct.data as any).puuid as string;

  // 2. Summoner
  const summ = await riotFetch(
    `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
    KEY
  );
  if (summ.statusCode !== 200) return NextResponse.json({ step: 'summoner', ...summ });

  // 전체 summoner 응답 그대로 반환
  return NextResponse.json({
    summStatus: summ.statusCode,
    summData: summ.data,
  });
}
