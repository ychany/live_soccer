import { Link } from 'react-router-dom';
import {
    useLeagueStandings,
    useTopScorers,
    useTopAssists,
} from '../../../hooks/useLeague';
import { Loading, EmptyState } from '../../../components/common';
import { TrendingUp } from 'lucide-react';
import styles from '../LeagueDetail.module.css';

interface StatsTabProps {
    leagueId: number;
    season: number;
}

export function StatsTab({ leagueId, season }: StatsTabProps) {
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
                    <EmptyState icon={<TrendingUp size={48} />} message="통계 정보가 없습니다" />
                )}
        </div>
    );
}

function getRankBadgeClass(rank: number): string {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return '';
}
