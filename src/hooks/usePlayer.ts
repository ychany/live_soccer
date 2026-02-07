import { useQuery } from '@tanstack/react-query';
import {
  getPlayerById,
  getPlayerTransfers,
  getPlayerTrophies,
  getPlayerSidelined,
  getFixturesByTeam,
  getPlayerFixtures,
} from '../api/football';
import { getCurrentSeason, FINISHED_STATUSES } from '../constants/leagues';

export function usePlayerInfo(playerId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['player', playerId, currentSeason],
    queryFn: () => getPlayerById(playerId, currentSeason),
    enabled: !!playerId,
    staleTime: 300000,
  });
}

export function usePlayerTransfers(playerId: number) {
  return useQuery({
    queryKey: ['playerTransfers', playerId],
    queryFn: () => getPlayerTransfers(playerId),
    enabled: !!playerId,
    staleTime: 600000,
  });
}

export function usePlayerTrophies(playerId: number) {
  return useQuery({
    queryKey: ['playerTrophies', playerId],
    queryFn: () => getPlayerTrophies(playerId),
    enabled: !!playerId,
    staleTime: 600000,
  });
}

export function usePlayerSidelined(playerId: number) {
  return useQuery({
    queryKey: ['playerSidelined', playerId],
    queryFn: () => getPlayerSidelined(playerId),
    enabled: !!playerId,
    staleTime: 600000,
  });
}

// 멀티 시즌 통계 (최근 5시즌)
export function usePlayerMultiSeasonStats(playerId: number) {
  const currentYear = new Date().getFullYear();
  const seasons = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  return useQuery({
    queryKey: ['playerMultiSeason', playerId],
    queryFn: async () => {
      const results = await Promise.all(
        seasons.map(async (season) => {
          try {
            const player = await getPlayerById(playerId, season);
            if (player && player.statistics.length > 0) {
              const hasAppearances = player.statistics.some(
                (s) => (s.games.appearences ?? 0) > 0
              );
              if (hasAppearances) {
                return { season, data: player };
              }
            }
            return null;
          } catch {
            return null;
          }
        })
      );
      return results.filter((r) => r !== null);
    },
    enabled: !!playerId,
    staleTime: 600000,
  });
}

// 선수 팀의 최근 경기 조회 (팀 전체 경기)
export function usePlayerTeamFixtures(teamId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['playerTeamFixtures', teamId, currentSeason],
    queryFn: async () => {
      const fixtures = await getFixturesByTeam(teamId, currentSeason);
      // 종료된 경기만 필터링하고 최근순 정렬
      return fixtures
        .filter(f => FINISHED_STATUSES.has(f.fixture.status.short))
        .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
        .slice(0, 20); // 최근 20경기
    },
    enabled: !!teamId,
    staleTime: 300000,
  });
}

// 선수가 실제 출전한 경기만 조회
export function usePlayerAppearances(playerId: number, teamId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['playerAppearances', playerId, teamId, currentSeason],
    queryFn: () => getPlayerFixtures(playerId, teamId, currentSeason),
    enabled: !!playerId && !!teamId,
    staleTime: 300000,
  });
}
