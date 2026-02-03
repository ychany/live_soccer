import { Link } from 'react-router-dom';
import { useLiveMatches, useFeaturedMatches } from '../hooks/useLiveMatches';
import { MatchCard } from '../components/MatchCard';
import { Loading, EmptyState } from '../components/common';
import { TOP_5_LEAGUES, EUROPEAN_COMPETITIONS, K_LEAGUES, LIVE_STATUSES, FINISHED_STATUSES } from '../constants/leagues';
import type { FixtureResponse } from '../types/football';
import styles from './Home.module.css';

// 날짜 포맷 함수
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  if (isToday) return `오늘 (${month}/${day} ${dayOfWeek})`;
  if (isTomorrow) return `내일 (${month}/${day} ${dayOfWeek})`;
  return `${month}/${day} (${dayOfWeek})`;
}

// 경기를 날짜별로 그룹화
function groupByDate(matches: FixtureResponse[]): Map<string, FixtureResponse[]> {
  const grouped = new Map<string, FixtureResponse[]>();

  matches.forEach(match => {
    const dateStr = match.fixture.date.split('T')[0];
    if (!grouped.has(dateStr)) {
      grouped.set(dateStr, []);
    }
    grouped.get(dateStr)!.push(match);
  });

  return grouped;
}

// 경기를 리그별로 그룹화
function groupByLeague(matches: FixtureResponse[]): Map<number, { league: FixtureResponse['league']; matches: FixtureResponse[] }> {
  const grouped = new Map<number, { league: FixtureResponse['league']; matches: FixtureResponse[] }>();

  matches.forEach(match => {
    const leagueId = match.league.id;
    if (!grouped.has(leagueId)) {
      grouped.set(leagueId, { league: match.league, matches: [] });
    }
    grouped.get(leagueId)!.matches.push(match);
  });

  return grouped;
}

export function Home() {
  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();
  const { data: featuredMatches, isLoading: featuredLoading } = useFeaturedMatches();

  // 라이브 경기 필터
  const liveFixtures = liveMatches?.filter(m => LIVE_STATUSES.has(m.fixture.status.short)) || [];

  // 주요 경기 일정 분류 (예정만 - 날짜순 정렬)
  const upcomingFeatured = featuredMatches?.filter(
    m => !LIVE_STATUSES.has(m.fixture.status.short) &&
         !FINISHED_STATUSES.has(m.fixture.status.short)
  ).sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()) || [];

  // 날짜별 그룹화
  const groupedMatches = groupByDate(upcomingFeatured);

  return (
    <div className="page">
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>⚽ Live Soccer</h1>
      </header>

      {/* 리그 바로가기 - 한 줄로 */}
      <section className={styles.leagueSection}>
        <div className={styles.quickActions}>
          {/* 5대 리그 */}
          {TOP_5_LEAGUES.map((league) => (
            <Link
              key={league.id}
              to={`/league/${league.id}`}
              className={styles.quickAction}
            >
              <span className={styles.quickActionFlag}>{league.flag}</span>
              <span className={styles.quickActionName}>{league.name}</span>
            </Link>
          ))}
          {/* 구분선 */}
          <span className={styles.divider} />
          {/* 유럽 대회 */}
          {EUROPEAN_COMPETITIONS.map((comp) => (
            <Link
              key={comp.id}
              to={`/league/${comp.id}`}
              className={styles.quickAction}
            >
              <span className={styles.quickActionFlag}>{comp.flag}</span>
              <span className={styles.quickActionName}>{comp.name}</span>
            </Link>
          ))}
          {/* 구분선 */}
          <span className={styles.divider} />
          {/* K리그 */}
          {K_LEAGUES.map((league) => (
            <Link
              key={league.id}
              to={`/league/${league.id}`}
              className={styles.quickAction}
            >
              <span className={styles.quickActionFlag}>{league.flag}</span>
              <span className={styles.quickActionName}>{league.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Matches - 작은 카드로 가로 스크롤 */}
      {liveLoading ? null : liveFixtures.length > 0 && (
        <section className={styles.liveSection}>
          <div className={styles.liveSectionHeader}>
            <div className={styles.liveTitle}>
              <span className={styles.liveDot} />
              <span>LIVE</span>
              <span className={styles.liveCount}>{liveFixtures.length}경기</span>
            </div>
            <Link to="/live" className={styles.viewAll}>
              전체보기 →
            </Link>
          </div>
          <div className={styles.liveScroll}>
            {liveFixtures.slice(0, 10).map((match) => (
              <LiveMatchCard key={match.fixture.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* 주요 경기 일정 (일주일) */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">📅 주요 경기 일정</h2>
        </div>

        {featuredLoading ? (
          <Loading />
        ) : groupedMatches.size === 0 ? (
          <div className={styles.emptyCard}>
            <EmptyState
              icon="📅"
              message="예정된 주요 경기가 없습니다"
            />
          </div>
        ) : (
          <div className={styles.scheduleContainer}>
            {Array.from(groupedMatches.entries()).map(([dateStr, matches]) => {
              const leagueGroups = groupByLeague(matches);
              return (
                <div key={dateStr} className={styles.dateGroup}>
                  <h4 className={styles.dateLabel}>{formatDateLabel(dateStr)}</h4>
                  {Array.from(leagueGroups.values()).map(({ league, matches: leagueMatches }) => (
                    <div key={league.id} className={styles.leagueGroup}>
                      <Link to={`/league/${league.id}`} className={styles.leagueGroupHeader}>
                        <img src={league.logo} alt="" className={styles.leagueGroupLogo} />
                        <span className={styles.leagueGroupName}>{league.name}</span>
                        <span className={styles.leagueGroupCountry}>{league.country}</span>
                      </Link>
                      <div className={styles.matchList}>
                        {leagueMatches.map((match) => (
                          <MatchCard key={match.fixture.id} match={match} hideLeague />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// 작은 라이브 경기 카드 컴포넌트
function LiveMatchCard({ match }: { match: FixtureResponse }) {
  const { fixture, league, teams, goals } = match;

  const getStatusDisplay = () => {
    if (fixture.status.short === 'HT') return 'HT';
    const elapsed = fixture.status.elapsed;
    const extra = fixture.status.extra;
    if (elapsed) {
      if (extra && extra > 0) return `${elapsed}+${extra}'`;
      return `${elapsed}'`;
    }
    return fixture.status.short;
  };

  return (
    <Link to={`/match/${fixture.id}`} className={styles.liveCard}>
      <div className={styles.liveCardHeader}>
        <span className={styles.liveLeague}>{league.name}</span>
        <span className={styles.liveTime}>{getStatusDisplay()}</span>
      </div>
      <div className={styles.liveTeam}>
        <img src={teams.home.logo} alt="" className={styles.liveTeamLogo} />
        <span className={styles.liveTeamName}>{teams.home.name}</span>
        <span className={styles.liveScore}>{goals.home ?? 0}</span>
      </div>
      <div className={styles.liveTeam}>
        <img src={teams.away.logo} alt="" className={styles.liveTeamLogo} />
        <span className={styles.liveTeamName}>{teams.away.name}</span>
        <span className={styles.liveScore}>{goals.away ?? 0}</span>
      </div>
    </Link>
  );
}
