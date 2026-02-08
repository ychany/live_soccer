import React from 'react';
import { Link } from 'react-router-dom';
import { useMatchLineups, useMatchDetail } from '../../../hooks/useMatchDetail';
import { Loading, EmptyState } from '../../../components/common';
import { SectionHeader } from '../components/SectionHeader';
import { Users, Repeat, User } from 'lucide-react';
import styles from '../MatchDetail.module.css';

interface LineupTabProps {
    fixtureId: number;
    match: NonNullable<ReturnType<typeof useMatchDetail>['data']>;
}

export function LineupTab({ fixtureId, match }: LineupTabProps) {
    const { data: lineups, isLoading } = useMatchLineups(fixtureId);

    if (isLoading) return <Loading />;

    if (!lineups || lineups.length < 2) {
        return <EmptyState icon={<Users size={48} />} message="라인업 정보가 아직 없습니다" />;
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
                            <div className={styles.playerPhoto}>
                                <img
                                    src={`https://media.api-sports.io/football/players/${player.id}.png`}
                                    alt={player.name}
                                    onError={(e) => {
                                        // 이미지 로드 실패 시 등번호 표시
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
                                    }}
                                />
                                <span className={`${styles.playerNumberFallback} ${styles.hidden}`}>{player.number}</span>
                            </div>
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
                            <div className={styles.playerPhoto}>
                                <img
                                    src={`https://media.api-sports.io/football/players/${player.id}.png`}
                                    alt={player.name}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
                                    }}
                                />
                                <span className={`${styles.playerNumberFallback} ${styles.hidden}`}>{player.number}</span>
                            </div>
                            <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 교체 선수 */}
            <SectionHeader icon={<Repeat size={18} />} title="교체 선수" />
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
            <SectionHeader icon={<User size={18} />} title="감독" />
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
