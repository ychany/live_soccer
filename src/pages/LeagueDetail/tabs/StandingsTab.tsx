import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    useLeagueStandings,
    useLeagueFixtures,
    useTopScorers,
    useTopAssists,
} from '../../../hooks/useLeague';
import { Loading, EmptyState } from '../../../components/common';
import { GroupStandings } from '../../../components/GroupStandings';
import { TournamentBracket } from '../../../components/TournamentBracket';
import { isEuropeanCompetition, isCupCompetition } from '../../../constants/leagues';
import type { TopScorer, StandingsResponse } from '../../../types/football';
import { BarChart2, Trophy, Activity } from 'lucide-react';
import styles from '../LeagueDetail.module.css';

// 순위 탭 - 서브탭 포함 (순위/득점/도움)
type StandingsSubTab = 'rank' | 'goals' | 'assists';
type ViewMode = 'standings' | 'tournament';

interface StandingsTabProps {
    leagueId: number;
    season: number;
}

export function StandingsTab({ leagueId, season }: StandingsTabProps) {
    const [subTab, setSubTab] = useState<StandingsSubTab>('rank');
    const [viewMode, setViewMode] = useState<ViewMode>('standings');
    const { data: standings, isLoading: standingsLoading } = useLeagueStandings(leagueId, season);
    const { data: fixtures, isLoading: fixturesLoading } = useLeagueFixtures(leagueId, season);
    const { data: topScorers, isLoading: scorersLoading } = useTopScorers(leagueId, season);
    const { data: topAssists, isLoading: assistsLoading } = useTopAssists(leagueId, season);

    const isEuropean = isEuropeanCompetition(leagueId);
    const isCup = isCupCompetition(leagueId);

    // 유럽 대회 - 리그 페이즈 / 토너먼트 표시
    if (isEuropean) {
        return (
            <div className={styles.standings}>
                {/* 뷰 모드 토글 */}
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

                {viewMode === 'standings' ? (
                    standingsLoading ? (
                        <Loading />
                    ) : standings ? (
                        <GroupStandings standings={standings as StandingsResponse} />
                    ) : (
                        <EmptyState icon={<BarChart2 size={48} />} message="순위 정보가 없습니다" />
                    )
                ) : (
                    fixturesLoading ? (
                        <Loading />
                    ) : fixtures && fixtures.length > 0 ? (
                        <TournamentBracket fixtures={fixtures} />
                    ) : (
                        <EmptyState icon={<Trophy size={48} />} message="토너먼트 경기가 없습니다" />
                    )
                )}
            </div>
        );
    }

    // 일반 컵대회 - 토너먼트만 표시
    if (isCup && !isEuropean) {
        return (
            <div className={styles.standings}>
                {fixturesLoading ? (
                    <Loading />
                ) : fixtures && fixtures.length > 0 ? (
                    <TournamentBracket fixtures={fixtures} />
                ) : (
                    <EmptyState icon={<Trophy size={48} />} message="토너먼트 경기가 없습니다" />
                )}
            </div>
        );
    }

    // 일반 리그 - 기존 로직
    return (
        <div className={styles.standings}>
            {/* 서브탭 */}
            <div className={styles.subTabBar}>
                <button
                    className={`${styles.subTabBtn} ${subTab === 'rank' ? styles.active : ''}`}
                    onClick={() => setSubTab('rank')}
                >
                    순위
                </button>
                <button
                    className={`${styles.subTabBtn} ${subTab === 'goals' ? styles.active : ''}`}
                    onClick={() => setSubTab('goals')}
                >
                    득점
                </button>
                <button
                    className={`${styles.subTabBtn} ${subTab === 'assists' ? styles.active : ''}`}
                    onClick={() => setSubTab('assists')}
                >
                    도움
                </button>
            </div>

            {/* 서브탭 콘텐츠 */}
            {subTab === 'rank' && (
                <RankTable standings={standings?.league.standings[0] || []} isLoading={standingsLoading} />
            )}
            {subTab === 'goals' && (
                <PlayerRankingList
                    players={topScorers || []}
                    isLoading={scorersLoading}
                    statKey="goals"
                    emptyMessage="득점 순위 정보가 없습니다"
                />
            )}
            {subTab === 'assists' && (
                <PlayerRankingList
                    players={topAssists || []}
                    isLoading={assistsLoading}
                    statKey="assists"
                    emptyMessage="도움 순위 정보가 없습니다"
                />
            )}
        </div>
    );
}

// 순위표
interface Standing {
    rank: number;
    team: { id: number; name: string; logo: string };
    points: number;
    goalsDiff: number;
    all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

function RankTable({ standings, isLoading }: { standings: Standing[]; isLoading: boolean }) {
    if (isLoading) return <Loading />;
    if (!standings || standings.length === 0) {
        return <EmptyState icon={<BarChart2 size={48} />} message="순위 정보가 없습니다" />;
    }

    return (
        <div className={styles.standingsTable}>
            <div className={styles.standingsHeader}>
                <span className={styles.colRank}>#</span>
                <span className={styles.colTeam}>팀</span>
                <span className={styles.colStat}>경기</span>
                <span className={styles.colStat}>승</span>
                <span className={styles.colStat}>무</span>
                <span className={styles.colStat}>패</span>
                <span className={styles.colStat}>득실</span>
                <span className={styles.colPts}>승점</span>
            </div>
            {standings.map((standing) => (
                <Link
                    key={standing.team.id}
                    to={`/team/${standing.team.id}`}
                    className={styles.standingsRow}
                >
                    <span className={`${styles.colRank} ${getRankClass(standing.rank, standings.length)}`}>
                        {standing.rank}
                    </span>
                    <span className={styles.colTeam}>
                        <img src={standing.team.logo} alt="" className={styles.teamLogoSm} />
                        <span className={styles.teamName}>{standing.team.name}</span>
                    </span>
                    <span className={styles.colStat}>{standing.all.played}</span>
                    <span className={styles.colStat}>{standing.all.win}</span>
                    <span className={styles.colStat}>{standing.all.draw}</span>
                    <span className={styles.colStat}>{standing.all.lose}</span>
                    <span className={styles.colStat}>
                        {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
                    </span>
                    <span className={styles.colPts}>{standing.points}</span>
                </Link>
            ))}
        </div>
    );
}

function getRankClass(rank: number, total: number): string {
    if (rank <= 4) return styles.rankUcl;
    if (rank <= 6) return styles.rankUel;
    if (rank > total - 3) return styles.rankRelegation;
    return '';
}

// 선수 순위 리스트
interface PlayerRankingListProps {
    players: TopScorer[];
    isLoading: boolean;
    statKey: 'goals' | 'assists';
    emptyMessage: string;
}

function PlayerRankingList({ players, isLoading, statKey, emptyMessage }: PlayerRankingListProps) {
    if (isLoading) return <Loading />;
    if (!players || players.length === 0) {
        return <EmptyState icon={<Activity size={48} />} message={emptyMessage} />;
    }

    return (
        <div className={styles.playerRanking}>
            {players.map((item, idx) => {
                const stat = statKey === 'goals'
                    ? item.statistics[0]?.goals?.total ?? 0
                    : item.statistics[0]?.goals?.assists ?? 0;
                const appearances = item.statistics[0]?.games?.appearences ?? 0;

                return (
                    <Link
                        key={item.player.id}
                        to={`/player/${item.player.id}`}
                        className={styles.rankingItem}
                    >
                        <span className={`${styles.rankingRank} ${getRankBadgeClass(idx + 1)}`}>
                            {idx + 1}
                        </span>
                        <img
                            src={item.player.photo}
                            alt=""
                            className={styles.rankingPhoto}
                        />
                        <div className={styles.rankingInfo}>
                            <span className={styles.rankingName}>{item.player.name}</span>
                            <span className={styles.rankingTeam}>{item.statistics[0]?.team?.name}</span>
                        </div>
                        <span className={styles.rankingApps}>{appearances}경기</span>
                        <span className={styles.rankingValue}>{stat}</span>
                    </Link>
                );
            })}
        </div>
    );
}

function getRankBadgeClass(rank: number): string {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return '';
}
