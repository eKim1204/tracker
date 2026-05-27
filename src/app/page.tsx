'use client';

import { useState, useCallback, useEffect } from 'react';
import { Friend, FriendStats, LoLMatchSummary } from '@/lib/types';
import FriendCard from '@/components/FriendCard';
import SoloRankLeaderboard from '@/components/SoloRankLeaderboard';
import { getStreak, getRankedDisplay } from '@/lib/utils';
import { FRIEND_COLORS } from '@/lib/friend-colors';

const FRIENDS: Friend[] = [
  { id: '1', displayName: '서현우',  lolRiotId: '이제는 안녕#억거남' },
  { id: '2', displayName: '안석호',  lolRiotId: '슈회빙#1111' },
  { id: '3', displayName: '장지환',  lolRiotId: '늑대폭탄#KR 1' },
  { id: '4', displayName: '박예선',  lolRiotId: 'SuperSexyGuy#KR1' },
  { id: '5', displayName: '조윤석',  lolRiotId: '조윤석#원딜1' },
  { id: '6', displayName: '김현기',  lolRiotId: '바퀴 인터넷 항생제#kr 1' },
];

async function fetchLolStats(friend: Friend) {
  if (!friend.lolRiotId) return null;
  const [gameName, tagLine] = friend.lolRiotId.split('#');
  if (!gameName || !tagLine) return null;

  const accountRes = await fetch(
    `/api/riot/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
  );
  if (!accountRes.ok) {
    const body = await accountRes.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${accountRes.status}`);
  }
  const account = await accountRes.json();

  const [summonerRes, spectatorRes] = await Promise.all([
    fetch(`/api/riot/summoner?puuid=${encodeURIComponent(account.puuid)}`),
    fetch(`/api/riot/spectator?puuid=${encodeURIComponent(account.puuid)}`),
  ]);

  if (!summonerRes.ok) throw new Error('소환사 정보를 불러올 수 없습니다');
  const summoner = await summonerRes.json();
  const spectatorData = spectatorRes.ok ? await spectatorRes.json() : { inGame: false };

  const [rankedRes, matchesRes] = await Promise.all([
    fetch(`/api/riot/ranked?puuid=${encodeURIComponent(account.puuid)}`),
    fetch(`/api/riot/matches?puuid=${encodeURIComponent(account.puuid)}`),
  ]);

  if (!rankedRes.ok) {
    const err = await rankedRes.json().catch(() => ({}));
    throw new Error(`랭크 조회 실패: ${err.error ?? rankedRes.status}`);
  }
  const ranked = await rankedRes.json();
  const matches = matchesRes.ok ? await matchesRes.json() : [];

  return { account, summoner, ranked, matches, inGame: spectatorData.inGame ?? false };
}

async function fetchPubgStats(friend: Friend) {
  if (!friend.pubgName) return null;
  const res = await fetch(
    `/api/pubg/player?name=${encodeURIComponent(friend.pubgName)}&platform=${friend.pubgPlatform ?? 'steam'}`
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'PUBG 데이터를 불러올 수 없습니다');
  }
  return res.json();
}

async function loadFriendStats(friend: Friend): Promise<FriendStats> {
  const [lolResult, pubgResult] = await Promise.allSettled([
    fetchLolStats(friend),
    fetchPubgStats(friend),
  ]);

  return {
    friend,
    lol: lolResult.status === 'fulfilled' ? lolResult.value : null,
    pubg: pubgResult.status === 'fulfilled' ? pubgResult.value : null,
    errors: {
      lol: lolResult.status === 'rejected' ? (lolResult.reason as Error).message : undefined,
      pubg: pubgResult.status === 'rejected' ? (pubgResult.reason as Error).message : undefined,
    },
  };
}

function buildHighlights(statsMap: Record<string, FriendStats>): string[] {
  const chips: string[] = [];

  for (const friend of FRIENDS) {
    const s = statsMap[friend.id];
    if (!s?.lol) continue;

    if (s.lol.inGame) {
      chips.push(`⚔️ ${friend.displayName} 게임 중`);
    }

    const streak = getStreak(s.lol.matches);
    if (streak && streak.count >= 2) {
      const icon = streak.type === 'win' ? '🔥' : '💀';
      const label = streak.type === 'win' ? '연승 중' : '연패 중';
      chips.push(`${icon} ${friend.displayName} ${streak.count}${label}`);
    }

    const { solo } = getRankedDisplay(s.lol.ranked);
    if (solo?.hotStreak) {
      chips.push(`🔥 ${friend.displayName} 핫스트릭`);
    }
  }

  return chips;
}

export default function Home() {
  const [statsMap, setStatsMap] = useState<Record<string, FriendStats>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshFriend = useCallback(async (friend: Friend) => {
    setLoadingMap((m) => ({ ...m, [friend.id]: true }));
    try {
      const stats = await loadFriendStats(friend);
      setStatsMap((m) => ({ ...m, [friend.id]: stats }));
      setLastUpdated(new Date());
    } finally {
      setLoadingMap((m) => ({ ...m, [friend.id]: false }));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all(FRIENDS.map((friend) => refreshFriend(friend)));
  }, [refreshFriend]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const allLoading = FRIENDS.some((f) => loadingMap[f.id]);
  const highlights = buildHighlights(statsMap);

  return (
    <div className="min-h-screen dot-grid-bg text-white">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-[#0d0d2b]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/%EC%84%9D%ED%98%B8%20%EC%82%AC%EC%A7%84.jpg"
              alt="석호"
              className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400/50"
            />
            <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              롤펀맨 Tracker
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-slate-600 text-xs hidden sm:block">
                {lastUpdated.toLocaleTimeString('ko-KR')} 업데이트
              </span>
            )}
            <button
              onClick={refreshAll}
              disabled={allLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors disabled:opacity-40"
            >
              <svg
                className={`w-3.5 h-3.5 ${allLoading ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              전체 새로고침
            </button>
          </div>
        </div>

        {/* Highlights banner */}
        {highlights.length > 0 && (
          <div className="border-t border-white/5 bg-[#0d0d2b]/60">
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
              <span className="text-slate-600 text-xs shrink-0">오늘의 하이라이트</span>
              {highlights.map((chip, i) => (
                <span
                  key={i}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-slate-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* 친구 카드 목록 */}
          <div className="flex-1 min-w-0 grid gap-4">
            {FRIENDS.map((friend) => {
              const stats = statsMap[friend.id] ?? {
                friend,
                lol: null,
                pubg: null,
                errors: {},
              };
              return (
                <FriendCard
                  key={friend.id}
                  stats={stats}
                  loading={loadingMap[friend.id] ?? false}
                  onRefresh={() => refreshFriend(friend)}
                  color={FRIEND_COLORS[friend.id] ?? '#888'}
                />
              );
            })}
          </div>

          {/* 랭크 순위 사이드바 */}
          <div className="w-full md:w-72 md:shrink-0 md:sticky md:top-20">
            <SoloRankLeaderboard statsMap={statsMap} loadingMap={loadingMap} />
          </div>
        </div>
      </main>
    </div>
  );
}
