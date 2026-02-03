// API-Football 타입 정의

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round?: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface TeamInfo extends Team {
  code: string | null;
  country: string;
  founded: number | null;
  national: boolean;
  venue?: Venue;
}

export interface Venue {
  id: number;
  name: string;
  address: string | null;
  city: string;
  capacity: number;
  surface: string;
  image: string | null;
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
  extra?: number | null;
}

export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  };
  status: FixtureStatus;
}

export interface FixtureResponse {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: Score;
}

// 라인업 관련
export interface Player {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface Coach {
  id: number;
  name: string;
  photo: string;
}

export interface LineupTeam {
  team: Team;
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
  coach: Coach;
}

// 경기 통계
export interface StatisticItem {
  type: string;
  value: number | string | null;
}

export interface TeamStatistics {
  team: Team;
  statistics: StatisticItem[];
}

// 경기 이벤트 (타임라인)
export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: Team;
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: 'Goal' | 'Card' | 'subst' | 'Var';
  detail: string;
  comments: string | null;
}

// 선수 상세
export interface PlayerInfo {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: {
    date: string;
    place: string | null;
    country: string;
  };
  nationality: string;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string;
}

export interface PlayerStatistics {
  team: Team;
  league: League;
  games: {
    appearences: number | null;
    lineups: number | null;
    minutes: number | null;
    number: number | null;
    position: string;
    rating: string | null;
    captain: boolean;
  };
  substitutes: {
    in: number | null;
    out: number | null;
    bench: number | null;
  };
  shots: {
    total: number | null;
    on: number | null;
  };
  goals: {
    total: number | null;
    conceded: number | null;
    assists: number | null;
    saves: number | null;
  };
  passes: {
    total: number | null;
    key: number | null;
    accuracy: number | null;
  };
  tackles: {
    total: number | null;
    blocks: number | null;
    interceptions: number | null;
  };
  duels: {
    total: number | null;
    won: number | null;
  };
  dribbles: {
    attempts: number | null;
    success: number | null;
    past: number | null;
  };
  fouls: {
    drawn: number | null;
    committed: number | null;
  };
  cards: {
    yellow: number | null;
    yellowred: number | null;
    red: number | null;
  };
  penalty: {
    won: number | null;
    commited: number | null;
    scored: number | null;
    missed: number | null;
    saved: number | null;
  };
}

export interface PlayerResponse {
  player: PlayerInfo;
  statistics: PlayerStatistics[];
}

// 순위
export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface StandingsResponse {
  league: League & {
    standings: Standing[][];
  };
}

// 상대전적
export interface H2HResponse {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: Score;
}

// 예측
export interface Prediction {
  winner: {
    id: number;
    name: string;
    comment: string;
  };
  win_or_draw: boolean;
  under_over: string | null;
  goals: {
    home: string;
    away: string;
  };
  advice: string;
  percent: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface PredictionResponse {
  predictions: Prediction;
  league: League;
  teams: {
    home: TeamInfo & { league: { form: string } };
    away: TeamInfo & { league: { form: string } };
  };
  comparison: {
    form: { home: string; away: string };
    att: { home: string; away: string };
    def: { home: string; away: string };
    poisson_distribution: { home: string; away: string };
    h2h: { home: string; away: string };
    goals: { home: string; away: string };
    total: { home: string; away: string };
  };
  h2h: H2HResponse[];
}

// 배당률
export interface OddsValue {
  value: string;
  odd: string;
}

export interface OddsBet {
  id: number;
  name: string;
  values: OddsValue[];
}

export interface OddsBookmaker {
  id: number;
  name: string;
  bets: OddsBet[];
}

export interface OddsResponse {
  league: League;
  fixture: Fixture;
  update: string;
  bookmakers: OddsBookmaker[];
}

// 경기별 선수 통계
export interface FixturePlayerStats {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: [{
    games: {
      minutes: number | null;
      number: number;
      position: string;
      rating: string | null;
      captain: boolean;
      substitute: boolean;
    };
    offsides: number | null;
    shots: {
      total: number | null;
      on: number | null;
    };
    goals: {
      total: number | null;
      conceded: number | null;
      assists: number | null;
      saves: number | null;
    };
    passes: {
      total: number | null;
      key: number | null;
      accuracy: string | null;
    };
    tackles: {
      total: number | null;
      blocks: number | null;
      interceptions: number | null;
    };
    duels: {
      total: number | null;
      won: number | null;
    };
    dribbles: {
      attempts: number | null;
      success: number | null;
      past: number | null;
    };
    fouls: {
      drawn: number | null;
      committed: number | null;
    };
    cards: {
      yellow: number;
      red: number;
    };
    penalty: {
      won: number | null;
      commited: number | null;
      scored: number | null;
      missed: number | null;
      saved: number | null;
    };
  }];
}

export interface FixturePlayersResponse {
  team: Team;
  players: FixturePlayerStats[];
}

// 이적
export interface Transfer {
  date: string;
  type: string;
  teams: {
    in: Team;
    out: Team;
  };
}

export interface TransferResponse {
  player: {
    id: number;
    name: string;
  };
  update: string;
  transfers: Transfer[];
}

// 트로피
export interface Trophy {
  league: string;
  country: string;
  season: string;
  place: string;
}

// 부상
export interface Sidelined {
  type: string;
  start: string;
  end: string | null;
}

// 스쿼드
export interface SquadPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

export interface SquadResponse {
  team: Team;
  players: SquadPlayer[];
}

// 팀 시즌 통계
export interface TeamSeasonStats {
  league: League;
  team: Team;
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
    against: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
  };
  biggest: {
    streak: { wins: number; draws: number; loses: number };
    wins: { home: string | null; away: string | null };
    loses: { home: string | null; away: string | null };
    goals: {
      for: { home: number; away: number };
      against: { home: number; away: number };
    };
  };
  clean_sheet: { home: number; away: number; total: number };
  failed_to_score: { home: number; away: number; total: number };
  penalty: {
    scored: { total: number; percentage: string };
    missed: { total: number; percentage: string };
  };
  lineups: { formation: string; played: number }[];
  cards: {
    yellow: Record<string, { total: number | null; percentage: string | null }>;
    red: Record<string, { total: number | null; percentage: string | null }>;
  };
}

// 득점/도움 순위
export interface TopScorer {
  player: PlayerInfo;
  statistics: PlayerStatistics[];
}

// API 응답 래퍼
export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[] | Record<string, string>;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}
