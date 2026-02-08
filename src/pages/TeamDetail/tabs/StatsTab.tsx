import { useState } from 'react';
import { useTeamLeagues, useTeamStatistics } from '../../../hooks/useTeam';
import { Loading, EmptyState } from '../../../components/common';
import { BarChart2 } from 'lucide-react';
import styles from '../TeamDetail.module.css';

interface StatsTabProps {
    teamId: number;
}

export function StatsTab({ teamId }: StatsTabProps) {
    const { data: leagues, isLoading: leaguesLoading } = useTeamLeagues(teamId);
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

    // 첫 번째 리그 자동 선택
    const leagueId = selectedLeagueId || leagues?.[0]?.league.id;
    const { data: stats, isLoading: statsLoading } = useTeamStatistics(
        teamId,
        leagueId || 0
    );

    if (leaguesLoading) return <Loading />;

    if (!leagues || leagues.length === 0) {
        return <EmptyState icon={<BarChart2 size={48} />} message="참가 중인 리그 정보가 없습니다" />;
    }

    const isLoading = statsLoading;

    return (
        <div className={styles.stats}>
            {/* 리그 선택 */}
            <div className={styles.leagueSelector}>
                {leagues.map((l) => (
                    <button
                        key={l.league.id}
                        className={`${styles.leagueBtn} ${leagueId === l.league.id ? styles.active : ''}`}
                        onClick={() => setSelectedLeagueId(l.league.id)}
                    >
                        <img src={l.league.logo} alt="" className={styles.leagueLogo} />
                        {l.league.name}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <Loading />
            ) : !stats ? (
                <EmptyState icon={<BarChart2 size={48} />} message="통계 정보가 없습니다" />
            ) : (
                <>
                    {/* 최근 폼 */}
                    {stats.form && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>최근 경기 폼</h3>
                            <div className={styles.formRow}>
                                {stats.form.split('').slice(-10).map((result, idx) => (
                                    <span
                                        key={idx}
                                        className={`${styles.formBadge} ${result === 'W' ? styles.win : result === 'D' ? styles.draw : styles.lose
                                            }`}
                                    >
                                        {result === 'W' ? '승' : result === 'D' ? '무' : '패'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 경기 기록 */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>경기 기록</h3>
                        <div className={styles.statGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{stats.fixtures.played.total}</div>
                                <div className={styles.statLabel}>총 경기</div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{stats.fixtures.wins.total}</div>
                                <div className={styles.statLabel}>승리</div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{stats.fixtures.draws.total}</div>
                                <div className={styles.statLabel}>무승부</div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statValue}>{stats.fixtures.loses.total}</div>
                                <div className={styles.statLabel}>패배</div>
                            </div>
                        </div>
                    </div>

                    {/* 골 통계 */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>골 통계</h3>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}>총 득점</span>
                            <span className={styles.statRowValue}>{stats.goals.for.total.total}골</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}>총 실점</span>
                            <span className={styles.statRowValue}>{stats.goals.against.total.total}골</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}>경기당 득점</span>
                            <span className={styles.statRowValue}>{stats.goals.for.average.total}골</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}>경기당 실점</span>
                            <span className={styles.statRowValue}>{stats.goals.against.average.total}골</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}>클린시트</span>
                            <span className={styles.statRowValue}>{stats.clean_sheet.total}경기</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}>무득점 경기</span>
                            <span className={styles.statRowValue}>{stats.failed_to_score.total}경기</span>
                        </div>
                    </div>

                    {/* 홈/원정 통계 */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>홈 / 원정</h3>
                        <div className={styles.homeAwayGrid}>
                            <div className={styles.homeAwayCard}>
                                <div className={styles.homeAwayTitle}>🏠 홈</div>
                                <div className={styles.homeAwayStats}>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>경기</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.played.home}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>승</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.wins.home}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>무</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.draws.home}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>패</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.loses.home}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>득점</span>
                                        <span className={styles.homeAwayStatValue}>{stats.goals.for.total.home}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>실점</span>
                                        <span className={styles.homeAwayStatValue}>{stats.goals.against.total.home}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.homeAwayCard}>
                                <div className={styles.homeAwayTitle}>✈️ 원정</div>
                                <div className={styles.homeAwayStats}>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>경기</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.played.away}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>승</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.wins.away}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>무</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.draws.away}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>패</span>
                                        <span className={styles.homeAwayStatValue}>{stats.fixtures.loses.away}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>득점</span>
                                        <span className={styles.homeAwayStatValue}>{stats.goals.for.total.away}</span>
                                    </div>
                                    <div className={styles.homeAwayStat}>
                                        <span className={styles.homeAwayStatLabel}>실점</span>
                                        <span className={styles.homeAwayStatValue}>{stats.goals.against.total.away}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 가장 많이 사용한 포메이션 */}
                    {stats.lineups && stats.lineups.length > 0 && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>주요 포메이션</h3>
                            {stats.lineups.slice(0, 3).map((lineup, idx) => (
                                <div key={idx} className={styles.statRow}>
                                    <span className={styles.statRowLabel}>{lineup.formation}</span>
                                    <span className={styles.statRowValue}>{lineup.played}경기</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
