import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    useTeamLeagues,
    useTeamStandings,
    useLeagueFixtures,
} from '../../../hooks/useTeam';
import { Loading, EmptyState } from '../../../components/common';
import { TournamentBracket } from '../../../components/TournamentBracket';
import { GroupStandings } from '../../../components/GroupStandings';
import { isEuropeanCompetition } from '../../../constants/leagues';
import { BarChart2 } from 'lucide-react';
import styles from '../TeamDetail.module.css';

interface StandingsTabProps {
    teamId: number;
}

export function StandingsTab({ teamId }: StandingsTabProps) {
    const { data: leagues, isLoading: leaguesLoading } = useTeamLeagues(teamId);
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'standings' | 'tournament'>('standings');

    // 친선경기 제외 필터링
    const filteredLeagues = leagues?.filter(l =>
        l.league.type !== 'Friendly' &&
        !l.league.name.toLowerCase().includes('friendly') &&
        !l.league.name.toLowerCase().includes('friendlies')
    );

    // 첫 번째 리그 자동 선택
    const leagueId = selectedLeagueId || filteredLeagues?.[0]?.league.id;
    const selectedLeague = filteredLeagues?.find(l => l.league.id === leagueId);
    const isCup = selectedLeague?.league.type === 'Cup';
    const isEuropean = leagueId ? isEuropeanCompetition(leagueId) : false;

    const { data: standingsData, isLoading: standingsLoading } = useTeamStandings(
        teamId,
        leagueId || 0
    );

    // 컵 대회 또는 유럽 대회일 때 경기 목록 가져오기
    const { data: leagueFixtures, isLoading: fixturesLoading } = useLeagueFixtures(
        (isCup || isEuropean) ? (leagueId || 0) : 0
    );

    if (leaguesLoading) return <Loading />;

    if (!filteredLeagues || filteredLeagues.length === 0) {
        return <EmptyState icon={<BarChart2 size={48} />} message="참가 중인 리그 정보가 없습니다" />;
    }

    const isLoading = standingsLoading || fixturesLoading;
    const teamStanding = standingsData?.standing;
    const allStandings = standingsData?.allStandings;

    return (
        <div className={styles.standings}>
            {/* 리그 선택 */}
            <div className={styles.leagueSelector}>
                {filteredLeagues.map((l) => (
                    <button
                        key={l.league.id}
                        className={`${styles.leagueBtn} ${leagueId === l.league.id ? styles.active : ''}`}
                        onClick={() => {
                            setSelectedLeagueId(l.league.id);
                            setViewMode('standings');
                        }}
                    >
                        <img src={l.league.logo} alt="" className={styles.leagueLogo} />
                        <span className={styles.leagueName}>{l.league.name}</span>
                        {l.league.type === 'Cup' && <span className={styles.cupBadge}>🏆</span>}
                    </button>
                ))}
            </div>

            {/* 유럽 대회: 리그 페이즈/토너먼트 전환 버튼 */}
            {isEuropean && (
                <div className={styles.viewModeToggle}>
                    <button
                        className={`${styles.viewModeBtn} ${viewMode === 'standings' ? styles.active : ''}`}
                        onClick={() => setViewMode('standings')}
                    >
                        리그 페이즈
                    </button>
                    <button
                        className={`${styles.viewModeBtn} ${viewMode === 'tournament' ? styles.active : ''}`}
                        onClick={() => setViewMode('tournament')}
                    >
                        토너먼트
                    </button>
                </div>
            )}

            {isLoading ? (
                <Loading />
            ) : isEuropean ? (
                // 유럽 대회: 리그 페이즈 또는 토너먼트
                viewMode === 'standings' ? (
                    standingsData?.fullStandings ? (
                        <GroupStandings standings={standingsData.fullStandings} teamId={teamId} />
                    ) : (
                        <EmptyState icon={<BarChart2 size={48} />} message="리그 페이즈 정보가 없습니다" />
                    )
                ) : (
                    leagueFixtures && leagueFixtures.length > 0 ? (
                        <TournamentBracket fixtures={leagueFixtures} teamId={teamId} />
                    ) : (
                        <EmptyState icon={<BarChart2 size={48} />} message="토너먼트 정보가 없습니다" />
                    )
                )
            ) : isCup ? (
                // 일반 컵 대회: 토너먼트 브라켓만 표시
                leagueFixtures && leagueFixtures.length > 0 ? (
                    <TournamentBracket fixtures={leagueFixtures} teamId={teamId} />
                ) : (
                    <EmptyState icon={<BarChart2 size={48} />} message="토너먼트 정보가 없습니다" />
                )
            ) : !teamStanding ? (
                <EmptyState icon={<BarChart2 size={48} />} message="순위 정보가 없습니다" />
            ) : (
                <>
                    {/* 팀 순위 카드 */}
                    <div className={styles.rankCard}>
                        <div className={styles.rankNumber}>
                            {teamStanding.rank}
                            <span className={styles.rankSuffix}>위</span>
                        </div>
                        <div className={styles.rankLabel}>
                            {standingsData.league.name}
                        </div>
                        <div className={styles.rankStats}>
                            <div className={styles.rankStat}>
                                <span className={styles.rankStatValue}>{teamStanding.points}</span>
                                <span className={styles.rankStatLabel}>승점</span>
                            </div>
                            <div className={styles.rankStat}>
                                <span className={styles.rankStatValue}>{teamStanding.all.win}</span>
                                <span className={styles.rankStatLabel}>승</span>
                            </div>
                            <div className={styles.rankStat}>
                                <span className={styles.rankStatValue}>{teamStanding.all.draw}</span>
                                <span className={styles.rankStatLabel}>무</span>
                            </div>
                            <div className={styles.rankStat}>
                                <span className={styles.rankStatValue}>{teamStanding.all.lose}</span>
                                <span className={styles.rankStatLabel}>패</span>
                            </div>
                        </div>
                    </div>

                    {/* 전체 순위표 */}
                    {allStandings && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>리그 순위표</h3>
                            <table className={styles.standingsTable}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th style={{ textAlign: 'left' }}>팀</th>
                                        <th>경기</th>
                                        <th>승점</th>
                                        <th>득실</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStandings.map((s) => (
                                        <tr
                                            key={s.team.id}
                                            className={s.team.id === teamId ? styles.currentTeam : ''}
                                        >
                                            <td>{s.rank}</td>
                                            <td>
                                                <Link to={`/team/${s.team.id}`} className={styles.teamCell}>
                                                    <img
                                                        src={s.team.logo}
                                                        alt=""
                                                        className={styles.standingsTeamLogo}
                                                    />
                                                    <span className={styles.standingsTeamName}>
                                                        {s.team.name}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td>{s.all.played}</td>
                                            <td>{s.points}</td>
                                            <td>{s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
