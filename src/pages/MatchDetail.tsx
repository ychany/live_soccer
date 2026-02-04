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
import { useLeagueStandings } from '../hooks/useLeague';
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
          <StandingsTab
            leagueId={league.id}
            season={league.season}
            homeTeamId={teams.home.id}
            awayTeamId={teams.away.id}
          />
        )}
        {activeTab === 'prediction' && <PredictionTab fixtureId={fixtureId} />}
      </div>
    </div>
  );
}

// 섹션 헤더 컴포넌트
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionIcon}>{icon}</span>
      <span className={styles.sectionTitle}>{title}</span>
    </div>
  );
}

// 비교 탭 - FootHub 스타일
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

  const homePercent = parseInt(prediction?.predictions.percent.home || '0');
  const drawPercent = parseInt(prediction?.predictions.percent.draw || '0');
  const awayPercent = parseInt(prediction?.predictions.percent.away || '0');

  return (
    <div className={styles.comparison}>
      {/* 승률 예측 - FootHub 스타일 */}
      {prediction && (
        <>
          <SectionHeader icon="📊" title="Win Probability" />
          <div className={styles.card}>
            {/* 승률 숫자 */}
            <div className={styles.winProbNumbers}>
              <div className={styles.winProbTeam}>
                <span className={styles.winProbName}>{prediction.teams.home.name}</span>
                <span className={styles.winProbValue} style={{ color: '#2563EB' }}>{homePercent}%</span>
              </div>
              <div className={styles.winProbTeam}>
                <span className={styles.winProbName}>무승부</span>
                <span className={styles.winProbValue} style={{ color: '#F59E0B' }}>{drawPercent}%</span>
              </div>
              <div className={styles.winProbTeam}>
                <span className={styles.winProbName}>{prediction.teams.away.name}</span>
                <span className={styles.winProbValue} style={{ color: '#EF4444' }}>{awayPercent}%</span>
              </div>
            </div>
            {/* 승률 바 */}
            <div className={styles.winProbBar}>
              <div className={styles.winProbHome} style={{ flex: Math.max(homePercent, 1) }} />
              <div className={styles.winProbDraw} style={{ flex: Math.max(drawPercent, 1) }} />
              <div className={styles.winProbAway} style={{ flex: Math.max(awayPercent, 1) }} />
            </div>
          </div>
        </>
      )}

      {/* 상대전적 - FootHub 스타일 */}
      <SectionHeader icon="⚔️" title={`Head to Head (${h2h?.length || 0})`} />
      <div className={styles.card}>
        <div className={styles.h2hSummary}>
          <div className={`${styles.h2hBox} ${styles.home}`}>
            <span className={styles.h2hBoxValue}>{h2hStats.homeWins}</span>
            <span className={styles.h2hBoxLabel}>승</span>
          </div>
          <div className={styles.h2hBox}>
            <span className={styles.h2hBoxValue}>{h2hStats.draws}</span>
            <span className={styles.h2hBoxLabel}>무</span>
          </div>
          <div className={`${styles.h2hBox} ${styles.away}`}>
            <span className={styles.h2hBoxValue}>{h2hStats.awayWins}</span>
            <span className={styles.h2hBoxLabel}>승</span>
          </div>
        </div>

        {/* 최근 경기 목록 */}
        {h2h && h2h.length > 0 && (
          <div className={styles.h2hList}>
            {h2h.slice(0, 5).map((match) => {
              const homeWon = (match.goals.home ?? 0) > (match.goals.away ?? 0);
              const awayWon = (match.goals.away ?? 0) > (match.goals.home ?? 0);
              return (
                <div key={match.fixture.id} className={styles.h2hMatch}>
                  <span className={styles.h2hMatchDate}>
                    {new Date(match.fixture.date).toLocaleDateString('ko-KR', {
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </span>
                  <span className={`${styles.h2hMatchTeam} ${homeWon ? styles.winner : ''}`}>
                    {match.teams.home.name}
                  </span>
                  <span className={styles.h2hMatchScore}>
                    {match.goals.home} - {match.goals.away}
                  </span>
                  <span className={`${styles.h2hMatchTeam} ${awayWon ? styles.winner : ''}`}>
                    {match.teams.away.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 최근 폼 - FootHub 스타일 */}
      {prediction && (
        <>
          <SectionHeader icon="📈" title="Recent Form" />
          <div className={styles.card}>
            <div className={styles.recentForm}>
              <div className={styles.recentFormRow}>
                <span className={styles.recentFormTeam}>{prediction.teams.home.name}</span>
                <div className={styles.formSummary}>
                  {(() => {
                    const form = parseForm(prediction.teams.home.league.form).slice(-5);
                    const w = form.filter(r => r === 'W').length;
                    const d = form.filter(r => r === 'D').length;
                    const l = form.filter(r => r === 'L').length;
                    return <span className={styles.formSummaryText}>{w}W {d}D {l}L</span>;
                  })()}
                </div>
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
              <div className={styles.recentFormRow}>
                <span className={styles.recentFormTeam}>{prediction.teams.away.name}</span>
                <div className={styles.formSummary}>
                  {(() => {
                    const form = parseForm(prediction.teams.away.league.form).slice(-5);
                    const w = form.filter(r => r === 'W').length;
                    const d = form.filter(r => r === 'D').length;
                    const l = form.filter(r => r === 'L').length;
                    return <span className={styles.formSummaryText}>{w}W {d}D {l}L</span>;
                  })()}
                </div>
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
        </>
      )}
    </div>
  );
}

// 통계 탭 - FootHub 스타일
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
    { label: '슈팅', type: 'Total Shots' },
    { label: '유효 슈팅', type: 'Shots on Goal' },
    { label: '코너킥', type: 'Corner Kicks' },
    { label: '파울', type: 'Fouls' },
    { label: '오프사이드', type: 'Offsides' },
    { label: '옐로카드', type: 'Yellow Cards', color: 'yellow' },
    { label: '레드카드', type: 'Red Cards', color: 'red' },
  ];

  // 이벤트 색상 매핑
  const getEventColor = (event: { type: string; detail: string }) => {
    if (event.type === 'Goal') return '#10B981';
    if (event.type === 'Card' && event.detail === 'Yellow Card') return '#F59E0B';
    if (event.type === 'Card' && event.detail === 'Red Card') return '#EF4444';
    if (event.type === 'subst') return '#2563EB';
    return '#6B7280';
  };

  // 이벤트 타입 텍스트
  const getEventTypeText = (event: { type: string; detail: string }) => {
    if (event.type === 'Goal') {
      if (event.detail === 'Penalty') return '패널티골';
      if (event.detail === 'Own Goal') return '자책골';
      return '골';
    }
    if (event.type === 'Card' && event.detail === 'Yellow Card') return '옐로카드';
    if (event.type === 'Card' && event.detail === 'Red Card') return '레드카드';
    if (event.type === 'subst') return '교체';
    if (event.type === 'Var') return 'VAR';
    return event.type;
  };

  // 시간순 정렬된 이벤트
  const sortedEvents = [...(events || [])].sort((a, b) => a.time.elapsed - b.time.elapsed);

  return (
    <div className={styles.stats}>
      {/* 통계 섹션 */}
      <SectionHeader icon="📊" title="Stats" />
      <div className={styles.card}>
        {/* 팀 헤더 */}
        <div className={styles.statsHeader}>
          <div className={styles.statsTeam}>
            <img src={homeStats.team.logo} alt="" className={styles.statsTeamLogo} />
            <span>{homeStats.team.name}</span>
          </div>
          <div className={styles.statsTeam}>
            <span>{awayStats.team.name}</span>
            <img src={awayStats.team.logo} alt="" className={styles.statsTeamLogo} />
          </div>
        </div>

        <div className={styles.statsDivider} />

        {/* 통계 바들 */}
        <div className={styles.statsList}>
          {statItems.map(({ label, type, isPercent, color }) => {
            const homeValue = getStatValue(homeStats, type);
            const awayValue = getStatValue(awayStats, type);
            const total = homeValue + awayValue || 1;
            const homePercent = isPercent ? homeValue : (homeValue / total) * 100;
            const awayPercent = isPercent ? awayValue : (awayValue / total) * 100;
            const homeWins = homeValue > awayValue;
            const awayWins = awayValue > homeValue;
            const isDraw = homeValue === awayValue;

            return (
              <div key={type} className={styles.statRow}>
                <span className={`${styles.statValue} ${homeWins ? styles.winning : ''}`}>
                  {homeValue}{isPercent ? '%' : ''}
                </span>
                <div className={styles.statCenter}>
                  <span className={styles.statLabel}>{label}</span>
                  <div className={styles.statBarWrapper}>
                    <div
                      className={`${styles.statBarLeft} ${color === 'yellow' ? styles.yellow : ''} ${color === 'red' ? styles.red : ''}`}
                      style={{
                        width: `${homePercent}%`,
                        opacity: homeWins ? 1 : isDraw ? 0.6 : 0.3
                      }}
                    />
                    <div className={styles.statBarGap} />
                    <div
                      className={`${styles.statBarRight} ${color === 'yellow' ? styles.yellow : ''} ${color === 'red' ? styles.red : ''}`}
                      style={{
                        width: `${awayPercent}%`,
                        opacity: awayWins ? 1 : isDraw ? 0.6 : 0.3
                      }}
                    />
                  </div>
                </div>
                <span className={`${styles.statValue} ${awayWins ? styles.winning : ''}`}>
                  {awayValue}{isPercent ? '%' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 타임라인 섹션 - FootHub 스타일 */}
      {sortedEvents.length > 0 && (
        <>
          <SectionHeader icon="⏱️" title="Timeline" />
          <div className={styles.card}>
            <div className={styles.timeline}>
              {sortedEvents.map((event, index) => {
                const isHome = event.team.id === homeStats.team.id;
                const eventColor = getEventColor(event);

                return (
                  <div key={index} className={styles.timelineRow}>
                    {/* 홈팀 이벤트 (왼쪽) */}
                    <div className={styles.timelineLeft}>
                      {isHome && (
                        <div
                          className={styles.timelineCard}
                          style={{
                            background: `${eventColor}14`,
                            borderColor: `${eventColor}4D`
                          }}
                        >
                          <span className={styles.timelineType} style={{ color: eventColor }}>
                            {getEventTypeText(event)}
                          </span>
                          <span className={styles.timelinePlayer}>{event.player.name}</span>
                          {event.assist?.name && (
                            <span className={styles.timelineAssist}>어시스트: {event.assist.name}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 중앙 시간 */}
                    <div className={styles.timelineCenter}>
                      <div
                        className={styles.timelineCircle}
                        style={{
                          background: `${eventColor}26`,
                          borderColor: eventColor
                        }}
                      >
                        <span style={{ color: eventColor }}>
                          {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ''}
                        </span>
                      </div>
                      {index < sortedEvents.length - 1 && <div className={styles.timelineLine} />}
                    </div>

                    {/* 원정팀 이벤트 (오른쪽) */}
                    <div className={styles.timelineRight}>
                      {!isHome && (
                        <div
                          className={styles.timelineCard}
                          style={{
                            background: `${eventColor}14`,
                            borderColor: `${eventColor}4D`
                          }}
                        >
                          <span className={styles.timelineType} style={{ color: eventColor }}>
                            {getEventTypeText(event)}
                          </span>
                          <span className={styles.timelinePlayer}>{event.player.name}</span>
                          {event.assist?.name && (
                            <span className={styles.timelineAssist}>어시스트: {event.assist.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
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
      {/* 포메이션 헤더 */}
      <div className={styles.formationCard}>
        <div className={styles.formationTeam}>
          <img src={match.teams.home.logo} alt="" className={styles.formationLogo} />
          <span className={styles.formationName}>{match.teams.home.name}</span>
          <span className={styles.formationNumber}>{homeLineup.formation}</span>
        </div>
        <div className={styles.formationVsBadge}>VS</div>
        <div className={styles.formationTeam}>
          <span className={styles.formationNumber}>{awayLineup.formation}</span>
          <span className={styles.formationName}>{match.teams.away.name}</span>
          <img src={match.teams.away.logo} alt="" className={styles.formationLogo} />
        </div>
      </div>

      {/* 피치 뷰 - FootHub 스타일 */}
      <div className={styles.pitchContainer}>
        <div className={styles.pitch}>
          {/* 홈팀 (상단) */}
          {homeLineup.startXI.map(({ player }) => (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className={styles.playerMarker}
              style={getPlayerPositionNew(player.grid, true, homeLineup.formation)}
            >
              <span className={styles.playerNumber}>{player.number}</span>
              <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
            </Link>
          ))}

          {/* 원정팀 (하단) */}
          {awayLineup.startXI.map(({ player }) => (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className={`${styles.playerMarker} ${styles.away}`}
              style={getPlayerPositionNew(player.grid, false, awayLineup.formation)}
            >
              <span className={styles.playerNumber}>{player.number}</span>
              <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 교체 선수 */}
      <SectionHeader icon="🔄" title="교체 선수" />
      <div className={styles.card}>
        <div className={styles.substitutes}>
          <div className={styles.subsTeam}>
            <div className={styles.subsTeamHeader}>
              <img src={match.teams.home.logo} alt="" className={styles.subsTeamLogo} />
              <span>{match.teams.home.name}</span>
            </div>
            {homeLineup.substitutes.slice(0, 7).map(({ player }) => (
              <Link key={player.id} to={`/player/${player.id}`} className={styles.subPlayer}>
                <span className={styles.subNumber}>{player.number}</span>
                <span className={styles.subName}>{player.name}</span>
                <span className={styles.subPos}>{player.pos}</span>
              </Link>
            ))}
          </div>
          <div className={styles.subsTeam}>
            <div className={styles.subsTeamHeader}>
              <img src={match.teams.away.logo} alt="" className={styles.subsTeamLogo} />
              <span>{match.teams.away.name}</span>
            </div>
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

      {/* 감독 정보 */}
      <SectionHeader icon="👔" title="감독" />
      <div className={styles.card}>
        <div className={styles.coaches}>
          <div className={styles.coach}>
            <img src={match.teams.home.logo} alt="" className={styles.coachTeamLogo} />
            <span className={styles.coachName}>{homeLineup.coach?.name || '-'}</span>
          </div>
          <div className={styles.coach}>
            <img src={match.teams.away.logo} alt="" className={styles.coachTeamLogo} />
            <span className={styles.coachName}>{awayLineup.coach?.name || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 포메이션 기반 선수 위치 계산
function getFormationPositions(formation: string, isHome: boolean): Map<string, { top: number; left: number }> {
  const positions = new Map<string, { top: number; left: number }>();

  // 포메이션 파싱 (예: "4-3-3" -> [4, 3, 3])
  const lines = formation.split('-').map(Number);
  const totalLines = lines.length + 1; // GK 포함

  // Y 위치 범위
  const yStart = isHome ? 8 : 92;
  const yEnd = isHome ? 44 : 56;
  const yStep = (yEnd - yStart) / (totalLines - 1);

  // GK (row 1)
  positions.set('1:1', { top: yStart, left: 50 });

  // 각 라인별 선수 배치
  let currentRow = 2;
  lines.forEach((playersInLine) => {
    const y = yStart + (currentRow - 1) * yStep;

    for (let col = 1; col <= playersInLine; col++) {
      // X 위치: 선수 수에 따라 균등 배치
      let x: number;
      if (playersInLine === 1) {
        x = 50;
      } else {
        // 12% ~ 88% 범위에 균등 배치
        x = 12 + ((col - 1) / (playersInLine - 1)) * 76;
      }

      positions.set(`${currentRow}:${col}`, { top: y, left: x });
    }
    currentRow++;
  });

  return positions;
}

// 선수 위치 계산 (포메이션 기반)
function getPlayerPositionNew(
  grid: string | null,
  isHome: boolean,
  formation?: string
): React.CSSProperties {
  if (!grid) return { top: '50%', left: '50%' };

  // 포메이션이 있으면 포메이션 기반 위치 사용
  if (formation) {
    const positions = getFormationPositions(formation, isHome);
    const pos = positions.get(grid);
    if (pos) {
      return { top: `${pos.top}%`, left: `${pos.left}%` };
    }
  }

  // 폴백: 기본 그리드 계산
  const [row, col] = grid.split(':').map(Number);

  // Y 위치
  let topPercent: number;
  if (isHome) {
    topPercent = 8 + ((row - 1) * 9);
  } else {
    topPercent = 92 - ((row - 1) * 9);
  }

  // X 위치 - 선수 수별 기본 배치
  const xPositions: Record<number, number[]> = {
    1: [50],
    2: [30, 70],
    3: [20, 50, 80],
    4: [12, 37, 63, 88],
    5: [10, 30, 50, 70, 90],
  };

  // grid에서 col 값이 해당 라인의 인덱스 (1부터 시작)
  // 기본적으로 5명 기준으로 배치하되, col에 따라 조정
  const leftPercent = xPositions[5]?.[col - 1] ?? 50;

  return {
    top: `${topPercent}%`,
    left: `${leftPercent}%`
  };
}

// 순위 탭
function StandingsTab({ leagueId, season, homeTeamId, awayTeamId }: {
  leagueId: number;
  season: number;
  homeTeamId?: number;
  awayTeamId?: number;
}) {
  const { data: standings, isLoading } = useLeagueStandings(leagueId, season);

  if (isLoading) return <Loading />;

  if (!standings || !standings.league?.standings?.length) {
    return <EmptyState icon="🏆" message="순위 정보가 없습니다" />;
  }

  // standings는 그룹별로 나뉘어 있을 수 있음 (챔스리그 등)
  const mainStandings = standings.league.standings[0] || [];

  return (
    <div className={styles.standings}>
      <SectionHeader icon="🏆" title="리그 순위" />
      <div className={styles.card}>
        <div className={styles.standingsTable}>
          {/* 헤더 */}
          <div className={styles.standingsHeader}>
            <span className={styles.standingsRank}>#</span>
            <span className={styles.standingsTeamName}>팀</span>
            <span className={styles.standingsStat}>경기</span>
            <span className={styles.standingsStat}>승</span>
            <span className={styles.standingsStat}>무</span>
            <span className={styles.standingsStat}>패</span>
            <span className={styles.standingsStat}>득실</span>
            <span className={styles.standingsPoints}>승점</span>
          </div>

          {/* 순위 목록 */}
          {mainStandings.map((team: any) => {
            const isMatchTeam = team.team.id === homeTeamId || team.team.id === awayTeamId;
            return (
              <Link
                key={team.team.id}
                to={`/team/${team.team.id}`}
                className={`${styles.standingsRow} ${isMatchTeam ? styles.highlight : ''}`}
              >
                <span className={`${styles.standingsRank} ${getRankClass(team.rank, team.description)}`}>
                  {team.rank}
                </span>
                <div className={styles.standingsTeam}>
                  <img src={team.team.logo} alt="" className={styles.standingsTeamLogo} />
                  <span className={styles.standingsTeamName}>{team.team.name}</span>
                </div>
                <span className={styles.standingsStat}>{team.all.played}</span>
                <span className={styles.standingsStat}>{team.all.win}</span>
                <span className={styles.standingsStat}>{team.all.draw}</span>
                <span className={styles.standingsStat}>{team.all.lose}</span>
                <span className={styles.standingsStat}>{team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}</span>
                <span className={styles.standingsPoints}>{team.points}</span>
              </Link>
            );
          })}
        </div>

        {/* 전체 순위 링크 */}
        <Link to={`/league/${leagueId}`} className={styles.standingsMoreLink}>
          전체 순위 보기 →
        </Link>
      </div>
    </div>
  );
}

// 순위에 따른 스타일 클래스
function getRankClass(_rank: number, description: string | null): string {
  if (description?.includes('Champions League') || description?.includes('Promotion')) {
    return styles.rankChampions;
  }
  if (description?.includes('Europa League')) {
    return styles.rankEuropa;
  }
  if (description?.includes('Conference League')) {
    return styles.rankConference;
  }
  if (description?.includes('Relegation')) {
    return styles.rankRelegation;
  }
  return '';
}

// 예측 탭
function PredictionTab({ fixtureId }: { fixtureId: number }) {
  const { data: prediction, isLoading } = useMatchPrediction(fixtureId);

  if (isLoading) return <Loading />;

  if (!prediction) {
    return <EmptyState icon="🔮" message="예측 정보가 없습니다" />;
  }

  // 퍼센트 파싱 함수
  const parsePercent = (str: string) => parseInt(str?.replace('%', '') || '0');

  return (
    <div className={styles.prediction}>
      {/* 승률 예측 바 */}
      <SectionHeader icon="📊" title="승률 예측" />
      <div className={styles.card}>
        <div className={styles.predictionBarLarge}>
          <div
            className={styles.predictionBarHome}
            style={{ width: prediction.predictions.percent.home }}
          >
            <span>{prediction.predictions.percent.home}</span>
          </div>
          <div
            className={styles.predictionBarDraw}
            style={{ width: prediction.predictions.percent.draw }}
          >
            <span>{prediction.predictions.percent.draw}</span>
          </div>
          <div
            className={styles.predictionBarAway}
            style={{ width: prediction.predictions.percent.away }}
          >
            <span>{prediction.predictions.percent.away}</span>
          </div>
        </div>
        <div className={styles.predictionBarLabels}>
          <span>{prediction.teams.home.name}</span>
          <span>무승부</span>
          <span>{prediction.teams.away.name}</span>
        </div>
      </div>

      {/* AI 조언 */}
      <SectionHeader icon="🤖" title="AI 분석" />
      <div className={styles.card}>
        <div className={styles.aiAdvice}>
          <div className={styles.aiAdviceIcon}>💡</div>
          <div className={styles.aiAdviceText}>{prediction.predictions.advice}</div>
        </div>

        {prediction.predictions.winner.name && (
          <div className={styles.predictionWinnerBox}>
            <span className={styles.predictionWinnerLabel}>예상 승자</span>
            <span className={styles.predictionWinnerName}>{prediction.predictions.winner.name}</span>
            {prediction.predictions.winner.comment && (
              <span className={styles.predictionWinnerComment}>{prediction.predictions.winner.comment}</span>
            )}
          </div>
        )}
      </div>

      {/* 예상 스코어 */}
      <SectionHeader icon="⚽" title="예상 스코어" />
      <div className={styles.card}>
        <div className={styles.predictedScore}>
          <div className={styles.predictedTeam}>
            <span className={styles.predictedTeamName}>{prediction.teams.home.name}</span>
            <span className={styles.predictedGoal}>{prediction.predictions.goals.home}</span>
          </div>
          <span className={styles.predictedVs}>:</span>
          <div className={styles.predictedTeam}>
            <span className={styles.predictedGoal}>{prediction.predictions.goals.away}</span>
            <span className={styles.predictedTeamName}>{prediction.teams.away.name}</span>
          </div>
        </div>
      </div>

      {/* 팀 비교 분석 */}
      <SectionHeader icon="⚖️" title="팀 비교 분석" />
      <div className={styles.card}>
        <div className={styles.comparisonGrid}>
          {Object.entries(prediction.comparison).map(([key, values]) => {
            const homeVal = parsePercent(values.home);
            const awayVal = parsePercent(values.away);
            const winner = homeVal > awayVal ? 'home' : homeVal < awayVal ? 'away' : 'draw';
            const labelMap: Record<string, string> = {
              form: '최근 폼',
              att: '공격력',
              def: '수비력',
              h2h: '상대전적',
              goals: '득점력',
              total: '종합',
              poisson_distribution: '확률 분포',
            };

            return (
              <div key={key} className={styles.comparisonRow}>
                <div className={`${styles.comparisonCell} ${winner === 'home' ? styles.winner : ''}`}>
                  {values.home}
                </div>
                <div className={styles.comparisonCellLabel}>
                  {labelMap[key] || key}
                </div>
                <div className={`${styles.comparisonCell} ${winner === 'away' ? styles.winner : ''}`}>
                  {values.away}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
