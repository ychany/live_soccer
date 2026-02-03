// 리그 ID 상수 (API-Football)

// 5대 리그
export const PREMIER_LEAGUE = 39;
export const LA_LIGA = 140;
export const SERIE_A = 135;
export const BUNDESLIGA = 78;
export const LIGUE_1 = 61;

// 유럽 대회
export const CHAMPIONS_LEAGUE = 2;
export const EUROPA_LEAGUE = 3;
export const CONFERENCE_LEAGUE = 848;

// K리그
export const K_LEAGUE_1 = 292;
export const K_LEAGUE_2 = 293;

// 국가대항전
export const WORLD_CUP = 1;
export const EURO = 4;
export const AFCON = 6;
export const COPA_AMERICA = 9;
export const AFC_ASIAN_CUP = 17;

// 컵 대회
export const FA_CUP = 45;
export const EFL_CUP = 48;
export const COPA_DEL_REY = 143;
export const DFB_POKAL = 81;
export const COPPA_ITALIA = 137;
export const COUPE_DE_FRANCE = 66;

// 5대 리그 목록
export const TOP_5_LEAGUES = [
  { id: PREMIER_LEAGUE, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: LA_LIGA, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: SERIE_A, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: BUNDESLIGA, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { id: LIGUE_1, name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
];

// 유럽 대회 목록
export const EUROPEAN_COMPETITIONS = [
  { id: CHAMPIONS_LEAGUE, name: 'UCL', fullName: 'UEFA Champions League', flag: '🏆' },
  { id: EUROPA_LEAGUE, name: 'UEL', fullName: 'UEFA Europa League', flag: '🥈' },
  { id: CONFERENCE_LEAGUE, name: 'UECL', fullName: 'UEFA Conference League', flag: '🥉' },
];

// K리그 목록
export const K_LEAGUES = [
  { id: K_LEAGUE_1, name: 'K리그1', fullName: 'K League 1', flag: '🇰🇷' },
  { id: K_LEAGUE_2, name: 'K리그2', fullName: 'K League 2', flag: '🇰🇷' },
];

// 우선순위 티어
export const TIER_1_LEAGUES = new Set([PREMIER_LEAGUE, LA_LIGA, SERIE_A, BUNDESLIGA, LIGUE_1]);
export const TIER_2_LEAGUES = new Set([CHAMPIONS_LEAGUE, EUROPA_LEAGUE, CONFERENCE_LEAGUE]);
export const TIER_3_LEAGUES = new Set([K_LEAGUE_1, K_LEAGUE_2, WORLD_CUP, EURO, AFCON, COPA_AMERICA, AFC_ASIAN_CUP]);

// 주요 리그 ID 목록 (주요 경기 필터용)
export const MAJOR_LEAGUE_IDS = new Set([
  // 5대 리그
  PREMIER_LEAGUE, LA_LIGA, SERIE_A, BUNDESLIGA, LIGUE_1,
  // 유럽 대회
  CHAMPIONS_LEAGUE, EUROPA_LEAGUE, CONFERENCE_LEAGUE,
  // K리그
  K_LEAGUE_1, K_LEAGUE_2,
  // 국제대회
  WORLD_CUP, EURO, AFCON, COPA_AMERICA, AFC_ASIAN_CUP,
]);

// 리그 우선순위 반환
export function getLeaguePriority(leagueId: number): number {
  if (TIER_1_LEAGUES.has(leagueId)) return 1;
  if (TIER_2_LEAGUES.has(leagueId)) return 2;
  if (TIER_3_LEAGUES.has(leagueId)) return 3;
  return 4;
}

// 현재 시즌 반환
export function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // 7월 이후면 새 시즌
  return month >= 7 ? year : year - 1;
}

// 경기 상태
export const MATCH_STATUS = {
  // 예정
  TBD: 'TBD',
  NS: 'NS', // Not Started
  // 진행 중
  '1H': '1H', // First Half
  HT: 'HT', // Half Time
  '2H': '2H', // Second Half
  ET: 'ET', // Extra Time
  BT: 'BT', // Break Time
  P: 'P', // Penalty
  SUSP: 'SUSP', // Suspended
  INT: 'INT', // Interrupted
  LIVE: 'LIVE',
  // 종료
  FT: 'FT', // Full Time
  AET: 'AET', // After Extra Time
  PEN: 'PEN', // Penalty Shootout
  // 기타
  PST: 'PST', // Postponed
  CANC: 'CANC', // Cancelled
  ABD: 'ABD', // Abandoned
  AWD: 'AWD', // Technical Loss
  WO: 'WO', // Walkover
};

export const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']);
export const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);
export const SCHEDULED_STATUSES = new Set(['TBD', 'NS']);
