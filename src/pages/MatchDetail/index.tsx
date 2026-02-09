import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useMatchDetail,
  useMatchEvents,
} from '../../hooks/useMatchDetail';
import { Header, Tabs, EmptyState, TabContent } from '../../components/common';
import { LIVE_STATUSES, FINISHED_STATUSES } from '../../constants/leagues';
import { formatMatchTime, formatDateTime } from '../../utils/format';
import { Calendar } from 'lucide-react';
import styles from './MatchDetail.module.css';
import { ComparisonTab } from './tabs/ComparisonTab';
import { StatsTab } from './tabs/StatsTab';
import { LineupTab } from './tabs/LineupTab';
import { StandingsTab } from './tabs/StandingsTab';
import { PredictionTab } from './tabs/PredictionTab';
import { SkeletonPage } from '../../components/skeletons/SkeletonPage';

const TABS = [
  { id: 'comparison', label: '비교' },
  { id: 'stats', label: '통계' },
  { id: 'lineup', label: '라인업' },
  { id: 'standings', label: '순위' },
  { id: 'prediction', label: '예측' },
];

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('comparison');

  const { data: match, isLoading: matchLoading } = useMatchDetail(matchId);
  const { data: events } = useMatchEvents(matchId);

  if (matchLoading) {
    return <SkeletonPage title="경기 상세" />;
  }

  if (!match) {
    return (
      <div className="page">
        <Header title="경기 상세" />
        <EmptyState icon={<Calendar size={48} />} message="경기 정보를 찾을 수 없습니다" />
      </div>
    );
  }

  const { fixture, teams, goals, league } = match;
  const isLive = LIVE_STATUSES.has(fixture.status.short);
  const isFinished = FINISHED_STATUSES.has(fixture.status.short);

  // 골 이벤트 필터링
  const goalEvents = events?.filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty') || [];
  const homeGoals = goalEvents.filter(e => e.team.id === teams.home.id);
  const awayGoals = goalEvents.filter(e => e.team.id === teams.away.id);

  // 레드카드 이벤트 필터링
  const redCardEvents = events?.filter(e => e.type === 'Card' && e.detail === 'Red Card') || [];
  const homeRedCards = redCardEvents.filter(e => e.team.id === teams.home.id);
  const awayRedCards = redCardEvents.filter(e => e.team.id === teams.away.id);

  return (
    <div className="page">
      <Header title="경기 상세" />

      {/* Match Header */}
      <div className={styles.matchHeader}>
        {/* 리그 정보 - 클릭 가능 */}
        <Link to={`/league/${league.id}`} className={styles.leagueInfo}>
          <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
          <span>{league.name}</span>
          <span className={styles.leagueArrow}>›</span>
        </Link>

        {/* 상태 배지 */}
        <div className={styles.statusArea}>
          {isLive ? (
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span>{formatMatchTime(fixture.status.elapsed, fixture.status.short)}</span>
            </div>
          ) : isFinished ? (
            <div className={styles.statusBadges}>
              <span className={styles.finishedBadge}>경기 종료</span>
              <span className={styles.dateBadge}>{formatDateTime(fixture.date)}</span>
            </div>
          ) : (
            <span className={styles.dateBadge}>{formatDateTime(fixture.date)}</span>
          )}
        </div>

        {/* 팀 + 스코어 */}
        <div className={styles.teams}>
          <Link to={`/team/${teams.home.id}`} className={styles.team}>
            <img src={teams.home.logo} alt={teams.home.name} className={styles.teamLogo} />
            <span className={styles.teamName}>{teams.home.name}</span>
          </Link>

          <div className={`${styles.scoreBox} ${isLive ? styles.live : ''} ${isFinished ? styles.finished : ''}`}>
            {isLive || isFinished ? (
              <span className={styles.score}>{goals.home ?? 0} - {goals.away ?? 0}</span>
            ) : (
              <span className={styles.vs}>VS</span>
            )}
          </div>

          <Link to={`/team/${teams.away.id}`} className={styles.team}>
            <img src={teams.away.logo} alt={teams.away.name} className={styles.teamLogo} />
            <span className={styles.teamName}>{teams.away.name}</span>
          </Link>
        </div>

        {/* 골 득점자 & 레드카드 표시 */}
        {(isLive || isFinished) && (goalEvents.length > 0 || redCardEvents.length > 0) && (
          <div className={styles.goalScorers}>
            <div className={styles.homeScorers}>
              {homeGoals.map((goal, i) => (
                <span key={`goal-${i}`} className={styles.scorer}>
                  ⚽ {goal.player.name} {goal.time.elapsed}'
                  {goal.detail === 'Penalty' && ' (P)'}
                  {goal.detail === 'Own Goal' && ' (자책)'}
                </span>
              ))}
              {homeRedCards.map((card, i) => (
                <span key={`red-${i}`} className={styles.redCard}>
                  🟥 {card.player.name} {card.time.elapsed}'
                </span>
              ))}
            </div>
            <div className={styles.scorersDivider} />
            <div className={styles.awayScorers}>
              {awayGoals.map((goal, i) => (
                <span key={`goal-${i}`} className={styles.scorer}>
                  {goal.player.name} {goal.time.elapsed}'
                  {goal.detail === 'Penalty' && ' (P)'}
                  {goal.detail === 'Own Goal' && ' (자책)'} ⚽
                </span>
              ))}
              {awayRedCards.map((card, i) => (
                <span key={`red-${i}`} className={styles.redCard}>
                  {card.player.name} {card.time.elapsed}' 🟥
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <TabContent id={activeTab}>
          {activeTab === 'comparison' && (
            <ComparisonTab
              homeTeamId={teams.home.id}
              awayTeamId={teams.away.id}
              fixtureId={matchId}
              leagueId={league.id}
              season={league.season}
            />
          )}
          {activeTab === 'stats' && <StatsTab fixtureId={matchId} />}
          {activeTab === 'lineup' && <LineupTab fixtureId={matchId} match={match} />}
          {activeTab === 'standings' && (
            <StandingsTab
              leagueId={league.id}
              season={league.season}
              homeTeamId={teams.home.id}
              awayTeamId={teams.away.id}
            />
          )}
          {activeTab === 'prediction' && <PredictionTab fixtureId={matchId} />}
        </TabContent>
      </div>
    </div>
  );
}


