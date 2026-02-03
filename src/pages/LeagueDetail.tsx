import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useLeagueInfo,
  useLeagueStandings,
  useLeagueFixtures,
  useTopScorers,
  useTopAssists,
} from '../hooks/useLeague';
import { Header, Loading, Tabs, EmptyState } from '../components/common';
import { MatchCard } from '../components/MatchCard';
import { FINISHED_STATUSES } from '../constants/leagues';
import styles from './LeagueDetail.module.css';

const TABS = [
  { id: 'standings', label: '순위' },
  { id: 'schedule', label: '일정' },
  { id: 'stats', label: '통계' },
];

export function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const leagueId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('standings');

  const { data: leagueInfo, isLoading } = useLeagueInfo(leagueId);

  if (isLoading) {
    return (
      <div className="page">
        <Header title="리그 정보" />
        <Loading />
      </div>
    );
  }

  if (!leagueInfo) {
    return (
      <div className="page">
        <Header title="리그 정보" />
        <EmptyState icon="🏆" message="리그 정보를 찾을 수 없습니다" />
      </div>
    );
  }

  const { league, country, seasons } = leagueInfo;
  const currentSeason = seasons.find((s) => s.current)?.year || seasons[0]?.year;

  return (
    <div className="page">
      <Header title="리그 정보" />

      {/* League Header */}
      <div className={styles.leagueHeader}>
        <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
        <div className={styles.leagueInfo}>
          <h1 className={styles.leagueName}>{league.name}</h1>
          <div className={styles.leagueMeta}>
            {country.flag && <img src={country.flag} alt="" className={styles.countryFlag} />}
            <span>{country.name}</span>
            <span>·</span>
            <span>{currentSeason}/{currentSeason + 1} 시즌</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'standings' && (
          <StandingsTab leagueId={leagueId} season={currentSeason} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab leagueId={leagueId} season={currentSeason} />
        )}
        {activeTab === 'stats' && (
          <StatsTab leagueId={leagueId} season={currentSeason} />
        )}
      </div>
    </div>
  );
}

// 순위 탭
function StandingsTab({ leagueId, season }: { leagueId: number; season: number }) {
  const { data: standings, isLoading } = useLeagueStandings(leagueId, season);

  if (isLoading) return <Loading />;

  if (!standings || !standings.league.standings[0]) {
    return <EmptyState icon="📊" message="순위 정보가 없습니다" />;
  }

  const standingsList = standings.league.standings[0];

  return (
    <div className={styles.standings}>
      <div className={styles.standingsTable}>
        <div className={styles.standingsHeader}>
          <span className={styles.colRank}>#</span>
          <span className={styles.colTeam}>팀</span>
          <span className={styles.colStat}>경기</span>
          <span className={styles.colStat}>승</span>
          <span className={styles.colStat}>무</span>
          <span className={styles.colStat}>패</span>
          <span className={styles.colStat}>득실</span>
          <span className={styles.colPts}>승점</span>
        </div>
        {standingsList.map((standing) => (
          <Link
            key={standing.team.id}
            to={`/team/${standing.team.id}`}
            className={styles.standingsRow}
          >
            <span className={styles.colRank}>{standing.rank}</span>
            <span className={styles.colTeam}>
              <img src={standing.team.logo} alt="" className={styles.teamLogoSm} />
              <span className={styles.teamName}>{standing.team.name}</span>
            </span>
            <span className={styles.colStat}>{standing.all.played}</span>
            <span className={styles.colStat}>{standing.all.win}</span>
            <span className={styles.colStat}>{standing.all.draw}</span>
            <span className={styles.colStat}>{standing.all.lose}</span>
            <span className={styles.colStat}>
              {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
            </span>
            <span className={styles.colPts}>{standing.points}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 일정 탭
function ScheduleTab({ leagueId, season }: { leagueId: number; season: number }) {
  const { data: fixtures, isLoading } = useLeagueFixtures(leagueId, season);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  if (isLoading) return <Loading />;

  if (!fixtures || fixtures.length === 0) {
    return <EmptyState icon="📅" message="경기 일정이 없습니다" />;
  }

  const now = new Date();
  const sortedFixtures = [...fixtures].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );

  const upcomingMatches = sortedFixtures.filter(
    (f) => new Date(f.fixture.date) > now && !FINISHED_STATUSES.has(f.fixture.status.short)
  );
  const pastMatches = sortedFixtures
    .filter((f) => FINISHED_STATUSES.has(f.fixture.status.short))
    .reverse();

  const displayMatches =
    filter === 'all'
      ? sortedFixtures
      : filter === 'upcoming'
        ? upcomingMatches.slice(0, 20)
        : pastMatches.slice(0, 20);

  return (
    <div className={styles.schedule}>
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${filter === 'upcoming' ? styles.active : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          예정
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'past' ? styles.active : ''}`}
          onClick={() => setFilter('past')}
        >
          결과
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
      </div>

      {displayMatches.length === 0 ? (
        <EmptyState icon="📅" message="해당하는 경기가 없습니다" />
      ) : (
        <div className={styles.matchList}>
          {displayMatches.map((match) => (
            <MatchCard key={match.fixture.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

// 통계 탭
function StatsTab({ leagueId, season }: { leagueId: number; season: number }) {
  const { data: topScorers, isLoading: scorersLoading } = useTopScorers(leagueId, season);
  const { data: topAssists, isLoading: assistsLoading } = useTopAssists(leagueId, season);

  if (scorersLoading || assistsLoading) return <Loading />;

  return (
    <div className={styles.stats}>
      {/* 득점 순위 */}
      {topScorers && topScorers.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>득점 순위</h3>
          <div className={styles.playerRanking}>
            {topScorers.slice(0, 10).map((scorer, index) => (
              <Link
                key={scorer.player.id}
                to={`/player/${scorer.player.id}`}
                className={styles.rankingItem}
              >
                <span className={styles.rankingRank}>{index + 1}</span>
                <img
                  src={scorer.player.photo}
                  alt=""
                  className={styles.rankingPhoto}
                />
                <div className={styles.rankingInfo}>
                  <span className={styles.rankingName}>{scorer.player.name}</span>
                  <span className={styles.rankingTeam}>
                    {scorer.statistics[0]?.team.name}
                  </span>
                </div>
                <span className={styles.rankingValue}>
                  {scorer.statistics[0]?.goals.total || 0}골
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 도움 순위 */}
      {topAssists && topAssists.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>도움 순위</h3>
          <div className={styles.playerRanking}>
            {topAssists.slice(0, 10).map((player, index) => (
              <Link
                key={player.player.id}
                to={`/player/${player.player.id}`}
                className={styles.rankingItem}
              >
                <span className={styles.rankingRank}>{index + 1}</span>
                <img
                  src={player.player.photo}
                  alt=""
                  className={styles.rankingPhoto}
                />
                <div className={styles.rankingInfo}>
                  <span className={styles.rankingName}>{player.player.name}</span>
                  <span className={styles.rankingTeam}>
                    {player.statistics[0]?.team.name}
                  </span>
                </div>
                <span className={styles.rankingValue}>
                  {player.statistics[0]?.goals.assists || 0}도움
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!topScorers || topScorers.length === 0) &&
        (!topAssists || topAssists.length === 0) && (
          <EmptyState icon="📈" message="통계 정보가 없습니다" />
        )}
    </div>
  );
}
