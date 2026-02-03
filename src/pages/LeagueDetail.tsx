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
import type { TopScorer } from '../types/football';
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

// 순위 탭 - 서브탭 포함 (순위/득점/도움)
type StandingsSubTab = 'rank' | 'goals' | 'assists';

function StandingsTab({ leagueId, season }: { leagueId: number; season: number }) {
  const [subTab, setSubTab] = useState<StandingsSubTab>('rank');
  const { data: standings, isLoading: standingsLoading } = useLeagueStandings(leagueId, season);
  const { data: topScorers, isLoading: scorersLoading } = useTopScorers(leagueId, season);
  const { data: topAssists, isLoading: assistsLoading } = useTopAssists(leagueId, season);

  return (
    <div className={styles.standings}>
      {/* 서브탭 */}
      <div className={styles.subTabBar}>
        <button
          className={`${styles.subTabBtn} ${subTab === 'rank' ? styles.active : ''}`}
          onClick={() => setSubTab('rank')}
        >
          순위
        </button>
        <button
          className={`${styles.subTabBtn} ${subTab === 'goals' ? styles.active : ''}`}
          onClick={() => setSubTab('goals')}
        >
          득점
        </button>
        <button
          className={`${styles.subTabBtn} ${subTab === 'assists' ? styles.active : ''}`}
          onClick={() => setSubTab('assists')}
        >
          도움
        </button>
      </div>

      {/* 서브탭 콘텐츠 */}
      {subTab === 'rank' && (
        <RankTable standings={standings?.league.standings[0] || []} isLoading={standingsLoading} />
      )}
      {subTab === 'goals' && (
        <PlayerRankingList
          players={topScorers || []}
          isLoading={scorersLoading}
          statKey="goals"
          emptyMessage="득점 순위 정보가 없습니다"
        />
      )}
      {subTab === 'assists' && (
        <PlayerRankingList
          players={topAssists || []}
          isLoading={assistsLoading}
          statKey="assists"
          emptyMessage="도움 순위 정보가 없습니다"
        />
      )}
    </div>
  );
}

// 순위표
interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

function RankTable({ standings, isLoading }: { standings: Standing[]; isLoading: boolean }) {
  if (isLoading) return <Loading />;
  if (!standings || standings.length === 0) {
    return <EmptyState icon="📊" message="순위 정보가 없습니다" />;
  }

  return (
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
      {standings.map((standing) => (
        <Link
          key={standing.team.id}
          to={`/team/${standing.team.id}`}
          className={styles.standingsRow}
        >
          <span className={`${styles.colRank} ${getRankClass(standing.rank, standings.length)}`}>
            {standing.rank}
          </span>
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
  );
}

function getRankClass(rank: number, total: number): string {
  if (rank <= 4) return styles.rankUcl;
  if (rank <= 6) return styles.rankUel;
  if (rank > total - 3) return styles.rankRelegation;
  return '';
}

// 선수 순위 리스트
interface PlayerRankingListProps {
  players: TopScorer[];
  isLoading: boolean;
  statKey: 'goals' | 'assists';
  emptyMessage: string;
}

function PlayerRankingList({ players, isLoading, statKey, emptyMessage }: PlayerRankingListProps) {
  if (isLoading) return <Loading />;
  if (!players || players.length === 0) {
    return <EmptyState icon="⚽" message={emptyMessage} />;
  }

  return (
    <div className={styles.playerRanking}>
      {players.map((item, idx) => {
        const stat = statKey === 'goals'
          ? item.statistics[0]?.goals?.total ?? 0
          : item.statistics[0]?.goals?.assists ?? 0;
        const appearances = item.statistics[0]?.games?.appearences ?? 0;

        return (
          <Link
            key={item.player.id}
            to={`/player/${item.player.id}`}
            className={styles.rankingItem}
          >
            <span className={`${styles.rankingRank} ${getRankBadgeClass(idx + 1)}`}>
              {idx + 1}
            </span>
            <img
              src={item.player.photo}
              alt=""
              className={styles.rankingPhoto}
            />
            <div className={styles.rankingInfo}>
              <span className={styles.rankingName}>{item.player.name}</span>
              <span className={styles.rankingTeam}>{item.statistics[0]?.team?.name}</span>
            </div>
            <span className={styles.rankingApps}>{appearances}경기</span>
            <span className={styles.rankingValue}>{stat}</span>
          </Link>
        );
      })}
    </div>
  );
}

function getRankBadgeClass(rank: number): string {
  if (rank === 1) return styles.rankGold;
  if (rank === 2) return styles.rankSilver;
  if (rank === 3) return styles.rankBronze;
  return '';
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
            <MatchCard key={match.fixture.id} match={match} hideLeague />
          ))}
        </div>
      )}
    </div>
  );
}

// 통계 탭
function StatsTab({ leagueId, season }: { leagueId: number; season: number }) {
  const { data: standings, isLoading: standingsLoading } = useLeagueStandings(leagueId, season);
  const { data: topScorers, isLoading: scorersLoading } = useTopScorers(leagueId, season);
  const { data: topAssists, isLoading: assistsLoading } = useTopAssists(leagueId, season);

  if (standingsLoading || scorersLoading || assistsLoading) return <Loading />;

  const standingsList = standings?.league.standings[0] || [];

  // 리그 통계 계산
  const totalMatches = standingsList.reduce((sum, t) => sum + t.all.played, 0) / 2;
  const totalGoals = standingsList.reduce((sum, t) => sum + t.all.goals.for, 0);
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0';

  const topTeam = standingsList[0];
  const bottomTeam = standingsList[standingsList.length - 1];

  // 최근 폼 상위 3팀
  const formTeams = standingsList
    .filter(t => t.form)
    .sort((a, b) => {
      const formScore = (form: string) =>
        form.split('').reduce((sum, c) => sum + (c === 'W' ? 3 : c === 'D' ? 1 : 0), 0);
      return formScore(b.form!) - formScore(a.form!);
    })
    .slice(0, 3);

  return (
    <div className={styles.stats}>
      {/* 리그 개요 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📊 리그 개요</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{Math.round(totalMatches)}</span>
            <span className={styles.statLabel}>총 경기</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalGoals}</span>
            <span className={styles.statLabel}>총 골</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{avgGoals}</span>
            <span className={styles.statLabel}>경기당 골</span>
          </div>
        </div>
      </div>

      {/* 최고/최저 팀 */}
      {topTeam && bottomTeam && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🏆 순위</h3>
          <div className={styles.teamCompare}>
            <Link to={`/team/${topTeam.team.id}`} className={styles.teamCompareItem}>
              <span className={styles.teamCompareLabel}>1위</span>
              <img src={topTeam.team.logo} alt="" className={styles.teamCompareLogo} />
              <span className={styles.teamCompareName}>{topTeam.team.name}</span>
              <span className={styles.teamComparePoints}>{topTeam.points}점</span>
            </Link>
            <Link to={`/team/${bottomTeam.team.id}`} className={styles.teamCompareItem}>
              <span className={styles.teamCompareLabel}>{standingsList.length}위</span>
              <img src={bottomTeam.team.logo} alt="" className={styles.teamCompareLogo} />
              <span className={styles.teamCompareName}>{bottomTeam.team.name}</span>
              <span className={styles.teamComparePoints}>{bottomTeam.points}점</span>
            </Link>
          </div>
        </div>
      )}

      {/* 최근 폼 */}
      {formTeams.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🔥 최근 폼</h3>
          <div className={styles.formList}>
            {formTeams.map((team, idx) => (
              <Link key={team.team.id} to={`/team/${team.team.id}`} className={styles.formItem}>
                <span className={`${styles.formRank} ${getRankBadgeClass(idx + 1)}`}>{idx + 1}</span>
                <img src={team.team.logo} alt="" className={styles.formTeamLogo} />
                <span className={styles.formTeamName}>{team.team.name}</span>
                <div className={styles.formBadges}>
                  {team.form?.split('').slice(-5).map((f, i) => (
                    <span key={i} className={`${styles.formBadge} ${styles[`form${f}`]}`}>
                      {f === 'W' ? '승' : f === 'D' ? '무' : '패'}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 득점 순위 TOP 5 */}
      {topScorers && topScorers.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⚽ 득점 순위</h3>
          <div className={styles.miniPlayerList}>
            {topScorers.slice(0, 5).map((item, idx) => (
              <Link key={item.player.id} to={`/player/${item.player.id}`} className={styles.miniPlayerRow}>
                <span className={`${styles.miniRank} ${getRankBadgeClass(idx + 1)}`}>{idx + 1}</span>
                <img src={item.player.photo} alt="" className={styles.miniPhoto} />
                <div className={styles.miniInfo}>
                  <span className={styles.miniName}>{item.player.name}</span>
                  <span className={styles.miniTeam}>{item.statistics[0]?.team?.name}</span>
                </div>
                <span className={styles.miniStat}>{item.statistics[0]?.goals?.total ?? 0}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 도움 순위 TOP 5 */}
      {topAssists && topAssists.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🤝 도움 순위</h3>
          <div className={styles.miniPlayerList}>
            {topAssists.slice(0, 5).map((item, idx) => (
              <Link key={item.player.id} to={`/player/${item.player.id}`} className={styles.miniPlayerRow}>
                <span className={`${styles.miniRank} ${getRankBadgeClass(idx + 1)}`}>{idx + 1}</span>
                <img src={item.player.photo} alt="" className={styles.miniPhoto} />
                <div className={styles.miniInfo}>
                  <span className={styles.miniName}>{item.player.name}</span>
                  <span className={styles.miniTeam}>{item.statistics[0]?.team?.name}</span>
                </div>
                <span className={styles.miniStat}>{item.statistics[0]?.goals?.assists ?? 0}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!topScorers || topScorers.length === 0) &&
        (!topAssists || topAssists.length === 0) &&
        standingsList.length === 0 && (
          <EmptyState icon="📈" message="통계 정보가 없습니다" />
        )}
    </div>
  );
}
