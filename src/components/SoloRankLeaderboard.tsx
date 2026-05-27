'use client';

import { useState } from 'react';
import { FriendStats } from '@/lib/types';
import { getRankedDisplay, soloRankScore, formatWinRate, TIER_COLORS } from '@/lib/utils';

interface Props {
  statsMap: Record<string, FriendStats>;
  loadingMap: Record<string, boolean>;
}

const ROW_BG: Record<number, string> = {
  0: 'rgba(255,215,0,0.07)',
  1: 'rgba(192,192,192,0.05)',
  2: 'rgba(205,127,50,0.05)',
};

const LP_MAX = 100;

export default function RankLeaderboard({ statsMap, loadingMap }: Props) {
  const [queue, setQueue] = useState<'solo' | 'flex'>('solo');
  const isSolo = queue === 'solo';

  const entries = Object.values(statsMap)
    .map((s) => {
      const ranked = s.lol ? getRankedDisplay(s.lol.ranked) : { solo: undefined, flex: undefined };
      const entry = isSolo ? ranked.solo : ranked.flex;
      return { name: s.friend.displayName, entry, score: soloRankScore(entry) };
    })
    .sort((a, b) => b.score - a.score);

  const anyLoading = Object.values(loadingMap).some(Boolean);

  return (
    <div className="bg-[#0d0d2b] border border-white/8 rounded-xl overflow-hidden">
      {/* Tab header */}
      <div className="px-4 pt-3 pb-0 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setQueue('solo')}
            className={`text-xs font-bold px-3 py-1.5 rounded-t-lg transition-colors ${
              isSolo ? 'bg-white/8 text-white border border-b-0 border-white/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🏆 솔로
          </button>
          <button
            onClick={() => setQueue('flex')}
            className={`text-xs font-bold px-3 py-1.5 rounded-t-lg transition-colors ${
              !isSolo ? 'bg-white/8 text-white border border-b-0 border-white/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🎖️ 자유
          </button>
        </div>
        {anyLoading && (
          <svg className="w-3.5 h-3.5 text-slate-600 animate-spin mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {entries.length === 0 ? (
          <div className="px-4 py-6 text-center text-slate-600 text-sm">로딩 중...</div>
        ) : (
          entries.map((e, idx) => {
            const ranked = !!e.entry;
            const medal = idx === 0 && ranked ? '🥇' : idx === 1 && ranked ? '🥈' : idx === 2 && ranked ? '🥉' : null;
            const color = e.entry ? (TIER_COLORS[e.entry.tier] ?? '#888') : '#4b5563';
            const isApex = e.entry && ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(e.entry.tier);
            const lpPct = e.entry && !isApex ? Math.min((e.entry.leaguePoints / LP_MAX) * 100, 100) : null;

            return (
              <div
                key={e.name}
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ background: ROW_BG[idx] ?? 'transparent' }}
              >
                <div className="w-5 text-center shrink-0">
                  {medal ? (
                    <span className="text-sm">{medal}</span>
                  ) : (
                    <span className="text-slate-600 text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{e.name}</div>
                  {e.entry ? (
                    <>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="text-[11px] font-bold px-1.5 py-px rounded-full border"
                          style={{ color, borderColor: `${color}50`, background: `${color}15` }}
                        >
                          {e.entry.tier} {!isApex && e.entry.rank}
                        </span>
                        <span className="text-slate-500 text-[10px]">{e.entry.leaguePoints}LP</span>
                      </div>
                      {lpPct !== null && (
                        <div className="mt-1 h-0.5 rounded-full bg-white/5 overflow-hidden w-full">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${lpPct}%`, background: color }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-600 text-[11px]">배치 안함</div>
                  )}
                </div>

                {e.entry && (
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-semibold" style={{ color }}>
                      {formatWinRate(e.entry.wins, e.entry.losses)}
                    </div>
                    <div className="text-slate-600 text-[10px]">
                      {e.entry.wins}W {e.entry.losses}L
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
