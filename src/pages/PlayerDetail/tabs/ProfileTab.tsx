import { usePlayerInfo, usePlayerSidelined } from '../../../hooks/usePlayer';
import { formatNumber } from '../../../utils/format';
import styles from '../PlayerDetail.module.css';

interface ProfileTabProps {
    player: NonNullable<ReturnType<typeof usePlayerInfo>['data']>;
}

export function ProfileTab({ player }: ProfileTabProps) {
    const { player: info, statistics } = player;
    const currentStats = statistics[0];
    const { data: sidelined } = usePlayerSidelined(info.id);

    return (
        <div className={styles.profile}>
            {/* 기본 정보 */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>기본 정보</h3>
                <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>이름</span>
                        <span className={styles.infoValue}>
                            {info.firstname} {info.lastname}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>생년월일</span>
                        <span className={styles.infoValue}>
                            {info.birth.date} ({info.age}세)
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>출생지</span>
                        <span className={styles.infoValue}>
                            {info.birth.place || '-'}, {info.birth.country}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>국적</span>
                        <span className={styles.infoValue}>{info.nationality}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>신장</span>
                        <span className={styles.infoValue}>{info.height || '-'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>체중</span>
                        <span className={styles.infoValue}>{info.weight || '-'}</span>
                    </div>
                    {info.injured && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>상태</span>
                            <span className={`${styles.infoValue} ${styles.injured}`}>부상</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 현재 시즌 통계 */}
            {currentStats && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        {currentStats.league.season} 시즌 통계
                    </h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statBox}>
                            <span className={styles.statValue}>
                                {formatNumber(currentStats.games.appearences)}
                            </span>
                            <span className={styles.statLabel}>출전</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statValue}>
                                {formatNumber(currentStats.goals.total)}
                            </span>
                            <span className={styles.statLabel}>골</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statValue}>
                                {formatNumber(currentStats.goals.assists)}
                            </span>
                            <span className={styles.statLabel}>도움</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statValue}>
                                {currentStats.games.rating
                                    ? parseFloat(currentStats.games.rating).toFixed(1)
                                    : '-'}
                            </span>
                            <span className={styles.statLabel}>평점</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 부상 이력 */}
            {sidelined && sidelined.length > 0 && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>부상/결장 이력</h3>
                    <div className={styles.sidelinedList}>
                        {sidelined.slice(0, 5).map((item, index) => (
                            <div key={index} className={styles.sidelinedItem}>
                                <span className={styles.sidelinedType}>{item.type}</span>
                                <span className={styles.sidelinedDate}>
                                    {item.start} ~ {item.end || '진행 중'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
