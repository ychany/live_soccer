import { useQuery } from '@tanstack/react-query';
import {
  getTeamById,
  getTeamSquad,
  getTeamStatistics,
  getTeamTransfers,
  getFixturesByTeam,
  getTeamLeagues,
  getStandings,
} from '../api/football';
import { getCurrentSeason } from '../constants/leagues';

export function useTeamInfo(teamId: number) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 300000,
  });
}

export function useTeamSquad(teamId: number) {
  return useQuery({
    queryKey: ['teamSquad', teamId],
    queryFn: () => getTeamSquad(teamId),
    enabled: !!teamId,
    staleTime: 300000,
  });
}

export function useTeamStatistics(teamId: number, leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['teamStats', teamId, leagueId, currentSeason],
    queryFn: () => getTeamStatistics(teamId, leagueId, currentSeason),
    enabled: !!teamId && !!leagueId,
    staleTime: 300000,
  });
}

export function useTeamTransfers(teamId: number) {
  return useQuery({
    queryKey: ['teamTransfers', teamId],
    queryFn: () => getTeamTransfers(teamId),
    enabled: !!teamId,
    staleTime: 600000,
  });
}

export function useTeamFixtures(teamId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['teamFixtures', teamId, currentSeason],
    queryFn: () => getFixturesByTeam(teamId, currentSeason),
    enabled: !!teamId,
    staleTime: 60000,
  });
}

export function useTeamLeagues(teamId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['teamLeagues', teamId, currentSeason],
    queryFn: () => getTeamLeagues(teamId, currentSeason),
    enabled: !!teamId,
    staleTime: 300000,
  });
}

export function useTeamStandings(teamId: number, leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['teamStandings', teamId, leagueId, currentSeason],
    queryFn: async () => {
      const standings = await getStandings(leagueId, currentSeason);
      if (!standings) return null;

      // 팀의 순위 정보 찾기
      const teamStanding = standings.league.standings[0]?.find(
        (s) => s.team.id === teamId
      );
      return {
        league: standings.league,
        standing: teamStanding,
        allStandings: standings.league.standings[0],
      };
    },
    enabled: !!teamId && !!leagueId,
    staleTime: 300000,
  });
}
