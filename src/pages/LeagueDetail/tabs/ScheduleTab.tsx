import { useState } from 'react';
import { useLeagueFixtures } from '../../../hooks/useLeague';
import { Loading, EmptyState } from '../../../components/common';
import { MatchCard } from '../../../components/MatchCard';
import { FINISHED_STATUSES } from '../../../constants/leagues';
import { Calendar } from 'lucide-react';
import styles from '../LeagueDetail.module.css';

interface ScheduleTabProps {
    leagueId: number;
    season: number;
}

export function ScheduleTab({ leagueId, season }: ScheduleTabProps) {
    const { data: fixtures, isLoading } = useLeagueFixtures(leagueId, season);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

    if (isLoading) return <Loading />;

    if (!fixtures || fixtures.length === 0) {
        return <EmptyState icon={<Calendar size={48} />} message="경기 일정이 없습니다" />;
    }

    const now = new Date();
    const sortedFixtures = [...fixtures].sort(
        (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );

    const upcomingMatches = sortedFixtures.filter(
        (f) => new Date(f.fixture.date) > now && !FINISHED_STATUSES.has(f.fixture.status.short)
    );
    const pastMatches = sortedFixtures
        .filter((f) => FINISHED_STATUSES.has(f.fixture.status.short))
        .reverse();

    const displayMatches =
        filter === 'all'
            ? sortedFixtures
            : filter === 'upcoming'
                ? upcomingMatches.slice(0, 20)
                : pastMatches.slice(0, 20);

    return (
        <div className={styles.schedule}>
            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterBtn} ${filter === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setFilter('upcoming')}
                >
                    예정
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'past' ? styles.active : ''}`}
                    onClick={() => setFilter('past')}
                >
                    결과
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    전체
                </button>
            </div>

            {displayMatches.length === 0 ? (
                <EmptyState icon={<Calendar size={48} />} message="해당하는 경기가 없습니다" />
            ) : (
                <div className={styles.matchList}>
                    {displayMatches.map((match) => (
                        <MatchCard key={match.fixture.id} match={match} showDate />
                    ))}
                </div>
            )}
        </div>
    );
}
