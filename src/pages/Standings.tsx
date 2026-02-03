import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStandings, getTopScorers, getTopAssists } from '../api/football';
import { Loading, EmptyState } from '../components/common';
import { TOP_5_LEAGUES, EUROPEAN_COMPETITIONS, K_LEAGUES, getCurrentSeason } from '../constants/leagues';
import type { TopScorer } from '../types/football';
import styles from './Standings.module.css';

const ALL_LEAGUES = [
  ...TOP_5_LEAGUES.map(l => ({ ...l, name: l.name })),
  ...EUROPEAN_COMPETITIONS.map(c => ({ ...c, name: c.name })),
  ...K_LEAGUES.map(l => ({ ...l, name: l.name })),
];

type TabType = 'standings' | 'goals' | 'assists' | 'stats';

export function Standings() {
  const [selectedLeagueId, setSelectedLeagueId] = useState(TOP_5_LEAGUES[0].id);
  const [activeTab, setActiveTab] = useState<TabType>('standings');
  const season = getCurrentSeason();

  const { data: standingsData, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', selectedLeagueId, season],
    queryFn: () => getStandings(selectedLeagueId, season),
  });

  const { data: topScorers, isLoading: scorersLoading } = useQuery({
    queryKey: ['topScorers', selectedLeagueId, season],
    queryFn: () => getTopScorers(selectedLeagueId, season),
    enabled: activeTab === 'goals' || activeTab === 'stats',
  });

  const { data: topAssists, isLoading: assistsLoading } = useQuery({
    queryKey: ['topAssists', selectedLeagueId, season],
    queryFn: () => getTopAssists(selectedLeagueId, season),
    enabled: activeTab === 'assists' || activeTab === 'stats',
  });

  const standings = standingsData?.league.standings[0] || [];

  return (
    <div className="page">
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>순위</h1>
      </header>

      {/* 리그 선택 */}
      <div className={styles.leagueSelector}>
        {ALL_LEAGUES.map((league) => (
          <button
            key={league.id}
            className={`${styles.leagueBtn} ${selectedLeagueId === league.id ? styles.active : ''}`}
            onClick={() => setSelectedLeagueId(league.id)}
          >
            <img src={league.logo} alt="" className={styles.leagueLogo} />
            <span className={styles.leagueName}>{league.name}</span>
          </button>
        ))}
      </div>

      {/* 탭 */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'standings' ? styles.active : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          순위
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'goals' ? styles.active : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          득점
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'assists' ? styles.active : ''}`}
          onClick={() => setActiveTab('assists')}
        >
          도움
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          통계
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className={styles.content}>
        {activeTab === 'standings' && (
          <StandingsTab standings={standings} isLoading={standingsLoading} />
        )}
        {activeTab === 'goals' && (
          <PlayerRankingTab
            players={topScorers || []}
            isLoading={scorersLoading}
            statKey="goals"
            emptyMessage="득점 순위 정보가 없습니다"
          />
        )}
        {activeTab === 'assists' && (
          <PlayerRankingTab
            players={topAssists || []}
            isLoading={assistsLoading}
            statKey="assists"
            emptyMessage="도움 순위 정보가 없습니다"
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab
            standings={standings}
            topScorers={topScorers || []}
            topAssists={topAssists || []}
            isLoading={standingsLoading || scorersLoading || assistsLoading}
          />
        )}
      </div>
    </div>
  );
}

// 순위 탭
interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

function StandingsTab({ standings, isLoading }: { standings: Standing[]; isLoading: boolean }) {
  if (isLoading) return <Loading />;
  if (standings.length === 0) return <EmptyState icon="📊" message="순위 정보가 없습니다" />;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rankCol}>#</th>
            <th className={styles.teamCol}>팀</th>
            <th>경기</th>
            <th>승</th>
            <th>무</th>
            <th>패</th>
            <th>득</th>
            <th>실</th>
            <th>득실</th>
            <th>승점</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr key={team.team.id}>
              <td className={styles.rankCol}>
                <span className={getRankClass(team.rank, standings.length)}>
                  {team.rank}
                </span>
              </td>
              <td className={styles.teamCol}>
                <Link to={`/team/${team.team.id}`} className={styles.teamCell}>
                  <img src={team.team.logo} alt="" className={styles.teamLogo} />
                  <span className={styles.teamName}>{team.team.name}</span>
                </Link>
              </td>
              <td>{team.all.played}</td>
              <td>{team.all.win}</td>
              <td>{team.all.draw}</td>
              <td>{team.all.lose}</td>
              <td>{team.all.goals.for}</td>
              <td>{team.all.goals.against}</td>
              <td className={team.goalsDiff > 0 ? styles.positive : team.goalsDiff < 0 ? styles.negative : ''}>
                {team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
              </td>
              <td className={styles.points}>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getRankClass(rank: number, total: number): string {
  if (rank <= 4) return styles.rankUcl;
  if (rank <= 6) return styles.rankUel;
  if (rank > total - 3) return styles.rankRelegation;
  return '';
}

// 선수 순위 탭 (득점/도움)
interface PlayerRankingTabProps {
  players: TopScorer[];
  isLoading: boolean;
  statKey: 'goals' | 'assists';
  emptyMessage: string;
}

function PlayerRankingTab({ players, isLoading, statKey, emptyMessage }: PlayerRankingTabProps) {
  if (isLoading) return <Loading />;
  if (players.length === 0) return <EmptyState icon="⚽" message={emptyMessage} />;

  return (
    <div className={styles.playerList}>
      {players.map((item, idx) => {
        const stat = statKey === 'goals'
          ? item.statistics[0]?.goals?.total ?? 0
          : item.statistics[0]?.goals?.assists ?? 0;
        const appearances = item.statistics[0]?.games?.appearences ?? 0;

        return (
          <Link
            key={item.player.id}
            to={`/player/${item.player.id}`}
            className={styles.playerRow}
          >
            <span className={`${styles.playerRank} ${getRankBadgeClass(idx + 1)}`}>
              {idx + 1}
            </span>
            <img
              src={item.player.photo}
              alt=""
              className={styles.playerPhoto}
            />
            <div className={styles.playerInfo}>
              <span className={styles.playerName}>{item.player.name}</span>
              <span className={styles.playerTeam}>{item.statistics[0]?.team?.name}</span>
            </div>
            <span className={styles.playerApps}>{appearances}경기</span>
            <span className={styles.playerStat}>{stat}</span>
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

// 통계 탭
interface StatsTabProps {
  standings: Standing[];
  topScorers: TopScorer[];
  topAssists: TopScorer[];
  isLoading: boolean;
}

function StatsTab({ standings, topScorers, topAssists, isLoading }: StatsTabProps) {
  if (isLoading) return <Loading />;

  // 리그 통계 계산
  const totalMatches = standings.reduce((sum, t) => sum + t.all.played, 0) / 2;
  const totalGoals = standings.reduce((sum, t) => sum + t.all.goals.for, 0);
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0';

  const topTeam = standings[0];
  const bottomTeam = standings[standings.length - 1];

  // 최근 폼 상위 3팀
  const formTeams = standings
    .filter(t => t.form)
    .sort((a, b) => {
      const formScore = (form: string) =>
        form.split('').reduce((sum, c) => sum + (c === 'W' ? 3 : c === 'D' ? 1 : 0), 0);
      return formScore(b.form!) - formScore(a.form!);
    })
    .slice(0, 3);

  return (
    <div className={styles.statsContainer}>
      {/* 리그 개요 */}
      <div className={styles.statsCard}>
        <h3 className={styles.statsCardTitle}>📊 리그 개요</h3>
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
        <div className={styles.statsCard}>
          <h3 className={styles.statsCardTitle}>🏆 순위</h3>
          <div className={styles.teamCompare}>
            <Link to={`/team/${topTeam.team.id}`} className={styles.teamCompareItem}>
              <span className={styles.teamCompareLabel}>1위</span>
              <img src={topTeam.team.logo} alt="" className={styles.teamCompareLogo} />
              <span className={styles.teamCompareName}>{topTeam.team.name}</span>
              <span className={styles.teamComparePoints}>{topTeam.points}점</span>
            </Link>
            <Link to={`/team/${bottomTeam.team.id}`} className={styles.teamCompareItem}>
              <span className={styles.teamCompareLabel}>{standings.length}위</span>
              <img src={bottomTeam.team.logo} alt="" className={styles.teamCompareLogo} />
              <span className={styles.teamCompareName}>{bottomTeam.team.name}</span>
              <span className={styles.teamComparePoints}>{bottomTeam.points}점</span>
            </Link>
          </div>
        </div>
      )}

      {/* 최근 폼 */}
      {formTeams.length > 0 && (
        <div className={styles.statsCard}>
          <h3 className={styles.statsCardTitle}>🔥 최근 폼</h3>
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
      {topScorers.length > 0 && (
        <div className={styles.statsCard}>
          <h3 className={styles.statsCardTitle}>⚽ 득점 순위</h3>
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
      {topAssists.length > 0 && (
        <div className={styles.statsCard}>
          <h3 className={styles.statsCardTitle}>🤝 도움 순위</h3>
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
    </div>
  );
}
