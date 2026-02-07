import axios from 'axios';
import type {
  ApiResponse,
  FixtureResponse,
  LineupTeam,
  TeamStatistics,
  MatchEvent,
  PlayerResponse,
  StandingsResponse,
  PredictionResponse,
  OddsResponse,
  FixturePlayersResponse,
  TeamInfo,
  SquadResponse,
  TeamSeasonStats,
  TopScorer,
  TransferResponse,
  Trophy,
  Sidelined,
  H2HResponse,
} from '../types/football';
import { getLeaguePriority } from '../constants/leagues';

const API_KEY = '845ed01c6cbc3b264fd6cd78f8da9823';
const BASE_URL = 'https://v3.football.api-sports.io';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apisports-key': API_KEY,
  },
});

// 라이브 경기 조회
export async function getLiveFixtures(): Promise<FixtureResponse[]> {
  const { data } = await api.get<ApiResponse<FixtureResponse[]>>('/fixtures', {
    params: { live: 'all' },
  });

  // 리그 우선순위로 정렬
  return data.response.sort((a, b) => {
    const priorityA = getLeaguePriority(a.league.id);
    const priorityB = getLeaguePriority(b.league.id);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.league.id - b.league.id;
  });
}

// 경기 상세 조회
export async function getFixtureById(fixtureId: number): Promise<FixtureResponse | null> {
  const { data } = await api.get<ApiResponse<FixtureResponse[]>>('/fixtures', {
    params: { id: fixtureId },
  });
  return data.response[0] || null;
}

// 리그별 경기 조회
export async function getFixturesByLeague(leagueId: number, season: number): Promise<FixtureResponse[]> {
  const { data } = await api.get<ApiResponse<FixtureResponse[]>>('/fixtures', {
    params: { league: leagueId, season },
  });
  return data.response;
}

// 팀별 경기 조회
export async function getFixturesByTeam(teamId: number, season: number): Promise<FixtureResponse[]> {
  const { data } = await api.get<ApiResponse<FixtureResponse[]>>('/fixtures', {
    params: { team: teamId, season },
  });
  return data.response;
}

// 라인업 조회
export async function getFixtureLineups(fixtureId: number): Promise<LineupTeam[]> {
  const { data } = await api.get<ApiResponse<LineupTeam[]>>('/fixtures/lineups', {
    params: { fixture: fixtureId },
  });
  return data.response;
}

// 경기 통계 조회
export async function getFixtureStatistics(fixtureId: number): Promise<TeamStatistics[]> {
  const { data } = await api.get<ApiResponse<TeamStatistics[]>>('/fixtures/statistics', {
    params: { fixture: fixtureId },
  });
  return data.response;
}

// 경기 이벤트 (타임라인) 조회
export async function getFixtureEvents(fixtureId: number): Promise<MatchEvent[]> {
  const { data } = await api.get<ApiResponse<MatchEvent[]>>('/fixtures/events', {
    params: { fixture: fixtureId },
  });
  return data.response;
}

// 경기별 선수 통계 조회
export async function getFixturePlayers(fixtureId: number): Promise<FixturePlayersResponse[]> {
  const { data } = await api.get<ApiResponse<FixturePlayersResponse[]>>('/fixtures/players', {
    params: { fixture: fixtureId },
  });
  return data.response;
}

// 상대전적 조회
export async function getHeadToHead(team1Id: number, team2Id: number, last: number = 10): Promise<H2HResponse[]> {
  const { data } = await api.get<ApiResponse<H2HResponse[]>>('/fixtures/headtohead', {
    params: { h2h: `${team1Id}-${team2Id}`, last },
  });
  return data.response;
}

// 예측 조회
export async function getFixturePrediction(fixtureId: number): Promise<PredictionResponse | null> {
  const { data } = await api.get<ApiResponse<PredictionResponse[]>>('/predictions', {
    params: { fixture: fixtureId },
  });
  return data.response[0] || null;
}

// 배당률 조회
export async function getFixtureOdds(fixtureId: number): Promise<OddsResponse | null> {
  const { data } = await api.get<ApiResponse<OddsResponse[]>>('/odds', {
    params: { fixture: fixtureId },
  });
  return data.response[0] || null;
}

// 팀 정보 조회
export async function getTeamById(teamId: number): Promise<TeamInfo | null> {
  const { data } = await api.get<ApiResponse<{ team: TeamInfo; venue: TeamInfo['venue'] }[]>>('/teams', {
    params: { id: teamId },
  });
  if (!data.response[0]) return null;
  return { ...data.response[0].team, venue: data.response[0].venue };
}

// 팀 스쿼드 조회
export async function getTeamSquad(teamId: number): Promise<SquadResponse | null> {
  const { data } = await api.get<ApiResponse<SquadResponse[]>>('/players/squads', {
    params: { team: teamId },
  });
  return data.response[0] || null;
}

// 팀 시즌 통계 조회
export async function getTeamStatistics(teamId: number, leagueId: number, season: number): Promise<TeamSeasonStats | null> {
  const { data } = await api.get<ApiResponse<TeamSeasonStats>>('/teams/statistics', {
    params: { team: teamId, league: leagueId, season },
  });
  return data.response || null;
}

// 팀 이적 조회
export async function getTeamTransfers(teamId: number): Promise<TransferResponse[]> {
  const { data } = await api.get<ApiResponse<TransferResponse[]>>('/transfers', {
    params: { team: teamId },
  });
  return data.response;
}

// 선수 정보 조회
export async function getPlayerById(playerId: number, season?: number): Promise<PlayerResponse | null> {
  const params: Record<string, number> = { id: playerId };
  if (season) params.season = season;

  const { data } = await api.get<ApiResponse<PlayerResponse[]>>('/players', {
    params,
  });
  return data.response[0] || null;
}

// 선수 이적 조회
export async function getPlayerTransfers(playerId: number): Promise<TransferResponse | null> {
  const { data } = await api.get<ApiResponse<TransferResponse[]>>('/transfers', {
    params: { player: playerId },
  });
  return data.response[0] || null;
}

// 선수 트로피 조회
export async function getPlayerTrophies(playerId: number): Promise<Trophy[]> {
  const { data } = await api.get<ApiResponse<Trophy[]>>('/trophies', {
    params: { player: playerId },
  });
  return data.response;
}

// 선수 부상 이력 조회
export async function getPlayerSidelined(playerId: number): Promise<Sidelined[]> {
  const { data } = await api.get<ApiResponse<Sidelined[]>>('/sidelined', {
    params: { player: playerId },
  });
  return data.response;
}

// 선수 출전 경기 조회 (경기별 선수 통계에서 해당 선수 필터링)
export async function getPlayerFixtures(
  playerId: number,
  teamId: number,
  season: number
): Promise<{ fixture: FixtureResponse; playerStats: FixturePlayersResponse['players'][0] }[]> {
  // 먼저 팀의 완료된 경기 목록을 가져옴
  const fixtures = await getFixturesByTeam(teamId, season);
  const finishedFixtures = fixtures
    .filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short))
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
    .slice(0, 30); // 최근 30경기만 확인

  // 각 경기에서 선수 출전 여부 확인
  const results: { fixture: FixtureResponse; playerStats: FixturePlayersResponse['players'][0] }[] = [];

  for (const fixture of finishedFixtures) {
    try {
      const playersData = await getFixturePlayers(fixture.fixture.id);
      // 해당 선수 찾기
      for (const teamData of playersData) {
        const playerStats = teamData.players.find(p => p.player.id === playerId);
        if (playerStats && playerStats.statistics[0]?.games?.minutes) {
          results.push({ fixture, playerStats });
          break;
        }
      }
      // API rate limit 방지를 위해 20경기까지만
      if (results.length >= 20) break;
    } catch {
      // 개별 경기 조회 실패 시 스킵
    }
  }

  return results;
}

// 리그 순위 조회
export async function getStandings(leagueId: number, season: number): Promise<StandingsResponse | null> {
  const { data } = await api.get<ApiResponse<StandingsResponse[]>>('/standings', {
    params: { league: leagueId, season },
  });
  return data.response[0] || null;
}

// 득점 순위 조회
export async function getTopScorers(leagueId: number, season: number): Promise<TopScorer[]> {
  const { data } = await api.get<ApiResponse<TopScorer[]>>('/players/topscorers', {
    params: { league: leagueId, season },
  });
  return data.response;
}

// 도움 순위 조회
export async function getTopAssists(leagueId: number, season: number): Promise<TopScorer[]> {
  const { data } = await api.get<ApiResponse<TopScorer[]>>('/players/topassists', {
    params: { league: leagueId, season },
  });
  return data.response;
}

// 경고 순위 조회
export async function getTopYellowCards(leagueId: number, season: number): Promise<TopScorer[]> {
  const { data } = await api.get<ApiResponse<TopScorer[]>>('/players/topyellowcards', {
    params: { league: leagueId, season },
  });
  return data.response;
}

// 퇴장 순위 조회
export async function getTopRedCards(leagueId: number, season: number): Promise<TopScorer[]> {
  const { data } = await api.get<ApiResponse<TopScorer[]>>('/players/topredcards', {
    params: { league: leagueId, season },
  });
  return data.response;
}

// 리그 정보 조회
export async function getLeagueById(leagueId: number): Promise<{ league: { id: number; name: string; type: string; logo: string }; country: { name: string; code: string; flag: string }; seasons: { year: number; current: boolean }[] } | null> {
  const { data } = await api.get<ApiResponse<{ league: { id: number; name: string; type: string; logo: string }; country: { name: string; code: string; flag: string }; seasons: { year: number; current: boolean }[] }[]>>('/leagues', {
    params: { id: leagueId },
  });
  return data.response[0] || null;
}

// 팀이 참가중인 리그 목록 조회
export async function getTeamLeagues(teamId: number, season: number): Promise<{ league: { id: number; name: string; type: string; logo: string }; country: { name: string; code: string; flag: string } }[]> {
  const { data } = await api.get<ApiResponse<{ league: { id: number; name: string; type: string; logo: string }; country: { name: string; code: string; flag: string } }[]>>('/leagues', {
    params: { team: teamId, season },
  });
  return data.response;
}

// 날짜별 경기 조회
export async function getFixturesByDate(date: string): Promise<FixtureResponse[]> {
  const { data } = await api.get<ApiResponse<FixtureResponse[]>>('/fixtures', {
    params: { date },
  });

  // 리그 우선순위로 정렬
  return data.response.sort((a, b) => {
    const priorityA = getLeaguePriority(a.league.id);
    const priorityB = getLeaguePriority(b.league.id);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.league.id - b.league.id;
  });
}
