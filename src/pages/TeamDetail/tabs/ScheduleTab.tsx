import { useTeamFixtures } from '../../../hooks/useTeam';
import { Loading, EmptyState } from '../../../components/common';
import { MatchCard } from '../../../components/MatchCard';
import { FINISHED_STATUSES } from '../../../constants/leagues';
import { Calendar } from 'lucide-react';
import styles from '../TeamDetail.module.css';

interface ScheduleTabProps {
    teamId: number;
}

export function ScheduleTab({ teamId }: ScheduleTabProps) {
    const { data: fixtures, isLoading } = useTeamFixtures(teamId);

    if (isLoading) return <Loading />;

    if (!fixtures || fixtures.length === 0) {
        return <EmptyState icon={<Calendar size={48} />} message="경기 일정이 없습니다" />;
    }

    // 날짜순 정렬 (최신 먼저)
    const sortedFixtures = [...fixtures].sort(
        (a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
    );

    // 종료된 경기와 예정된 경기 분리
    const now = new Date();
    const pastMatches = sortedFixtures.filter(
        (f) => FINISHED_STATUSES.has(f.fixture.status.short)
    ).slice(0, 10);
    const upcomingMatches = sortedFixtures
        .filter((f) => new Date(f.fixture.date) > now && !FINISHED_STATUSES.has(f.fixture.status.short))
        .reverse()
        .slice(0, 10);

    return (
        <div className={styles.schedule}>
            {upcomingMatches.length > 0 && (
                <div className={styles.scheduleSection}>
                    <h3 className={styles.sectionTitle}>예정된 경기</h3>
                    {upcomingMatches.map((match) => (
                        <MatchCard key={match.fixture.id} match={match} showDate />
                    ))}
                </div>
            )}

            {pastMatches.length > 0 && (
                <div className={styles.scheduleSection}>
                    <h3 className={styles.sectionTitle}>최근 경기</h3>
                    {pastMatches.map((match) => (
                        <MatchCard key={match.fixture.id} match={match} showDate />
                    ))}
                </div>
            )}
        </div>
    );
}
