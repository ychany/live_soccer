import { useQuery } from '@tanstack/react-query';
import {
  getLeagueById,
  getStandings,
  getFixturesByLeague,
  getTopScorers,
  getTopAssists,
  getTopYellowCards,
  getTopRedCards,
} from '../api/football';
import { getCurrentSeason } from '../constants/leagues';

export function useLeagueInfo(leagueId: number) {
  return useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => getLeagueById(leagueId),
    enabled: !!leagueId,
    staleTime: 600000,
  });
}

export function useLeagueStandings(leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['standings', leagueId, currentSeason],
    queryFn: () => getStandings(leagueId, currentSeason),
    enabled: !!leagueId,
    staleTime: 300000,
  });
}

export function useLeagueFixtures(leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['leagueFixtures', leagueId, currentSeason],
    queryFn: () => getFixturesByLeague(leagueId, currentSeason),
    enabled: !!leagueId,
    staleTime: 60000,
  });
}

export function useTopScorers(leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['topScorers', leagueId, currentSeason],
    queryFn: () => getTopScorers(leagueId, currentSeason),
    enabled: !!leagueId,
    staleTime: 300000,
  });
}

export function useTopAssists(leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['topAssists', leagueId, currentSeason],
    queryFn: () => getTopAssists(leagueId, currentSeason),
    enabled: !!leagueId,
    staleTime: 300000,
  });
}

export function useTopYellowCards(leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['topYellowCards', leagueId, currentSeason],
    queryFn: () => getTopYellowCards(leagueId, currentSeason),
    enabled: !!leagueId,
    staleTime: 300000,
  });
}

export function useTopRedCards(leagueId: number, season?: number) {
  const currentSeason = season || getCurrentSeason();
  return useQuery({
    queryKey: ['topRedCards', leagueId, currentSeason],
    queryFn: () => getTopRedCards(leagueId, currentSeason),
    enabled: !!leagueId,
    staleTime: 300000,
  });
}
