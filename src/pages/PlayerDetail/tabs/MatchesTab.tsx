import { Link } from 'react-router-dom';
import { usePlayerAppearances } from '../../../hooks/usePlayer';
import { Loading, EmptyState } from '../../../components/common';
import { formatDate } from '../../../utils/format';
import { Activity } from 'lucide-react';
import styles from '../PlayerDetail.module.css';

interface MatchesTabProps {
    playerId: number;
    teamId?: number;
    teamName?: string;
}

export function MatchesTab({ playerId, teamId }: MatchesTabProps) {
    const { data: appearances, isLoading } = usePlayerAppearances(playerId, teamId || 0);

    if (!teamId) {
        return <EmptyState icon={<Activity size={48} />} message="소속 팀 정보가 없습니다" />;
    }

    if (isLoading) return <Loading />;

    if (!appearances || appearances.length === 0) {
        return <EmptyState icon={<Activity size={48} />} message="출전 경기가 없습니다" />;
    }

    return (
        <div className={styles.matches}>
            <p className={styles.matchesInfo}>최근 출전 경기 ({appearances.length}경기)</p>
            <div className={styles.matchList}>
                {appearances.map(({ fixture: match, playerStats }) => {
                    const isHome = match.teams.home.id === teamId;
                    const opponent = isHome ? match.teams.away : match.teams.home;
                    const teamScore = isHome ? match.goals.home : match.goals.away;
                    const opponentScore = isHome ? match.goals.away : match.goals.home;
                    const isWin = (teamScore ?? 0) > (opponentScore ?? 0);
                    const isDraw = teamScore === opponentScore;
                    const stats = playerStats.statistics[0];
                    const goals = stats?.goals?.total || 0;
                    const assists = stats?.goals?.assists || 0;
                    const rating = stats?.games?.rating;

                    return (
                        <Link
                            key={match.fixture.id}
                            to={`/match/${match.fixture.id}`}
                            className={styles.matchItem}
                        >
                            <div className={styles.matchHeader}>
                                <span className={styles.matchDate}>
                                    {formatDate(match.fixture.date)}
                                </span>
                                {rating && (
                                    <span className={styles.matchRating}>
                                        {parseFloat(rating).toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <div className={styles.matchContent}>
                                <img
                                    src={match.league.logo}
                                    alt=""
                                    className={styles.matchLeagueLogo}
                                />
                                <div className={styles.matchOpponent}>
                                    <span className={styles.matchVs}>{isHome ? 'vs' : '@'}</span>
                                    <img src={opponent.logo} alt="" className={styles.matchTeamLogo} />
                                    <span className={styles.matchTeamName}>{opponent.name}</span>
                                </div>
                                <div className={styles.matchScore}>
                                    <span className={`${styles.matchResult} ${isWin ? styles.win : isDraw ? styles.draw : styles.lose}`}>
                                        {isWin ? 'W' : isDraw ? 'D' : 'L'}
                                    </span>
                                    <span className={styles.matchScoreText}>
                                        {teamScore} - {opponentScore}
                                    </span>
                                </div>
                            </div>
                            {(goals > 0 || assists > 0) && (
                                <div className={styles.matchContribution}>
                                    {goals > 0 && <span className={styles.matchGoal}>⚽ {goals}</span>}
                                    {assists > 0 && <span className={styles.matchAssist}>🅰️ {assists}</span>}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
