import { useHeadToHead, useMatchPrediction } from '../../../hooks/useMatchDetail';
import { useTeamStatistics } from '../../../hooks/useTeam';
import { Loading } from '../../../components/common';
import { SectionHeader } from '../components/SectionHeader';
import { parseForm, getFormColor } from '../../../utils/format';
import { BarChart3, TrendingUp, Swords } from 'lucide-react';
import styles from '../MatchDetail.module.css';

interface ComparisonTabProps {
    homeTeamId: number;
    awayTeamId: number;
    fixtureId: number;
    leagueId: number;
    season: number;
}

export function ComparisonTab({
    homeTeamId,
    awayTeamId,
    fixtureId,
    leagueId,
    season,
}: ComparisonTabProps) {
    const { data: h2h, isLoading: h2hLoading } = useHeadToHead(homeTeamId, awayTeamId);
    const { data: prediction } = useMatchPrediction(fixtureId);
    const { data: homeStats } = useTeamStatistics(homeTeamId, leagueId, season);
    const { data: awayStats } = useTeamStatistics(awayTeamId, leagueId, season);

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
            {/* 시즌 성적 비교 - FootHub 스타일 */}
            {homeStats && awayStats && (
                <>
                    <SectionHeader icon={<BarChart3 size={18} />} title="시즌 성적" />
                    <div className={styles.card}>
                        <div className={styles.seasonStatsGrid}>
                            {/* 헤더 */}
                            <div className={styles.seasonStatsHeader}>
                                <span>{homeStats.team.name}</span>
                                <span></span>
                                <span>{awayStats.team.name}</span>
                            </div>

                            {/* 경기 수 */}
                            <div className={styles.seasonStatsRow}>
                                <span className={styles.seasonStatValue}>{homeStats.fixtures.played.total}</span>
                                <span className={styles.seasonStatLabel}>경기</span>
                                <span className={styles.seasonStatValue}>{awayStats.fixtures.played.total}</span>
                            </div>

                            {/* 승/무/패 */}
                            <div className={styles.seasonStatsRow}>
                                <span className={styles.seasonStatValue}>
                                    <span className={styles.win}>{homeStats.fixtures.wins.total}</span>
                                    <span className={styles.draw}>{homeStats.fixtures.draws.total}</span>
                                    <span className={styles.lose}>{homeStats.fixtures.loses.total}</span>
                                </span>
                                <span className={styles.seasonStatLabel}>승/무/패</span>
                                <span className={styles.seasonStatValue}>
                                    <span className={styles.win}>{awayStats.fixtures.wins.total}</span>
                                    <span className={styles.draw}>{awayStats.fixtures.draws.total}</span>
                                    <span className={styles.lose}>{awayStats.fixtures.loses.total}</span>
                                </span>
                            </div>

                            {/* 득점 */}
                            <div className={styles.seasonStatsRow}>
                                <span className={`${styles.seasonStatValue} ${homeStats.goals.for.total.total > awayStats.goals.for.total.total ? styles.better : ''}`}>
                                    {homeStats.goals.for.total.total}
                                </span>
                                <span className={styles.seasonStatLabel}>득점</span>
                                <span className={`${styles.seasonStatValue} ${awayStats.goals.for.total.total > homeStats.goals.for.total.total ? styles.better : ''}`}>
                                    {awayStats.goals.for.total.total}
                                </span>
                            </div>

                            {/* 실점 */}
                            <div className={styles.seasonStatsRow}>
                                <span className={`${styles.seasonStatValue} ${homeStats.goals.against.total.total < awayStats.goals.against.total.total ? styles.better : ''}`}>
                                    {homeStats.goals.against.total.total}
                                </span>
                                <span className={styles.seasonStatLabel}>실점</span>
                                <span className={`${styles.seasonStatValue} ${awayStats.goals.against.total.total < homeStats.goals.against.total.total ? styles.better : ''}`}>
                                    {awayStats.goals.against.total.total}
                                </span>
                            </div>

                            {/* 클린시트 */}
                            <div className={styles.seasonStatsRow}>
                                <span className={`${styles.seasonStatValue} ${homeStats.clean_sheet.total > awayStats.clean_sheet.total ? styles.better : ''}`}>
                                    {homeStats.clean_sheet.total}
                                </span>
                                <span className={styles.seasonStatLabel}>클린시트</span>
                                <span className={`${styles.seasonStatValue} ${awayStats.clean_sheet.total > homeStats.clean_sheet.total ? styles.better : ''}`}>
                                    {awayStats.clean_sheet.total}
                                </span>
                            </div>
                        </div>

                        {/* 홈/원정 성적 */}
                        <div className={styles.homeAwayStats}>
                            <div className={styles.homeAwaySection}>
                                <span className={styles.homeAwayLabel}>🏠 홈 성적</span>
                                <div className={styles.homeAwayRow}>
                                    <span>{homeStats.fixtures.wins.home}승 {homeStats.fixtures.draws.home}무 {homeStats.fixtures.loses.home}패</span>
                                    <span>{awayStats.fixtures.wins.home}승 {awayStats.fixtures.draws.home}무 {awayStats.fixtures.loses.home}패</span>
                                </div>
                            </div>
                            <div className={styles.homeAwaySection}>
                                <span className={styles.homeAwayLabel}>✈️ 원정 성적</span>
                                <div className={styles.homeAwayRow}>
                                    <span>{homeStats.fixtures.wins.away}승 {homeStats.fixtures.draws.away}무 {homeStats.fixtures.loses.away}패</span>
                                    <span>{awayStats.fixtures.wins.away}승 {awayStats.fixtures.draws.away}무 {awayStats.fixtures.loses.away}패</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 승률 예측 - FootHub 스타일 */}
            {prediction && (
                <>
                    <SectionHeader icon={<TrendingUp size={18} />} title="Win Probability" />
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
            <SectionHeader icon={<Swords size={18} />} title={`Head to Head (${h2h?.length || 0})`} />
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
                    <SectionHeader icon={<BarChart3 size={18} />} title="Recent Form" />
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
