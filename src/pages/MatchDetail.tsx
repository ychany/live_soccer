import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useMatchDetail,
  useMatchLineups,
  useMatchStatistics,
  useMatchEvents,
  useHeadToHead,
  useMatchPrediction,
} from '../hooks/useMatchDetail';
import { Header, Loading, Tabs, EmptyState } from '../components/common';
import { LIVE_STATUSES, FINISHED_STATUSES } from '../constants/leagues';
import { formatMatchTime, formatDateTime, parseForm, getFormColor } from '../utils/format';
import styles from './MatchDetail.module.css';

const TABS = [
  { id: 'comparison', label: '비교' },
  { id: 'stats', label: '통계' },
  { id: 'lineup', label: '라인업' },
  { id: 'standings', label: '순위' },
  { id: 'prediction', label: '예측' },
];

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const fixtureId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('comparison');

  const { data: match, isLoading } = useMatchDetail(fixtureId);
  const { data: events } = useMatchEvents(fixtureId);

  if (isLoading) {
    return (
      <div className="page">
        <Header title="경기 상세" />
        <Loading />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="page">
        <Header title="경기 상세" />
        <EmptyState icon="⚽" message="경기 정보를 찾을 수 없습니다" />
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

        {/* 골 득점자 표시 */}
        {(isLive || isFinished) && goalEvents.length > 0 && (
          <div className={styles.goalScorers}>
            <div className={styles.homeScorers}>
              {homeGoals.map((goal, i) => (
                <span key={i} className={styles.scorer}>
                  ⚽ {goal.player.name} {goal.time.elapsed}'
                  {goal.detail === 'Penalty' && ' (P)'}
                  {goal.detail === 'Own Goal' && ' (자책)'}
                </span>
              ))}
            </div>
            <div className={styles.scorersDivider} />
            <div className={styles.awayScorers}>
              {awayGoals.map((goal, i) => (
                <span key={i} className={styles.scorer}>
                  {goal.player.name} {goal.time.elapsed}'
                  {goal.detail === 'Penalty' && ' (P)'}
                  {goal.detail === 'Own Goal' && ' (자책)'} ⚽
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
        {activeTab === 'comparison' && (
          <ComparisonTab
            homeTeamId={teams.home.id}
            awayTeamId={teams.away.id}
            fixtureId={fixtureId}
          />
        )}
        {activeTab === 'stats' && <StatsTab fixtureId={fixtureId} />}
        {activeTab === 'lineup' && <LineupTab fixtureId={fixtureId} match={match} />}
        {activeTab === 'standings' && (
          <StandingsTab leagueId={league.id} season={league.season} />
        )}
        {activeTab === 'prediction' && <PredictionTab fixtureId={fixtureId} />}
      </div>
    </div>
  );
}

// 비교 탭
function ComparisonTab({
  homeTeamId,
  awayTeamId,
  fixtureId,
}: {
  homeTeamId: number;
  awayTeamId: number;
  fixtureId: number;
}) {
  const { data: h2h, isLoading: h2hLoading } = useHeadToHead(homeTeamId, awayTeamId);
  const { data: prediction } = useMatchPrediction(fixtureId);

  if (h2hLoading) return <Loading />;

  // H2H 통계 계산
  const h2hStats = h2h?.reduce(
    (acc, match) => {
      const homeWin = match.teams.home.id === homeTeamId
        ? match.teams.home.winner
        : match.teams.away.winner;
      const awayWin = match.teams.home.id === awayTeamId
        ? match.teams.home.winner
        : match.teams.away.winner;

      if (homeWin) acc.homeWins++;
      else if (awayWin) acc.awayWins++;
      else acc.draws++;
      return acc;
    },
    { homeWins: 0, draws: 0, awayWins: 0 }
  ) || { homeWins: 0, draws: 0, awayWins: 0 };

  return (
    <div className={styles.comparison}>
      {/* 팀 비교 레이더 차트 대신 간단한 비교 */}
      {prediction && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>승률 예측</h3>
          <div className={styles.predictionBar}>
            <div className={styles.predictionHome} style={{ width: prediction.predictions.percent.home }}>
              {prediction.predictions.percent.home}
            </div>
            <div className={styles.predictionDraw} style={{ width: prediction.predictions.percent.draw }}>
              {prediction.predictions.percent.draw}
            </div>
            <div className={styles.predictionAway} style={{ width: prediction.predictions.percent.away }}>
              {prediction.predictions.percent.away}
            </div>
          </div>
          <div className={styles.predictionLabels}>
            <span>홈 승</span>
            <span>무승부</span>
            <span>원정 승</span>
          </div>
        </div>
      )}

      {/* 상대전적 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>상대전적 (최근 {h2h?.length || 0}경기)</h3>
        <div className={styles.h2hStats}>
          <div className={styles.h2hStat}>
            <span className={styles.h2hValue}>{h2hStats.homeWins}</span>
            <span className={styles.h2hLabel}>홈 승</span>
          </div>
          <div className={styles.h2hStat}>
            <span className={styles.h2hValue}>{h2hStats.draws}</span>
            <span className={styles.h2hLabel}>무</span>
          </div>
          <div className={styles.h2hStat}>
            <span className={styles.h2hValue}>{h2hStats.awayWins}</span>
            <span className={styles.h2hLabel}>원정 승</span>
          </div>
        </div>

        {/* 최근 경기 목록 */}
        {h2h && h2h.length > 0 && (
          <div className={styles.h2hList}>
            {h2h.slice(0, 5).map((match) => (
              <div key={match.fixture.id} className={styles.h2hItem}>
                <span className={styles.h2hDate}>
                  {new Date(match.fixture.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  })}
                </span>
                <span className={styles.h2hTeam}>{match.teams.home.name}</span>
                <span className={styles.h2hScore}>
                  {match.goals.home} - {match.goals.away}
                </span>
                <span className={styles.h2hTeam}>{match.teams.away.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 폼 */}
      {prediction && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>최근 폼</h3>
          <div className={styles.formComparison}>
            <div className={styles.formTeam}>
              <span className={styles.formTeamName}>{prediction.teams.home.name}</span>
              <div className={styles.formBadges}>
                {parseForm(prediction.teams.home.league.form).slice(-5).map((result, i) => (
                  <span
                    key={i}
                    className={styles.formBadge}
                    style={{ background: getFormColor(result) }}
                  >
                    {result}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.formTeam}>
              <span className={styles.formTeamName}>{prediction.teams.away.name}</span>
              <div className={styles.formBadges}>
                {parseForm(prediction.teams.away.league.form).slice(-5).map((result, i) => (
                  <span
                    key={i}
                    className={styles.formBadge}
                    style={{ background: getFormColor(result) }}
                  >
                    {result}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 통계 탭
function StatsTab({ fixtureId }: { fixtureId: number }) {
  const { data: stats, isLoading: statsLoading } = useMatchStatistics(fixtureId);
  const { data: events, isLoading: eventsLoading } = useMatchEvents(fixtureId);

  if (statsLoading || eventsLoading) return <Loading />;

  if (!stats || stats.length < 2) {
    return <EmptyState icon="📊" message="경기 통계가 아직 없습니다" />;
  }

  const homeStats = stats[0];
  const awayStats = stats[1];

  // 통계 항목 매핑
  const getStatValue = (team: typeof homeStats, type: string): number => {
    const stat = team.statistics.find((s) => s.type === type);
    if (!stat || stat.value === null) return 0;
    if (typeof stat.value === 'string') {
      return parseInt(stat.value.replace('%', '')) || 0;
    }
    return stat.value;
  };

  const statItems = [
    { label: '볼 점유율', type: 'Ball Possession', isPercent: true },
    { label: '총 슈팅', type: 'Total Shots' },
    { label: '유효 슈팅', type: 'Shots on Goal' },
    { label: '코너킥', type: 'Corner Kicks' },
    { label: '파울', type: 'Fouls' },
    { label: '오프사이드', type: 'Offsides' },
    { label: '패스 성공률', type: 'Passes %', isPercent: true },
  ];

  return (
    <div className={styles.stats}>
      {/* 통계 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>경기 통계</h3>
        <div className={styles.statsList}>
          {statItems.map(({ label, type, isPercent }) => {
            const homeValue = getStatValue(homeStats, type);
            const awayValue = getStatValue(awayStats, type);
            const total = homeValue + awayValue || 1;
            const homePercent = isPercent ? homeValue : (homeValue / total) * 100;
            const awayPercent = isPercent ? awayValue : (awayValue / total) * 100;

            return (
              <div key={type} className={styles.statItem}>
                <span className={styles.statValue}>{homeValue}{isPercent ? '%' : ''}</span>
                <div className={styles.statBarContainer}>
                  <div className={styles.statLabel}>{label}</div>
                  <div className={styles.statBar}>
                    <div
                      className={styles.statBarHome}
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className={styles.statBarAway}
                      style={{ width: `${awayPercent}%` }}
                    />
                  </div>
                </div>
                <span className={styles.statValue}>{awayValue}{isPercent ? '%' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 타임라인 */}
      {events && events.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>타임라인</h3>
          <div className={styles.timeline}>
            {events.map((event, index) => (
              <div
                key={index}
                className={`${styles.timelineItem} ${
                  event.team.id === homeStats.team.id ? styles.home : styles.away
                }`}
              >
                <div className={styles.timelineTime}>
                  {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ''}
                </div>
                <div className={styles.timelineIcon}>
                  {event.type === 'Goal' && (event.detail === 'Penalty' ? '⚽(P)' : '⚽')}
                  {event.type === 'Card' && event.detail === 'Yellow Card' && '🟨'}
                  {event.type === 'Card' && event.detail === 'Red Card' && '🟥'}
                  {event.type === 'subst' && '🔄'}
                  {event.type === 'Var' && '📺'}
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timelinePlayer}>{event.player.name}</span>
                  {event.assist.name && (
                    <span className={styles.timelineAssist}>({event.assist.name})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 라인업 탭
function LineupTab({
  fixtureId,
  match,
}: {
  fixtureId: number;
  match: NonNullable<ReturnType<typeof useMatchDetail>['data']>;
}) {
  const { data: lineups, isLoading } = useMatchLineups(fixtureId);

  if (isLoading) return <Loading />;

  if (!lineups || lineups.length < 2) {
    return <EmptyState icon="👥" message="라인업 정보가 아직 없습니다" />;
  }

  const homeLineup = lineups[0];
  const awayLineup = lineups[1];

  return (
    <div className={styles.lineup}>
      {/* 포메이션 */}
      <div className={styles.card}>
        <div className={styles.formationHeader}>
          <div className={styles.formationTeam}>
            <img src={match.teams.home.logo} alt="" className={styles.formationLogo} />
            <span>{homeLineup.formation}</span>
          </div>
          <span className={styles.formationVs}>vs</span>
          <div className={styles.formationTeam}>
            <span>{awayLineup.formation}</span>
            <img src={match.teams.away.logo} alt="" className={styles.formationLogo} />
          </div>
        </div>

        {/* 피치 뷰 */}
        <div className={styles.pitch}>
          <div className={styles.pitchHalf}>
            {homeLineup.startXI.map(({ player }) => (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className={styles.pitchPlayer}
                style={getPlayerPosition(player.grid, true)}
              >
                <span className={styles.pitchNumber}>{player.number}</span>
                <span className={styles.pitchName}>{player.name.split(' ').pop()}</span>
              </Link>
            ))}
          </div>
          <div className={styles.pitchHalf}>
            {awayLineup.startXI.map(({ player }) => (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className={`${styles.pitchPlayer} ${styles.away}`}
                style={getPlayerPosition(player.grid, false)}
              >
                <span className={styles.pitchNumber}>{player.number}</span>
                <span className={styles.pitchName}>{player.name.split(' ').pop()}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 교체 선수 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>교체 선수</h3>
        <div className={styles.substitutes}>
          <div className={styles.subsTeam}>
            {homeLineup.substitutes.slice(0, 7).map(({ player }) => (
              <Link key={player.id} to={`/player/${player.id}`} className={styles.subPlayer}>
                <span className={styles.subNumber}>{player.number}</span>
                <span className={styles.subName}>{player.name}</span>
                <span className={styles.subPos}>{player.pos}</span>
              </Link>
            ))}
          </div>
          <div className={styles.subsTeam}>
            {awayLineup.substitutes.slice(0, 7).map(({ player }) => (
              <Link key={player.id} to={`/player/${player.id}`} className={styles.subPlayer}>
                <span className={styles.subNumber}>{player.number}</span>
                <span className={styles.subName}>{player.name}</span>
                <span className={styles.subPos}>{player.pos}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 그리드 위치 -> CSS 위치 변환
function getPlayerPosition(grid: string | null, isHome: boolean): React.CSSProperties {
  if (!grid) return {};

  const [row, col] = grid.split(':').map(Number);
  const totalRows = 5;
  const totalCols = isHome ? 5 : 5;

  // 홈팀은 아래에서 위로, 원정팀은 위에서 아래로
  const top = isHome
    ? `${((totalRows - row) / totalRows) * 100}%`
    : `${((row - 1) / totalRows) * 100}%`;
  const left = `${((col - 1) / (totalCols - 1)) * 80 + 10}%`;

  return { top, left };
}

// 순위 탭
function StandingsTab({ leagueId }: { leagueId: number; season: number }) {
  // 임시로 리그 상세 페이지로 링크
  return (
    <div className={styles.standings}>
      <div className={styles.card}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Link to={`/league/${leagueId}`} style={{ color: 'var(--primary)' }}>
            리그 순위 보기 →
          </Link>
        </p>
      </div>
    </div>
  );
}

// 예측 탭
function PredictionTab({ fixtureId }: { fixtureId: number }) {
  const { data: prediction, isLoading } = useMatchPrediction(fixtureId);

  if (isLoading) return <Loading />;

  if (!prediction) {
    return <EmptyState icon="🔮" message="예측 정보가 없습니다" />;
  }

  return (
    <div className={styles.prediction}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>AI 예측</h3>
        <div className={styles.predictionAdvice}>
          {prediction.predictions.advice}
        </div>

        <div className={styles.predictionWinner}>
          예상 승자: <strong>{prediction.predictions.winner.name}</strong>
          <p className={styles.predictionComment}>{prediction.predictions.winner.comment}</p>
        </div>

        <div className={styles.predictionGoals}>
          <div>
            <span>예상 홈 골</span>
            <strong>{prediction.predictions.goals.home}</strong>
          </div>
          <div>
            <span>예상 원정 골</span>
            <strong>{prediction.predictions.goals.away}</strong>
          </div>
        </div>
      </div>

      {/* 팀 비교 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>팀 비교 분석</h3>
        <div className={styles.comparisonList}>
          {Object.entries(prediction.comparison).map(([key, values]) => (
            <div key={key} className={styles.comparisonItem}>
              <span className={styles.comparisonValue}>{values.home}</span>
              <span className={styles.comparisonLabel}>
                {key === 'form' && '최근 폼'}
                {key === 'att' && '공격력'}
                {key === 'def' && '수비력'}
                {key === 'h2h' && '상대전적'}
                {key === 'goals' && '득점력'}
                {key === 'total' && '종합'}
              </span>
              <span className={styles.comparisonValue}>{values.away}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
