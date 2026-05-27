export interface Friend {
  id: string;
  displayName: string;
  lolRiotId?: string; // "GameName#TagLine"
  pubgName?: string;
  pubgPlatform?: 'steam' | 'kakao';
}

export interface LoLAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface LoLSummoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  summonerLevel: number;
}

export interface LoLRankedEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
}

export interface LoLMatchSummary {
  matchId: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  gameDuration: number;
  gameCreation: number;
  queueId: number;
}

export interface PubgModeStats {
  kills: number;
  assists: number;
  roundsPlayed: number;
  wins: number;
  top10s: number;
  damageDealt: number;
  headshotKills: number;
  longestKill: number;
}

export interface PubgSeasonStats {
  squad?: PubgModeStats;
  'squad-fpp'?: PubgModeStats;
  solo?: PubgModeStats;
  'solo-fpp'?: PubgModeStats;
  duo?: PubgModeStats;
  'duo-fpp'?: PubgModeStats;
}

export interface FriendStats {
  friend: Friend;
  lol?: {
    account: LoLAccount;
    summoner: LoLSummoner;
    ranked: LoLRankedEntry[];
    matches: LoLMatchSummary[];
    inGame: boolean;
  } | null;
  pubg?: {
    playerId: string;
    playerName: string;
    seasonStats: PubgSeasonStats;
  } | null;
  errors: {
    lol?: string;
    pubg?: string;
  };
}
