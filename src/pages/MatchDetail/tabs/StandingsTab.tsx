import { Link } from 'react-router-dom';
import { useLeagueStandings } from '../../../hooks/useLeague';
import { Loading, EmptyState } from '../../../components/common';
import { SectionHeader } from '../components/SectionHeader';
import styles from '../MatchDetail.module.css';

interface StandingsTabProps {
    leagueId: number;
    season: number;
    homeTeamId?: number;
    awayTeamId?: number;
}

export function StandingsTab({
    leagueId,
    season,
    homeTeamId,
    awayTeamId,
}: StandingsTabProps) {
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
