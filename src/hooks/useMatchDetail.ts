import { useQuery } from '@tanstack/react-query';
import {
  getFixtureById,
  getFixtureLineups,
  getFixtureStatistics,
  getFixtureEvents,
  getFixturePlayers,
  getHeadToHead,
  getFixturePrediction,
  getFixtureOdds,
} from '../api/football';

export function useMatchDetail(fixtureId: number) {
  return useQuery({
    queryKey: ['match', fixtureId],
    queryFn: () => getFixtureById(fixtureId),
    enabled: !!fixtureId,
    staleTime: 30000,
  });
}

export function useMatchLineups(fixtureId: number) {
  return useQuery({
    queryKey: ['matchLineups', fixtureId],
    queryFn: () => getFixtureLineups(fixtureId),
    enabled: !!fixtureId,
    staleTime: 60000,
  });
}

export function useMatchStatistics(fixtureId: number) {
  return useQuery({
    queryKey: ['matchStats', fixtureId],
    queryFn: () => getFixtureStatistics(fixtureId),
    enabled: !!fixtureId,
    staleTime: 30000,
  });
}

export function useMatchEvents(fixtureId: number) {
  return useQuery({
    queryKey: ['matchEvents', fixtureId],
    queryFn: () => getFixtureEvents(fixtureId),
    enabled: !!fixtureId,
    staleTime: 30000,
  });
}

export function useMatchPlayers(fixtureId: number) {
  return useQuery({
    queryKey: ['matchPlayers', fixtureId],
    queryFn: () => getFixturePlayers(fixtureId),
    enabled: !!fixtureId,
    staleTime: 60000,
  });
}

export function useHeadToHead(team1Id: number, team2Id: number) {
  return useQuery({
    queryKey: ['h2h', team1Id, team2Id],
    queryFn: () => getHeadToHead(team1Id, team2Id),
    enabled: !!team1Id && !!team2Id,
    staleTime: 300000, // 5분
  });
}

export function useMatchPrediction(fixtureId: number) {
  return useQuery({
    queryKey: ['prediction', fixtureId],
    queryFn: () => getFixturePrediction(fixtureId),
    enabled: !!fixtureId,
    staleTime: 300000,
  });
}

export function useMatchOdds(fixtureId: number) {
  return useQuery({
    queryKey: ['odds', fixtureId],
    queryFn: () => getFixtureOdds(fixtureId),
    enabled: !!fixtureId,
    staleTime: 60000,
  });
}
