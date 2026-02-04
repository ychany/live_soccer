import { useState, useMemo } from 'react';
import { useLiveMatches } from '../hooks/useLiveMatches';
import { Header, Loading, EmptyState } from '../components/common';
import { MatchCard } from '../components/MatchCard';
import type { FixtureResponse } from '../types/football';
import { Tv, RefreshCw } from 'lucide-react';
import styles from './LiveMatches.module.css';

export function LiveMatches() {
  const { data: matches, isLoading, refetch, dataUpdatedAt } = useLiveMatches();
  const [selectedLeague, setSelectedLeague] = useState<number | 'all'>('all');

  // 리그별 그룹핑
  const groupedMatches = useMemo(() => {
    if (!matches) return new Map<string, FixtureResponse[]>();

    const groups = new Map<string, FixtureResponse[]>();
    matches.forEach((match) => {
      const key = `${match.league.id}-${match.league.name}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(match);
    });
    return groups;
  }, [matches]);

  // 리그 목록
  const leagues = useMemo(() => {
    if (!matches) return [];
    const leagueMap = new Map<number, { id: number; name: string; logo: string }>();
    matches.forEach((match) => {
      if (!leagueMap.has(match.league.id)) {
        leagueMap.set(match.league.id, {
          id: match.league.id,
          name: match.league.name,
          logo: match.league.logo,
        });
      }
    });
    return Array.from(leagueMap.values());
  }, [matches]);

  // 필터링된 경기
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    if (selectedLeague === 'all') return matches;
    return matches.filter((m) => m.league.id === selectedLeague);
  }, [matches, selectedLeague]);

  // 마지막 업데이트 시간
  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div className="page">
      <Header
        title="라이브 경기"
        rightElement={
          <button className={styles.refreshBtn} onClick={() => refetch()}>
            <RefreshCw size={20} />
          </button>
        }
      />

      {/* 업데이트 시간 */}
      {lastUpdate && (
        <div className={styles.updateInfo}>
          마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          <span className={styles.autoUpdate}>30초마다 자동 갱신</span>
        </div>
      )}

      {/* 리그 필터 */}
      {leagues.length > 0 && (
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${selectedLeague === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedLeague('all')}
          >
            전체
          </button>
          {leagues.map((league) => (
            <button
              key={league.id}
              className={`${styles.filterBtn} ${selectedLeague === league.id ? styles.active : ''}`}
              onClick={() => setSelectedLeague(league.id)}
            >
              <img src={league.logo} alt="" className={styles.filterLogo} />
              {league.name}
            </button>
          ))}
        </div>
      )}

      {/* 경기 목록 */}
      <div className={styles.content}>
        {isLoading ? (
          <Loading />
        ) : !filteredMatches || filteredMatches.length === 0 ? (
          <EmptyState
            icon={<Tv size={48} />}
            message="현재 진행 중인 경기가 없습니다"
          />
        ) : selectedLeague === 'all' ? (
          // 리그별 그룹 표시
          Array.from(groupedMatches.entries()).map(([key, leagueMatches]) => (
            <div key={key} className={styles.leagueGroup}>
              <div className={styles.leagueHeader}>
                <img
                  src={leagueMatches[0].league.logo}
                  alt=""
                  className={styles.leagueLogo}
                />
                <span>{leagueMatches[0].league.name}</span>
                <span className={styles.matchCount}>{leagueMatches.length}경기</span>
              </div>
              {leagueMatches.map((match) => (
                <MatchCard key={match.fixture.id} match={match} />
              ))}
            </div>
          ))
        ) : (
          // 필터링된 경기 표시
          filteredMatches.map((match) => (
            <MatchCard key={match.fixture.id} match={match} />
          ))
        )}
      </div>
    </div>
  );
}
