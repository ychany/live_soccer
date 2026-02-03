import { useQuery } from '@tanstack/react-query';
import {
  getPlayerById,
  getPlayerTransfers,
  getPlayerTrophies,
  getPlayerSidelined,
} from '../api/football';
import { getCurrentSeason } from '../constants/leagues';

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
