import { LoLRankedEntry, LoLMatchSummary, PubgModeStats } from './types';

export const TIER_ORDER = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM',
  'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER',
];

export const TIER_COLORS: Record<string, string> = {
  IRON: '#8B8B8B',
  BRONZE: '#CD7F32',
  SILVER: '#A8A9AD',
  GOLD: '#FFD700',
  PLATINUM: '#4BC4A1',
  EMERALD: '#50C878',
  DIAMOND: '#7FB3D3',
  MASTER: '#9B59B6',
  GRANDMASTER: '#FF4444',
  CHALLENGER: '#00D4FF',
};

export function getRankedDisplay(entries: LoLRankedEntry[]) {
  const solo = entries.find((e) => e.queueType === 'RANKED_SOLO_5x5');
  const flex = entries.find((e) => e.queueType === 'RANKED_FLEX_SR');
  return { solo, flex };
}

export function formatWinRate(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return '0%';
  return `${Math.round((wins / total) * 100)}%`;
}

export function formatKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

export function getPubgKD(stats: PubgModeStats): string {
  if (stats.roundsPlayed === 0) return '0.00';
  const deaths = stats.roundsPlayed - stats.wins;
  if (deaths <= 0) return stats.kills.toFixed(2);
  return (stats.kills / deaths).toFixed(2);
}

export function getPubgWinRate(stats: PubgModeStats): string {
  if (stats.roundsPlayed === 0) return '0%';
  return `${Math.round((stats.wins / stats.roundsPlayed) * 100)}%`;
}

export function getPubgAvgDamage(stats: PubgModeStats): string {
  if (stats.roundsPlayed === 0) return '0';
  return Math.round(stats.damageDealt / stats.roundsPlayed).toLocaleString();
}

export function getChampionIconUrl(championName: string, version = '14.24.1'): string {
  const cleanName = championName.replace(/[^a-zA-Z0-9]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${cleanName}.png`;
}

export function getProfileIconUrl(iconId: number, version = '14.24.1'): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
}

const RANK_NUMS: Record<string, number> = { I: 4, II: 3, III: 2, IV: 1 };

export function soloRankScore(entry: LoLRankedEntry | undefined): number {
  if (!entry) return -1;
  const tierIdx = TIER_ORDER.indexOf(entry.tier);
  const rankNum = RANK_NUMS[entry.rank] ?? 0;
  return tierIdx * 10000 + rankNum * 1000 + entry.leaguePoints;
}

export function getQueueLabel(queueId: number): string {
  switch (queueId) {
    case 420: return '솔랭';
    case 440: return '자유랭';
    case 450: return '칼바람';
    case 400: return '일반';
    case 430: return '일반';
    case 700: return '격전';
    case 900: return 'URF';
    case 1020: return '단일챔';
    case 1300: return '넥서스';
    default:  return '기타';
  }
}

export function getQueueColor(queueId: number): string {
  switch (queueId) {
    case 420: return '#facc15';  // 솔랭 - yellow
    case 440: return '#60a5fa';  // 자유랭 - blue
    case 450: return '#34d399';  // 칼바람 - green
    default:  return '#9ca3af';  // 나머지 - gray
  }
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getStreak(matches: LoLMatchSummary[]): { type: 'win' | 'lose'; count: number } | null {
  if (matches.length === 0) return null;
  const first = matches[0].win;
  let count = 0;
  for (const m of matches) {
    if (m.win === first) count++;
    else break;
  }
  if (count < 2) return null;
  return { type: first ? 'win' : 'lose', count };
}

export function getAutoTitle(solo: { tier: string; rank: string; leaguePoints: number; wins: number; losses: number; hotStreak: boolean } | undefined): string | null {
  if (!solo) return null;
  const tier = solo.tier;
  if (tier === 'CHALLENGER') return '챌린저';
  if (tier === 'GRANDMASTER') return '그랜드마스터';
  if (tier === 'MASTER') return '마스터';
  const total = solo.wins + solo.losses;
  const wr = total > 0 ? solo.wins / total : 0;
  if (solo.hotStreak) return '연승중';
  if (wr >= 0.6 && total >= 30) return '강자';
  if (wr < 0.4 && total >= 30) return '하락세';
  if (total < 10) return '신규';
  return null;
}
