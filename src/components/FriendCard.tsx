'use client';

import Image from 'next/image';
import { FriendStats, LoLMatchSummary } from '@/lib/types';
import {
  TIER_COLORS,
  getRankedDisplay,
  formatWinRate,
  formatKDA,
  formatDuration,
  timeAgo,
  getChampionIconUrl,
  getProfileIconUrl,
  getQueueLabel,
  getQueueColor,
  getPubgKD,
  getPubgWinRate,
  getPubgAvgDamage,
  getStreak,
  getAutoTitle,
} from '@/lib/utils';

interface Props {
  stats: FriendStats;
  onRefresh: () => void;
  loading: boolean;
  color: string;
}

function MatchBadge({ match }: { match: LoLMatchSummary }) {
  const queueLabel = getQueueLabel(match.queueId);
  const queueColor = getQueueColor(match.queueId);
  const borderColor = match.win ? '#3b82f6' : '#ef4444';

  return (
    <div className="relative group flex flex-col items-center gap-0.5">
      <div
        className="w-11 h-11 rounded-lg overflow-hidden"
        style={{ border: `2px solid ${borderColor}`, boxShadow: `0 0 6px ${borderColor}40` }}
      >
        <Image
          src={getChampionIconUrl(match.championName)}
          alt={match.championName}
          width={44}
          height={44}
          className="object-cover"
          unoptimized
        />
      </div>
      <span className="text-[9px] font-bold px-1 rounded" style={{ color: queueColor }}>
        {queueLabel}
      </span>
      <span className={`text-[10px] font-bold leading-none ${match.win ? 'text-blue-400' : 'text-red-400'}`}>
        {match.win ? 'W' : 'L'}
      </span>
      <span className="text-[10px] text-slate-400 leading-none">
        {match.kills}/{match.deaths}/{match.assists}
      </span>
      <span className="text-[9px] text-slate-600 leading-none">
        {timeAgo(match.gameCreation)}
      </span>

      {/* Hover tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#07071a] border border-white/10 rounded-lg p-2.5 text-xs text-white whitespace-nowrap z-10 shadow-xl">
        <div className="font-semibold mb-1">{match.championName}</div>
        <div className="text-slate-300">
          {match.kills}/{match.deaths}/{match.assists}
          <span className="text-slate-500 ml-1">({formatKDA(match.kills, match.deaths, match.assists)} KDA)</span>
        </div>
        <div className="text-slate-500 mt-0.5">
          {queueLabel} · {formatDuration(match.gameDuration)} · {timeAgo(match.gameCreation)}
        </div>
      </div>
    </div>
  );
}

function TierBadge({ tier, rank, leaguePoints }: { tier: string; rank: string; leaguePoints: number }) {
  const color = TIER_COLORS[tier] ?? '#888';
  const isApex = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}50`, background: `${color}15` }}
    >
      {tier} {!isApex && rank}
      <span className="font-normal opacity-70">{leaguePoints}LP</span>
    </span>
  );
}

function RankBlock({
  label,
  entry,
}: {
  label: string;
  entry: { tier: string; rank: string; leaguePoints: number; wins: number; losses: number; hotStreak: boolean } | undefined;
}) {
  if (!entry) {
    return (
      <div className="flex-1 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
        <div className="text-slate-600 text-xs mb-1">{label}</div>
        <div className="text-slate-500 text-sm">배치 안함</div>
      </div>
    );
  }

  const color = TIER_COLORS[entry.tier] ?? '#888';
  const wr = formatWinRate(entry.wins, entry.losses);
  const total = entry.wins + entry.losses;
  const wrPct = total > 0 ? (entry.wins / total) * 100 : 0;

  return (
    <div className="flex-1 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
      <div className="text-slate-500 text-xs mb-1.5">{label}</div>
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <TierBadge tier={entry.tier} rank={entry.rank} leaguePoints={entry.leaguePoints} />
        {entry.hotStreak && <span className="text-orange-400 text-xs">🔥</span>}
      </div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-semibold" style={{ color }}>{wr}</span>
        <span className="text-slate-600">{entry.wins}W {entry.losses}L</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${wrPct}%`, background: wrPct >= 55 ? '#22c55e' : wrPct >= 45 ? '#facc15' : '#ef4444' }}
        />
      </div>
    </div>
  );
}

export default function FriendCard({ stats, onRefresh, loading, color }: Props) {
  const { friend, lol, pubg, errors } = stats;
  const { solo, flex } = lol ? getRankedDisplay(lol.ranked) : { solo: undefined, flex: undefined };

  const streak = lol ? getStreak(lol.matches) : null;
  const autoTitle = getAutoTitle(solo);

  const squadStats =
    pubg?.seasonStats['squad-fpp'] ??
    pubg?.seasonStats['squad'] ??
    null;

  return (
    <div
      className="bg-[#0d0d2b] border border-white/8 rounded-xl overflow-hidden card-hover"
      style={{ boxShadow: `0 0 0 0 ${color}00` }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${color}25`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${color}00`;
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {/* Color bar */}
      <div className="h-[3px] w-full" style={{ background: color }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          {lol?.summoner && (
            <div className="relative w-12 h-12 shrink-0">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `${color}30`, boxShadow: `0 0 0 2px ${color}` }}
              />
              <Image
                src={getProfileIconUrl(lol.summoner.profileIconId)}
                alt="icon"
                width={48}
                height={48}
                className="rounded-full relative z-10"
                unoptimized
              />
              <span className="absolute -bottom-1 -right-1 z-20 bg-[#0d0d2b] border border-white/10 rounded-full text-[9px] text-slate-400 px-1 leading-4">
                {lol.summoner.summonerLevel}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-base">{friend.displayName}</span>
              {lol?.inGame && (
                <span className="bg-green-500/15 border border-green-500/40 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  IN GAME
                </span>
              )}
              {streak && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                    streak.type === 'win'
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                      : 'bg-red-500/15 border-red-500/40 text-red-400'
                  }`}
                >
                  {streak.type === 'win' ? '🔥' : '💀'} {streak.count}연{streak.type === 'win' ? '승' : '패'}
                </span>
              )}
              {autoTitle && !streak && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  {autoTitle}
                </span>
              )}
            </div>
            <div className="text-slate-600 text-xs mt-0.5">
              {friend.lolRiotId && <span>⚔ {friend.lolRiotId}</span>}
            </div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-slate-500 hover:text-slate-300 rounded-md hover:bg-white/5 transition-colors disabled:opacity-40"
          title="새로고침"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-4 py-6 flex items-center justify-center gap-2 text-slate-500">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm">전적 불러오는 중...</span>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="divide-y divide-white/5">
          {friend.lolRiotId && (
            <div className="px-4 py-3 space-y-3">
              {errors.lol ? (
                <p className="text-red-400 text-sm">{errors.lol}</p>
              ) : lol ? (
                <>
                  {/* Match sequence color bar */}
                  {lol.matches.length > 0 && (
                    <div className="flex items-center gap-1">
                      {lol.matches.map((m) => (
                        <div
                          key={m.matchId}
                          className="h-1.5 flex-1 rounded-full"
                          style={{ background: m.win ? '#3b82f6' : '#ef4444' }}
                          title={m.win ? 'WIN' : 'LOSS'}
                        />
                      ))}
                    </div>
                  )}

                  {/* 솔랭 / 자유랭 나란히 */}
                  <div className="flex gap-2">
                    <RankBlock label="솔로 랭크" entry={solo} />
                    <RankBlock label="자유 랭크" entry={flex} />
                  </div>

                  {/* 최근 5판 */}
                  {lol.matches.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-slate-500 text-xs">최근 {lol.matches.length}판</span>
                        <span className="text-blue-400 text-xs font-medium">
                          {lol.matches.filter((m) => m.win).length}승
                        </span>
                        <span className="text-red-400 text-xs font-medium">
                          {lol.matches.filter((m) => !m.win).length}패
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {lol.matches.map((m) => (
                          <MatchBadge key={m.matchId} match={m} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-sm">데이터 없음</p>
              )}
            </div>
          )}

          {/* PUBG Section */}
          {friend.pubgName && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-orange-400 text-sm">🎯</span>
                <span className="text-orange-400 text-sm font-semibold">PUBG</span>
              </div>
              {errors.pubg ? (
                <p className="text-red-400 text-sm">{errors.pubg}</p>
              ) : pubg && squadStats ? (
                <div className="grid grid-cols-4 gap-3">
                  <Stat label="K/D" value={getPubgKD(squadStats)} />
                  <Stat label="승률" value={getPubgWinRate(squadStats)} />
                  <Stat label="평균 딜" value={getPubgAvgDamage(squadStats)} />
                  <Stat label="판 수" value={squadStats.roundsPlayed.toLocaleString()} />
                </div>
              ) : (
                <p className="text-slate-500 text-sm">스쿼드 전적 없음</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-white font-bold text-base">{value}</div>
      <div className="text-slate-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}
