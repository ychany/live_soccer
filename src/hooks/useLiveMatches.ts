import { useQuery } from '@tanstack/react-query';
import { getLiveFixtures, getFixturesByDate } from '../api/football';
import { MAJOR_LEAGUE_IDS } from '../constants/leagues';

export function useLiveMatches() {
  return useQuery({
    queryKey: ['liveMatches'],
    queryFn: getLiveFixtures,
    refetchInterval: 30000, // 30초마다 자동 갱신
    staleTime: 10000, // 10초 동안 fresh 상태 유지
  });
}

// 일주일 내 주요 경기 (5대 리그 + 유럽 대회 + K리그 + 국제대회)
export function useFeaturedMatches() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['featuredMatches', dateStr],
    queryFn: async () => {
      // 오늘부터 7일간의 날짜 생성
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // 모든 날짜의 경기 병렬 조회
      const results = await Promise.all(
        dates.map(date => getFixturesByDate(date))
      );

      // 합치고 주요 리그만 필터링
      const allFixtures = results.flat();
      return allFixtures.filter(f => MAJOR_LEAGUE_IDS.has(f.league.id));
    },
    staleTime: 300000, // 5분 동안 fresh 상태 유지
  });
}
