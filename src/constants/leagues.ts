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

// 컵 대회 ID 목록 (토너먼트 형식)
export const CUP_COMPETITION_IDS = new Set([
  FA_CUP, EFL_CUP, COPA_DEL_REY, DFB_POKAL, COPPA_ITALIA, COUPE_DE_FRANCE,
  // 유럽 대회도 토너먼트 단계 있음
  CHAMPIONS_LEAGUE, EUROPA_LEAGUE, CONFERENCE_LEAGUE,
]);

// 컵 대회 여부 확인
export function isCupCompetition(leagueId: number): boolean {
  return CUP_COMPETITION_IDS.has(leagueId);
}

// 유럽 대회 ID (조별리그 + 토너먼트 둘 다 있음)
export const EUROPEAN_COMPETITION_IDS = new Set([
  CHAMPIONS_LEAGUE, EUROPA_LEAGUE, CONFERENCE_LEAGUE,
]);

// 유럽 대회 여부 확인 (조별리그 + 토너먼트)
export function isEuropeanCompetition(leagueId: number): boolean {
  return EUROPEAN_COMPETITION_IDS.has(leagueId);
}

// 라운드명 한글화
export function getRoundNameKo(round: string): string {
  const roundLower = round.toLowerCase();

  // 1/N-finals 형식 처리
  const nthFinalMatch = roundLower.match(/1\/(\d+)-finals?/);
  if (nthFinalMatch) {
    const n = parseInt(nthFinalMatch[1]);
    if (n === 2) return '결승';
    if (n === 4) return '4강';
    if (n === 8) return '8강';
    if (n === 16) return '16강';
    if (n === 32) return '32강';
    if (n === 64) return '64강';
    return `${n * 2}강`;
  }

  // Round of N 형식 처리
  const roundOfMatch = roundLower.match(/round of (\d+)/);
  if (roundOfMatch) {
    const n = parseInt(roundOfMatch[1]);
    return `${n}강`;
  }

  // 일반적인 라운드명
  if (roundLower === 'final') return '결승';
  if (roundLower.includes('semi-final') || roundLower.includes('semi final')) return '4강';
  if (roundLower.includes('quarter-final') || roundLower.includes('quarter final')) return '8강';
  if (roundLower.includes('3rd place')) return '3/4위전';
  if (roundLower.includes('group')) {
    // Group A -> A조
    const groupMatch = round.match(/group\s+([a-z])/i);
    if (groupMatch) return `${groupMatch[1].toUpperCase()}조`;
    return '조별리그';
  }

  // 예선 라운드
  if (roundLower.includes('qualifying')) return '예선';
  if (roundLower.includes('preliminary')) return '예비 라운드';
  if (roundLower.includes('play-off') || roundLower.includes('playoff')) return '플레이오프';

  // 라운드 번호
  const roundNumMatch = roundLower.match(/round\s*(\d+)/);
  if (roundNumMatch) return `${roundNumMatch[1]}라운드`;

  return round;
}

// 라운드 순서 (결승에 가까울수록 높은 값)
export function getRoundOrder(round: string): number {
  const roundLower = round.toLowerCase();

  // 결승
  if (roundLower === 'final' || roundLower === '1/2-finals') return 100;
  // 3/4위전
  if (roundLower.includes('3rd place')) return 99;
  // 4강
  if (roundLower.includes('semi') || roundLower === '1/4-finals') return 80;
  // 8강
  if (roundLower.includes('quarter') || roundLower === '1/8-finals') return 70;
  // 16강
  if (roundLower.includes('round of 16') || roundLower === '1/16-finals') return 60;
  // 32강
  if (roundLower.includes('round of 32') || roundLower === '1/32-finals') return 50;
  // 64강
  if (roundLower.includes('round of 64') || roundLower === '1/64-finals') return 40;

  // 조별리그
  if (roundLower.includes('group')) return 30;

  // 플레이오프
  if (roundLower.includes('play-off') || roundLower.includes('playoff')) return 20;

  // 예선
  if (roundLower.includes('qualifying') || roundLower.includes('preliminary')) return 10;

  return 0;
}

// API-Football 리그 로고 URL 생성
const getLeagueLogo = (id: number) => `https://media.api-sports.io/football/leagues/${id}.png`;

// 5대 리그 목록
export const TOP_5_LEAGUES = [
  { id: PREMIER_LEAGUE, name: 'EPL', fullName: 'Premier League', country: 'England', logo: getLeagueLogo(PREMIER_LEAGUE) },
  { id: LA_LIGA, name: 'La Liga', fullName: 'La Liga', country: 'Spain', logo: getLeagueLogo(LA_LIGA) },
  { id: SERIE_A, name: 'Serie A', fullName: 'Serie A', country: 'Italy', logo: getLeagueLogo(SERIE_A) },
  { id: BUNDESLIGA, name: 'Bundesliga', fullName: 'Bundesliga', country: 'Germany', logo: getLeagueLogo(BUNDESLIGA) },
  { id: LIGUE_1, name: 'Ligue 1', fullName: 'Ligue 1', country: 'France', logo: getLeagueLogo(LIGUE_1) },
];

// 유럽 대회 목록
export const EUROPEAN_COMPETITIONS = [
  { id: CHAMPIONS_LEAGUE, name: 'UCL', fullName: 'UEFA Champions League', logo: getLeagueLogo(CHAMPIONS_LEAGUE) },
  { id: EUROPA_LEAGUE, name: 'UEL', fullName: 'UEFA Europa League', logo: getLeagueLogo(EUROPA_LEAGUE) },
  { id: CONFERENCE_LEAGUE, name: 'UECL', fullName: 'UEFA Conference League', logo: getLeagueLogo(CONFERENCE_LEAGUE) },
];

// K리그 목록
export const K_LEAGUES = [
  { id: K_LEAGUE_1, name: 'K리그1', fullName: 'K League 1', logo: getLeagueLogo(K_LEAGUE_1) },
  { id: K_LEAGUE_2, name: 'K리그2', fullName: 'K League 2', logo: getLeagueLogo(K_LEAGUE_2) },
];

// 모든 리그 (필터용)
export const ALL_LEAGUES = [
  ...TOP_5_LEAGUES,
  ...EUROPEAN_COMPETITIONS,
  ...K_LEAGUES,
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
