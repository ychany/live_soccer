import { useMatchStatistics, useMatchEvents } from '../../../hooks/useMatchDetail';
import { Loading, EmptyState } from '../../../components/common';
import { SectionHeader } from '../components/SectionHeader';
import { BarChart2, Timer, BarChart3 } from 'lucide-react';
import styles from '../MatchDetail.module.css';

interface StatsTabProps {
    fixtureId: number;
}

export function StatsTab({ fixtureId }: StatsTabProps) {
    const { data: stats, isLoading: statsLoading } = useMatchStatistics(fixtureId);
    const { data: events, isLoading: eventsLoading } = useMatchEvents(fixtureId);

    if (statsLoading || eventsLoading) return <Loading />;

    if (!stats || stats.length < 2) {
        return <EmptyState icon={<BarChart2 size={48} />} message="경기 통계가 아직 없습니다" />;
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
            <SectionHeader icon={<BarChart3 size={18} />} title="Stats" />
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
                    <SectionHeader icon={<Timer size={18} />} title="Timeline" />
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
