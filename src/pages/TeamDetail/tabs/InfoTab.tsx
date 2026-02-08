import { useTeamInfo } from '../../../hooks/useTeam';
import styles from '../TeamDetail.module.css';

interface InfoTabProps {
    team: NonNullable<ReturnType<typeof useTeamInfo>['data']>;
}

export function InfoTab({ team }: InfoTabProps) {
    return (
        <div className={styles.info}>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>기본 정보</h3>
                <div className={styles.infoList}>
                    {team.founded && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>창단년도</span>
                            <span className={styles.infoValue}>{team.founded}년</span>
                        </div>
                    )}
                    {team.country && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>국가</span>
                            <span className={styles.infoValue}>{team.country}</span>
                        </div>
                    )}
                    {team.national !== undefined && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>유형</span>
                            <span className={styles.infoValue}>
                                {team.national ? '국가대표팀' : '클럽팀'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {team.venue && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>홈 경기장</h3>
                    {team.venue.image && (
                        <img
                            src={team.venue.image}
                            alt={team.venue.name}
                            className={styles.venueImage}
                        />
                    )}
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>경기장명</span>
                            <span className={styles.infoValue}>{team.venue.name}</span>
                        </div>
                        {team.venue.city && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>도시</span>
                                <span className={styles.infoValue}>{team.venue.city}</span>
                            </div>
                        )}
                        {team.venue.capacity && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>수용 인원</span>
                                <span className={styles.infoValue}>
                                    {team.venue.capacity.toLocaleString()}명
                                </span>
                            </div>
                        )}
                        {team.venue.surface && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>잔디</span>
                                <span className={styles.infoValue}>{team.venue.surface}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
