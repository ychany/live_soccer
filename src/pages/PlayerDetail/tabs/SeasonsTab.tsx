import { useState } from 'react';
import { usePlayerMultiSeasonStats } from '../../../hooks/usePlayer';
import { Loading, EmptyState } from '../../../components/common';
import { formatNumber } from '../../../utils/format';
import { Activity } from 'lucide-react';
import styles from '../PlayerDetail.module.css';

interface SeasonsTabProps {
    playerId: number;
}

export function SeasonsTab({ playerId }: SeasonsTabProps) {
    const { data: seasons, isLoading } = usePlayerMultiSeasonStats(playerId);
    const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());

    // 첫 번째 시즌은 기본 펼침
    const firstSeason = seasons?.[0]?.season;
    if (expandedSeasons.size === 0 && firstSeason !== undefined) {
        expandedSeasons.add(firstSeason);
    }

    const toggleSeason = (season: number) => {
        setExpandedSeasons((prev) => {
            const next = new Set(prev);
            if (next.has(season)) {
                next.delete(season);
            } else {
                next.add(season);
            }
            return next;
        });
    };

    if (isLoading) return <Loading />;

    if (!seasons || seasons.length === 0) {
        return <EmptyState icon={<Activity size={48} />} message="시즌 통계가 없습니다" />;
    }

    return (
        <div className={styles.seasons}>
            {seasons.map((seasonData) => {
                if (!seasonData) return null;
                const { season, data } = seasonData;
                const isExpanded = expandedSeasons.has(season);

                // 시즌 총합 계산
                const totalStats = data.statistics.reduce(
                    (acc, stat) => ({
                        appearances: acc.appearances + (stat.games.appearences || 0),
                        goals: acc.goals + (stat.goals.total || 0),
                        assists: acc.assists + (stat.goals.assists || 0),
                    }),
                    { appearances: 0, goals: 0, assists: 0 }
                );

                return (
                    <div key={season} className={styles.seasonCard}>
                        {/* 시즌 헤더 (클릭 가능) */}
                        <button
                            className={styles.seasonCardHeader}
                            onClick={() => toggleSeason(season)}
                        >
                            <div className={styles.seasonCardTitle}>
                                <span className={styles.seasonCardYear}>{season}/{season + 1}</span>
                                <span className={styles.seasonCardCount}>
                                    {data.statistics.length}개 대회
                                </span>
                            </div>
                            <div className={styles.seasonCardSummary}>
                                <span className={styles.summaryItem}>
                                    <span className={styles.summaryValue}>{totalStats.appearances}</span>
                                    <span className={styles.summaryLabel}>경기</span>
                                </span>
                                <span className={styles.summaryItem}>
                                    <span className={styles.summaryValue}>{totalStats.goals}</span>
                                    <span className={styles.summaryLabel}>골</span>
                                </span>
                                <span className={styles.summaryItem}>
                                    <span className={styles.summaryValue}>{totalStats.assists}</span>
                                    <span className={styles.summaryLabel}>도움</span>
                                </span>
                                <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
                                    ▼
                                </span>
                            </div>
                        </button>

                        {/* 시즌 상세 (펼침/접힘) */}
                        {isExpanded && (
                            <div className={styles.seasonCardBody}>
                                {data.statistics.map((stat, index) => (
                                    <div key={index} className={styles.leagueStatRow}>
                                        <div className={styles.leagueStatInfo}>
                                            <img src={stat.league.logo} alt="" className={styles.leagueLogo} />
                                            <div className={styles.leagueStatText}>
                                                <span className={styles.leagueStatName}>{stat.league.name}</span>
                                                <span className={styles.leagueStatTeam}>
                                                    <img src={stat.team.logo} alt="" className={styles.teamLogoXs} />
                                                    {stat.team.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.leagueStatNumbers}>
                                            <span className={styles.leagueStatNum}>
                                                <span className={styles.leagueStatNumValue}>
                                                    {formatNumber(stat.games.appearences)}
                                                </span>
                                                <span className={styles.leagueStatNumLabel}>경기</span>
                                            </span>
                                            <span className={styles.leagueStatNum}>
                                                <span className={styles.leagueStatNumValue}>
                                                    {formatNumber(stat.goals.total)}
                                                </span>
                                                <span className={styles.leagueStatNumLabel}>골</span>
                                            </span>
                                            <span className={styles.leagueStatNum}>
                                                <span className={styles.leagueStatNumValue}>
                                                    {formatNumber(stat.goals.assists)}
                                                </span>
                                                <span className={styles.leagueStatNumLabel}>도움</span>
                                            </span>
                                            <span className={styles.leagueStatNum}>
                                                <span className={styles.leagueStatNumValue}>
                                                    {stat.games.rating
                                                        ? parseFloat(stat.games.rating).toFixed(1)
                                                        : '-'}
                                                </span>
                                                <span className={styles.leagueStatNumLabel}>평점</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
